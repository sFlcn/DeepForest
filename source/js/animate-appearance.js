function isPartiallyVisible(element) {
  const { bottom, height } = element.getBoundingClientRect();
  return (bottom - height < window.innerHeight);
}

export default function animateAppearance(elementsCssClass, throttleTimer) {
  const elementsList = document.querySelectorAll(`.${elementsCssClass}`);
  if (!elementsList) { return; }

  function scrollingResolve() {
    elementsList.forEach((element) => {
      if (isPartiallyVisible(element)) {
        element.classList.remove(`${elementsCssClass}--hidden`);
        element.classList.add(`${elementsCssClass}--shown`);
      }
    });
  }

  let isThrottle = false;

  function throttledScroll() {
    if (isThrottle) { return; }

    isThrottle = true;

    setTimeout(() => {
      scrollingResolve(elementsList, elementsCssClass);
      isThrottle = false;
    }, throttleTimer);
  }

  elementsList.forEach((element) => { element.classList.add(`${elementsCssClass}--hidden`); });
  window.addEventListener('scroll', throttledScroll);
  document.addEventListener('DOMContentLoaded', scrollingResolve);
}
