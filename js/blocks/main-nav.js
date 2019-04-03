const nav = document.querySelector(`.main-nav`);
const toggleMenuBtn = nav.querySelector(`.main-nav__toggle`);
toggleMenuBtn.addEventListener(`click`, () => {
  nav.classList.toggle(`main-nav--shown`);
});
