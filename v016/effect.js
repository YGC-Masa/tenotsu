// effect.js - v16対応：各種表示効果定義

window.effects = {
  fadein: (el) => {
    el.style.opacity = 0;
    el.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 1;
    });
  },

  fadeout: (el) => {
    el.style.opacity = 1;
    el.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 0;
    });
  },

  slideleft: (el) => {
    el.style.opacity = 0;
    el.style.transform = "translateX(100%)";
    el.style.transition = "all 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 1;
      el.style.transform = "translateX(0)";
    });
  },

  slideright: (el) => {
    el.style.opacity = 0;
    el.style.transform = "translateX(-100%)";
    el.style.transition = "all 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 1;
      el.style.transform = "translateX(0)";
    });
  },

  whitein: (el) => {
    el.style.transition = "none";
    el.style.opacity = 0;
    el.style.backgroundColor = "#fff";
    el.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 1;
    });
  },

  blackin: (el) => {
    el.style.transition = "none";
    el.style.opacity = 0;
    el.style.backgroundColor = "#000";
    el.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 1;
    });
  },

  whiteout: (el) => {
    el.style.transition = "none";
    el.style.opacity = 1;
    el.style.backgroundColor = "#fff";
    el.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 0;
    });
  },

  blackout: (el) => {
    el.style.transition = "none";
    el.style.opacity = 1;
    el.style.backgroundColor = "#000";
    el.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 0;
    });
  }
};
