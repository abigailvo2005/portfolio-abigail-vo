// ------------------------------------------------
// Author: dimsemenov (modified)
// Author URI: https://github.com/dimsemenov
// File name: gallery-init.js
// https://codepen.io/dimsemenov/pen/ZYbPJM
//
// CUSTOM CHANGES:
//  1. Each <figure> is now its own album: the cover link (a.gallery__link)
//     plus any extra links (a.gallery__extra[hidden]) become the slides.
//  2. Share menu only shows "Download image".
// ------------------------------------------------

var initPhotoSwipeFromDOM = function(gallerySelector) {

    // parse slide data (url, title, size ...) from ONE <figure>
    // every <a data-size="WxH"> inside the figure becomes a slide
    var parseFigureElement = function(figureEl) {
        var captionEl = figureEl.querySelector('figcaption'),
            linkEls = figureEl.querySelectorAll('a[data-size]'),
            items = [],
            linkEl,
            size,
            item;

        for(var i = 0; i < linkEls.length; i++) {
            linkEl = linkEls[i];
            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10),
                // thumbnail shown while the full image loads
                msrc: linkEl.getAttribute('data-image')
            };

            // same <figcaption> content for every slide of the album
            if(captionEl) {
                item.title = captionEl.innerHTML;
            }

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        // always start from the first (cover) image of the album
        openPhotoSwipe( 0, clickedListItem );
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');
            if(pair.length < 2) {
                continue;
            }
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    // figureEl = the album (one <figure>) to open
    var openPhotoSwipe = function(index, figureEl, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseFigureElement(figureEl);

        // define options (if needed)
        options = {

            showHideOpacity: true,

            // gallery index (for URL) - now one uid per <figure>
            galleryUID: figureEl.getAttribute('data-pswp-uid'),

            // Share menu: only "Download image"
            shareButtons: [
                {
                    id: 'download',
                    label: 'Download image',
                    url: '{{raw_image_url}}',
                    download: true
                }
            ],

            getThumbBoundsFn: function(index) {
                // zoom to/from the cover image of the album
                var thumbnail = figureEl.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect();

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            // in URL indexes start from 1
            options.index = parseInt(index, 10) - 1;
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) || options.index < 0 || options.index >= items.length ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector ),
        uid = 0;

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        // give every <figure> (album) its own uid, counting across all galleries
        var figures = galleryElements[i].querySelectorAll('figure');
        for(var f = 0; f < figures.length; f++) {
            uid++;
            figures[f].setAttribute('data-pswp-uid', uid);
        }
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open album if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        var figureFromUrl = document.querySelector(
            gallerySelector + ' figure[data-pswp-uid="' + hashData.gid + '"]'
        );
        if(figureFromUrl) {
            openPhotoSwipe( hashData.pid, figureFromUrl, true, true );
        }
    }
};

// execute above function
initPhotoSwipeFromDOM('.my-gallery');