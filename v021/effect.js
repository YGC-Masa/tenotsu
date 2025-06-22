// effect.js

function waitForTransition(el) {
  return new Promise((resolve) => {
    const handler = () => {
      el.removeEventListener("transitionend", handler);
      resolve();
    };
    el.addEventListener("transitionend", handler);
  });
}

function fadein(el) {
  el.style.opacity = 0;
  el.style.transition = "opacity 0.5s";
  requestAnimationFrame(() => {
    el.style.opacity = 1;
  });
  return waitForTransition(el);
}

function fadeout(el) {
  el.style.opacity = 1;
  el.style.transition = "opacity 0.5s";
  requestAnimationFrame(() => {
    el.style.opacity = 0;
  });
  return waitForTransition(el);
}

function whitein(el) {
  el.style.transition = "opacity 0.5s";
  el.style.opacity = 0;
  el.style.backgroundColor = "#FFF";
  requestAnimationFrame(() => {
    el.style.opacity = 1;
  });
  return waitForTransition(el);
}

function blackin(el) {
  el.style.transition = "opacity 0.5s";
  el.style.opacity = 0;
  el.style.backgroundColor = "#000";
  requestAnimationFrame(() => {
    el.style.opacity = 1;
  });
  return waitForTransition(el);
}

function slideleft(el) {
  el.style.opacity = 0;
  el.style.transform = "translateX(50px)";
  el.style.transition = "transform 0.5s, opacity 0.5s";
  requestAnimationFrame(() => {
    el.style.opacity = 1;
    el.style.transform = "translateX(0)";
  });
  return waitForTransition(el);
}

function slideright(el) {
  el.style.opacity = 0;
  el.style.transform = "translateX(-50px)";
  el.style.transition = "transform 0.5s, opacity 0.5s";
  requestAnimationFrame(() => {
    el.style.opacity = 1;
    el.style.transform = "translateX(0)";
  });
  return waitForTransition(el);
}

window.effects = {
  fadein,
  fadeout,
  whitein,
  blackin,
  slideleft,
  slideright,
};
