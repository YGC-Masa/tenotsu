// effect.js - v021 同期対応版
window.effects = {
  fadein: (el) => {
    return new Promise((resolve) => {
      el.style.opacity = 0;
      el.style.transition = "opacity 0.5s";
      requestAnimationFrame(() => {
        el.style.opacity = 1;
      });
      el.addEventListener("transitionend", function handler() {
        el.removeEventListener("transitionend", handler);
        resolve();
      });
    });
  },

  fadeout: (el) => {
    return new Promise((resolve) => {
      el.style.opacity = 1;
      el.style.transition = "opacity 0.5s";
      requestAnimationFrame(() => {
        el.style.opacity = 0;
      });
      el.addEventListener("transitionend", function handler() {
        el.removeEventListener("transitionend", handler);
        resolve();
      });
    });
  },

  whitein: (el) => {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.background = "#fff";
      overlay.style.zIndex = 99;
      overlay.style.opacity = 1;
      overlay.style.transition = "opacity 0.5s";
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.opacity = 0;
      });
      overlay.addEventListener("transitionend", () => {
        overlay.remove();
        resolve();
      });
    });
  },

  blackin: (el) => {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.background = "#000";
      overlay.style.zIndex = 99;
      overlay.style.opacity = 1;
      overlay.style.transition = "opacity 0.5s";
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.opacity = 0;
      });
      overlay.addEventListener("transitionend", () => {
        overlay.remove();
        resolve();
      });
    });
  },

  slideleft: (el) => {
    return new Promise((resolve) => {
      el.style.transform = "translateX(100%)";
      el.style.transition = "transform 0.5s";
      requestAnimationFrame(() => {
        el.style.transform = "translateX(0)";
      });
      el.addEventListener("transitionend", function handler() {
        el.removeEventListener("transitionend", handler);
        resolve();
      });
    });
  },

  slideright: (el) => {
    return new Promise((resolve) => {
      el.style.transform = "translateX(-100%)";
      el.style.transition = "transform 0.5s";
      requestAnimationFrame(() => {
        el.style.transform = "translateX(0)";
      });
      el.addEventListener("transitionend", function handler() {
        el.removeEventListener("transitionend", handler);
        resolve();
      });
    });
  }
};
