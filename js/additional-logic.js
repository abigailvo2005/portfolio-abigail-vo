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
