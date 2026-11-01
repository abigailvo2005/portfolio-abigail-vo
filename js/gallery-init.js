// ------------------------------------------------
// Author: dimsemenov (modified)
// Author URI: https://github.com/dimsemenov
// File name: gallery-init.js
// https://codepen.io/dimsemenov/pen/ZYbPJM
//
// CUSTOM CHANGES:
//  1. Mỗi <figure> là 1 album. Slide của album = các link a.gallery__extra
//     (nếu không có extra thì dùng chính a.gallery__link). Ảnh bìa KHÔNG bị đếm thêm.
//  2. Link có href rỗng hoặc "#" bị bỏ qua (tránh slide "không load được").
//  3. Kích thước ảnh tự đo từ file thật => không cần/không dùng data-size nữa,
//     ảnh không còn bị bè/dẹt dù khai báo sai.
//  4. Badge "n ảnh" (data-count) tự tính theo số slide thật.
//  5. Share chỉ còn "Download image".
// ------------------------------------------------

var initPhotoSwipeFromDOM = function (gallerySelector) {
  // các link tạo thành slide của 1 album (figure)
  var getSlideLinks = function (figureEl) {
    var links = figureEl.querySelectorAll("a.gallery__extra");
    if (!links.length) {
      links = figureEl.querySelectorAll("a.gallery__link");
    }
    return Array.prototype.filter.call(links, function (linkEl) {
      var href = linkEl.getAttribute("href");
      return href && href !== "#";
    });
  };

  // parse slide data (url, title ...) from ONE <figure>
  var parseFigureElement = function (figureEl) {
    var captionEl = figureEl.querySelector("figcaption"),
      linkEls = getSlideLinks(figureEl),
      items = [],
      linkEl,
      item;

    for (var i = 0; i < linkEls.length; i++) {
      linkEl = linkEls[i];

      item = {
        src: linkEl.getAttribute("href"),
        // w/h = 0: kích thước sẽ được đo từ ảnh thật (xem loadSize / gettingData)
        w: 0,
        h: 0,
        // ảnh tạm hiện trong lúc ảnh lớn đang tải
        msrc: linkEl.getAttribute("data-image") || linkEl.getAttribute("href"),
      };

      // cùng 1 <figcaption> cho mọi slide của album
      if (captionEl) {
        item.title = captionEl.innerHTML;
      }

      item.el = figureEl; // save link to element for getThumbBoundsFn
      items.push(item);
    }

    return items;
  };

  // đo kích thước thật của 1 ảnh rồi gọi done()
  var loadSize = function (item, done) {
    if (item.w > 0 && item.h > 0) {
      done();
      return;
    }
    var img = new Image();
    img.onload = function () {
      item.w = img.naturalWidth;
      item.h = img.naturalHeight;
      done();
    };
    img.onerror = function () {
      // ảnh lỗi: để PhotoSwipe tự hiện thông báo lỗi, tránh kẹt
      item.w = 1200;
      item.h = 800;
      done();
    };
    img.src = item.src;
  };

  // find nearest parent element
  var closest = function closest(el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn));
  };

  // triggers when user clicks on thumbnail
  var onThumbnailsClick = function (e) {
    e = e || window.event;

    var eTarget = e.target || e.srcElement;

    // find root element of slide
    var clickedListItem = closest(eTarget, function (el) {
      return el.tagName && el.tagName.toUpperCase() === "FIGURE";
    });

    if (!clickedListItem) {
      return;
    }

    e.preventDefault ? e.preventDefault() : (e.returnValue = false);

    // always start from the first image of the album
    openPhotoSwipe(0, clickedListItem);
    return false;
  };

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  var photoswipeParseHash = function () {
    var hash = window.location.hash.substring(1),
      params = {};

    if (hash.length < 5) {
      return params;
    }

    var vars = hash.split("&");
    for (var i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue;
      }
      var pair = vars[i].split("=");
      if (pair.length < 2) {
        continue;
      }
      params[pair[0]] = pair[1];
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  };

  // figureEl = the album (one <figure>) to open
  var openPhotoSwipe = function (index, figureEl, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll(".pswp")[0],
      gallery,
      options,
      items;

    items = parseFigureElement(figureEl);

    if (!items.length) {
      return;
    }

    // define options (if needed)
    options = {
      showHideOpacity: true,

      // gallery index (for URL) - one uid per <figure>
      galleryUID: figureEl.getAttribute("data-pswp-uid"),

      // Share menu: only "Download image"
      shareButtons: [
        {
          id: "download",
          label: "Download image",
          url: "{{raw_image_url}}",
          download: true,
        },
      ],

      getThumbBoundsFn: function (index) {
        // zoom to/from the cover image of the album
        var thumbnail = figureEl.getElementsByTagName("img")[0], // find thumbnail
          pageYScroll =
            window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect();

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      },
    };

    // PhotoSwipe opened from URL
    if (fromURL) {
      // in URL indexes start from 1
      options.index = parseInt(index, 10) - 1;
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if (
      isNaN(options.index) ||
      options.index < 0 ||
      options.index >= items.length
    ) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // đo ảnh đầu tiên sẽ hiện (để animation mở đúng tỉ lệ), rồi mới mở lightbox
    loadSize(items[options.index], function () {
      gallery = new PhotoSwipe(
        pswpElement,
        PhotoSwipeUI_Default,
        items,
        options,
      );

      // các ảnh còn lại: đo lười, khi PhotoSwipe cần tới thì mới đo
      gallery.listen("gettingData", function (index, item) {
        if (item.w < 1 || item.h < 1) {
          var img = new Image();
          img.onload = function () {
            item.w = img.naturalWidth;
            item.h = img.naturalHeight;
            gallery.invalidateCurrItems();
            gallery.updateSize(true);
          };
          img.src = item.src;
        }
      });

      gallery.init();
    });
  };

  // loop through all gallery elements and bind events
  var galleryElements = document.querySelectorAll(gallerySelector),
    uid = 0;

  for (var i = 0, l = galleryElements.length; i < l; i++) {
    var figures = galleryElements[i].querySelectorAll("figure");
    for (var f = 0; f < figures.length; f++) {
      uid++;
      figures[f].setAttribute("data-pswp-uid", uid);

      // badge "n ảnh": tự đếm theo số slide thật, không cần ghi tay data-count
      var coverEl = figures[f].querySelector("a.gallery__link");
      if (coverEl) {
        var total = getSlideLinks(figures[f]).length;
        if (total > 1) {
          coverEl.setAttribute("data-count", total);
        } else {
          coverEl.removeAttribute("data-count");
        }
      }
    }
    galleryElements[i].onclick = onThumbnailsClick;
  }

  // Parse URL and open album if it contains #&pid=3&gid=1
  var hashData = photoswipeParseHash();
  if (hashData.pid && hashData.gid) {
    var figureFromUrl = document.querySelector(
      gallerySelector + ' figure[data-pswp-uid="' + hashData.gid + '"]',
    );
    if (figureFromUrl) {
      openPhotoSwipe(hashData.pid, figureFromUrl, true, true);
    }
  }
};

// execute above function
initPhotoSwipeFromDOM(".my-gallery");
