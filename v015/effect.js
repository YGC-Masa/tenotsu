// effect.js - v015-04 統合版

const effects = {
  fadein: (el) => {
    el.style.opacity = "0";
    requestAnimationFrame(() => {
      el.style.opacity = "1";
    });
  },

  fadeout: (el) => {
    el.style.opacity = "1";
    requestAnimationFrame(() => {
      el.style.opacity = "0";
    });
  },

  whitein: (el) => {
    el.style.transition = "background-color 0.5s ease";
    el.style.backgroundColor = "rgba(255,255,255,0)";
    requestAnimationFrame(() => {
      el.style.backgroundColor = "rgba(255,255,255,1)";
    });
  },

  whiteout: (el) => {
    el.style.transition = "background-color 0.5s ease";
    el.style.backgroundColor = "rgba(255,255,255,1)";
    requestAnimationFrame(() => {
      el.style.backgroundColor = "rgba(255,255,255,0)";
    });
  },

  blackin: (el) => {
    el.style.transition = "background-color 0.5s ease";
    el.style.backgroundColor = "rgba(0,0,0,0)";
    requestAnimationFrame(() => {
      el.style.backgroundColor = "rgba(0,0,0,1)";
    });
  },

  blackout: (el) => {
    el.style.transition = "background-color 0.5s ease";
    el.style.backgroundColor = "rgba(0,0,0,1)";
    requestAnimationFrame(() => {
      el.style.backgroundColor = "rgba(0,0,0,0)";
    });
  },

  slideleft: (el) => {
    el.style.transform = "translateX(100%)";
    el.style.opacity = "0";
    requestAnimationFrame(() => {
      el.style.transform = "translateX(0)";
      el.style.opacity = "1";
    });
  },

  slideright: (el) => {
    el.style.transform = "translateX(-100%)";
    el.style.opacity = "0";
    requestAnimationFrame(() => {
      el.style.transform = "translateX(0)";
      el.style.opacity = "1";
    });
  }
};

if (typeof window !== "undefined") {
  window.effects = effects;
}
