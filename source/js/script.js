import animateAccordion from './accordion-animation';
import startSinuslider from './sinus-animation-slider';

document.querySelectorAll('.accordion-content').forEach((el) => { el.classList.add('accordion-content--hidden'); });
document.querySelectorAll('.accordion-box').forEach((el) => { animateAccordion(el, 'accordion--open'); });

// header animation
function initiateHeaderAnimation() {
  const headerCanvas = document.querySelector('#header__slide-canvas');
  const headerSlides = Array.from(document.querySelectorAll('.header__slide img'));
  
  headerCanvas.setAttribute('width', headerSlides[0].width);
  headerCanvas.setAttribute('height', headerSlides[0].height);
  
  const slideLoadListeners = headerSlides.map(slide => {
    new Promise(resolve => {
      slide.addEventListener('load', resolve, { once: true });
    })
  });

  Promise.all(slideLoadListeners).then(
    () => {
      const imagesArr = headerSlides.map(slide => {
        const image = new Image();
        image.src = slide.currentSrc;
        return image;
      });
      startSinuslider({ imagesArr: imagesArr, canvasEl: headerCanvas});
    },
    // on fail
    () => { headerCanvas.remove() }
  );
}

initiateHeaderAnimation();
window.addEventListener("resize", initiateHeaderAnimation);
