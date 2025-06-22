// effect.js - v021-12 完全同期対応（Promiseベース）

window.effects = {
  fadein: (el, resolve) => {
    el.style.opacity = 0;
    el.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 1;
      el.addEventListener("transitionend", function handler() {
        el.removeEventListener("transitionend", handler);
        if (resolve) resolve();
      });
    });
  },

  fadeout: (el, resolve) => {
    el.style.opacity = 1;
    el.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(() => {
      el.style.opacity = 0;
      el.addEventListener("transitionend", function handler() {
        el.removeEventListener("transitionend", handler);
        if (resolve) resolve();
      });
    });
  },

  whitein: (el, resolve) => {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "#fff",
      zIndex: "99",
      opacity: "1",
      transition: "opacity 0.5s ease",
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "0";
      overlay.addEventListener("transitionend", function handler() {
        overlay.removeEventListener("transitionend", handler);
        overlay.remove();
        if (resolve) resolve();
      });
    });
  },

  blackin: (el, resolve) => {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "#000",
      zIndex: "99",
      opacity: "1",
      transition: "opacity 0.5s ease",
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "0";
      overlay.addEventListener("transitionend", function handler() {
        overlay.removeEventListener("transitionend", handler);
        overlay.remove();
        if (resolve) resolve();
      });
    });
  },

  slideleft: (el, resolve) => {
    el.style.transition = "transform 0.5s ease";
    el.style.transform = "translateX(100%)";
    requestAnimationFrame(() => {
      el.style.transform = "translateX(0)";
      el.addEventListener("transitionend", function handler() {
        el.removeEventListener("transitionend", handler);
        if (resolve) resolve();
      });
    });
  },

  slideright: (el, resolve) => {
    el.style.transition = "transform 0.5s ease";
    el.style.transform = "translateX(-100%)";
    requestAnimationFrame(() => {
      el.style.transform = "translateX(0)";
      el.addEventListener("transitionend", function handler() {
        el.removeEventListener("transitionend", handler);
        if (resolve) resolve();
      });
    });
  },
};
