// ROTATING DESCRIPTION
const words = document.querySelectorAll(".rotator__word");
let current = 0;

setInterval(() => {
  const prev = words[current];
  prev.classList.remove("is-active");
  prev.classList.add("is-leaving");

  current = (current + 1) % words.length; // hết cụm cuối thì quay lại cụm đầu
  words[current].classList.add("is-active");

  // dọn class để cụm cũ quay về vị trí chờ bên dưới
  setTimeout(() => prev.classList.remove("is-leaving"), 600);
}, 2500); // 2500 = 2,5 giây, chỉnh số này để nhanh/chậm

// ------------------------------------------------
// PORTFOLIO PROJECT MODAL
// Dán vào CUỐI additional-logic.js (hoặc file JS riêng nạp sau app.js)
// ------------------------------------------------
document.querySelectorAll("[data-open-project]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var dlg = document.getElementById(btn.dataset.openProject);
    if (!dlg) return;
    dlg.showModal(); // mở hộp chi tiết (tự có phím ESC, tự khoá tab focus)
    document.documentElement.classList.add("has-modal");
  });
});

document.querySelectorAll(".project-modal").forEach(function (dlg) {
  // bấm nút X hoặc bấm ra nền tối bên ngoài => đóng
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg || e.target.closest("[data-close-project]"))
      dlg.close();
  });

  // mở khoá cuộn trang khi đóng (kể cả đóng bằng ESC)
  dlg.addEventListener("close", function () {
    document.documentElement.classList.remove("has-modal");
    dlg.querySelector(".project-modal__scroll").scrollTop = 0;
  });

  // chặn Lenis (cuộn mượt của theme) cướp con lăn chuột bên trong hộp
  dlg.addEventListener(
    "wheel",
    function (e) {
      e.stopPropagation();
    },
    { passive: true },
  );
});

// ------------------------------------------------
// CONTACT FORM (GitHub Pages không chạy được PHP -> gửi qua Web3Forms)
// 1) Vào https://web3forms.com, nhập email nhận thư, lấy Access Key gửi về hộp thư
// 2) Dán key vào dòng dưới
// ------------------------------------------------
var WEB3FORMS_KEY = "522897e1-fe0f-4c42-8dc2-7477f1696b2f";

(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var formBox = document.querySelector(".contact .form");
  var replyBox = document.querySelector(".contact .form__reply");

  form.addEventListener(
    "submit",
    function (e) {
      e.preventDefault();
      e.stopImmediatePropagation(); // chặn handler cũ của theme (đang gửi tới mail.php => lỗi 405)

      var btn = form.querySelector('button[type="submit"]');
      var data = new FormData(form);

      // đổi tên field cho đúng chuẩn Web3Forms
      data.append("access_key", WEB3FORMS_KEY);
      data.set(
        "subject",
        data.get("form_subject") || "Tin nhắn mới từ Portfolio",
      );
      data.set("from_name", data.get("project_name") || "Portfolio");
      data.delete("form_subject");
      data.delete("project_name");
      data.delete("admin_email"); // email nhận đã gắn với access key

      btn.disabled = true;

      fetch("https://api.web3forms.com/submit", { method: "POST", body: data })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          if (!res.success) throw new Error(res.message || "Gửi thất bại");
          // hiện hộp "Đã gửi thành công!" rồi 5 giây sau trả form về
          formBox.classList.add("is-hidden");
          replyBox.classList.add("is-visible");
          form.reset();
          setTimeout(function () {
            replyBox.classList.remove("is-visible");
            formBox.classList.remove("is-hidden");
          }, 5000);
        })
        .catch(function (err) {
          console.error("Contact form error:", err);
          alert(
            "Chưa gửi được tin nhắn. Bạn thử lại sau hoặc nhắn mình qua TikTok / Facebook nhé!",
          );
        })
        .finally(function () {
          btn.disabled = false;
        });
    },
    true, // capture: chạy trước handler của theme
  );
})();
