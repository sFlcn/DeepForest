export default function startSinuslider({canvasEl, imagesArr, slice = 2, speed = 0.05, amplitude = 20, intens = 7, sliderTimer = 3500}) {
  const ctx = canvasEl.getContext('2d');
  const canvasWidth = canvasEl.width;
  const canvasHeight = canvasEl.height;
  const imgWidth = imagesArr[0].width;
  const imgHeight = imagesArr[0].height;
  
  let imageXShift = (imgWidth - canvasWidth) / 2;
  let imageYShift = (imgHeight - canvasHeight) / 2;
  let imageFactor = 1;
  if (imageXShift < 0 && imageXShift < imageYShift) {
    imageXShift = 0;
    imageFactor = canvasWidth / imgWidth;
  } else if (imageYShift < 0) {
    imageYShift = 0;
    imageFactor = canvasHeight / imgHeight;
  }

  function nextImage(num) {
    return num < (imagesArr.length - 1) ? (num + 1) : 0;
  }

  let timer = 0;
  let alpha = 0;
  const alphaIncrement = sliderTimer / 4000000;
  let currentSlide = 0;
  let slideIsChanging = false;

  function changeSlide() {
    slideIsChanging = true;
    const timoutId = setTimeout(
      () => {
        slideIsChanging = false;
        currentSlide = nextImage(currentSlide);
        setSliderTimer();
      },
      (sliderTimer / 2 + 2)
    );
  }

  function setSliderTimer() {
    slideIsChanging = false;
    const timoutId = setTimeout(changeSlide, sliderTimer);
  }

  function draw() {
    timer += speed;
    alpha = (slideIsChanging) ? (alpha += alphaIncrement) : 0;
    let currentImage;

    if (slideIsChanging) {
      ctx.globalAlpha = alpha;
      currentImage = imagesArr[nextImage(currentSlide)];
    } else {
      ctx.globalAlpha = 1;
      currentImage = imagesArr[currentSlide];
    }

    for (let i = 0; i < (imgWidth / slice); i++) {
      ctx.drawImage(
        // imagesArr[0 + (i % 2)],
        currentImage,

        (slice * i + imageXShift),
        0,

        slice + 1,
        imgHeight,

        slice * i * imageFactor,
        (Math.sin(timer - (i / (amplitude * imageFactor))) * (intens / (imageFactor * 3)) + imageYShift) * imageFactor,
        slice * imageFactor,
        imgHeight * imageFactor,
      );
    }

    requestAnimationFrame(draw);
  }

  draw();
  setSliderTimer()
}
