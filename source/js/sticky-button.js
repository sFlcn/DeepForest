export default function stickButton({ targetEl, cssClassSticked, scrollDistance }) {

  const el = targetEl;

  if (el) {
    window.onscroll = function handeleStick() {
      if (window.scrollY >= scrollDistance) {
        el.classList.add(cssClassSticked);
      } else {
        el.classList.remove(cssClassSticked);
      }
    };
  }
}
