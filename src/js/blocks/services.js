const btns = document.querySelectorAll(`.services__list-item-btn`);

btns.forEach((btn) => {
  btn.addEventListener(`click`, (evt) => {
    evt.preventDefault();
    const service = btn.closest(`.services__list-item`);
    service.classList.toggle(`services__list-item--active`);
  });
});
