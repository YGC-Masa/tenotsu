// effect.js - v021 完全同期対応

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
  whitein: (el) => {
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "#fff";
    overlay.style.zIndex = "99";
    overlay.style.opacity = "1";
    overlay.style.transition = "opacity 0.5s ease";
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "0";
      overlay.addEventListener("transitionend", () => overlay.remove());
    });
  },
  blackin: (el) => {
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "#000";
    overlay.style.zIndex = "99";
    overlay.style.opacity = "1";
    overlay.style.transition = "opacity 0.5s ease";
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "0";
      overlay.addEventListener("transitionend", () => overlay.remove());
    });
  },
  slideleft: (el) => {
    el.style.transform = "translateX(100%)";
    el.style.transition = "transform 0.5s ease";
    requestAnimationFrame(() => {
      el.style.transform = "translateX(0)";
    });
  },
  slideright: (el) => {
    el.style.transform = "translateX(-100%)";
    el.style.transition = "transform 0.5s ease";
    requestAnimationFrame(() => {
      el.style.transform = "translateX(0)";
    });
  }
};
