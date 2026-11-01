// ROTATING DESCRIPTION
  const words = document.querySelectorAll(".rotator__word");
  let current = 0;

  setInterval(() => {
    const prev = words[current];
    prev.classList.remove("is-active");
    prev.classList.add("is-leaving");

    current = (current + 1) % words.length;   // hết cụm cuối thì quay lại cụm đầu
    words[current].classList.add("is-active");

    // dọn class để cụm cũ quay về vị trí chờ bên dưới
    setTimeout(() => prev.classList.remove("is-leaving"), 600);
  }, 2500);   // 2500 = 2,5 giây, chỉnh số này để nhanh/chậm
