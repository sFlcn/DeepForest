import animateAccordion from './accordion-animation';

document.querySelectorAll('.accordion-content').forEach((el) => { el.classList.add('accordion-content--hidden'); });
document.querySelectorAll('.accordion-box').forEach((el) => { animateAccordion(el, 'accordion--open'); });
