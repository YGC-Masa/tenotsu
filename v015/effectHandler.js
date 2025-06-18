export function playEffect(effect, target, callback) {
  if (!effect || !target) {
    callback?.();
    return;
  }
  const effectsMap = {
    fadein: () => {
      target.style.transition = "opacity 0.5s";
      target.style.opacity = "0";
      requestAnimationFrame(() => {
        target.style.opacity = "1";
      });
      setTimeout(() => callback?.(), 500);
    },
    fadeout: () => {
      target.style.transition = "opacity 0.5s";
      target.style.opacity = "1";
      requestAnimationFrame(() => {
        target.style.opacity = "0";
      });
      setTimeout(() => callback?.(), 500);
    },
    slideleft: () => {
      target.style.animation = "slideLeft 0.5s ease-out forwards";
      setTimeout(() => callback?.(), 500);
    },
    slideright: () => {
      target.style.animation = "slideRight 0.5s ease-out forwards";
      setTimeout(() => callback?.(), 500);
    },
    whitein: () => {
      // 白フェードイン効果
      const overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        opacity: "0",
        pointerEvents: "none",
        zIndex: 9999,
        transition: "opacity 0.5s",
      });
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });
      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          document.body.removeChild(overlay);
          callback?.();
        }, 500);
      }, 500);
    },
    blackin: () => {
      // 黒フェードイン効果
      const overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        opacity: "0",
        pointerEvents: "none",
        zIndex: 9999,
        transition: "opacity 0.5s",
      });
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });
      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          document.body.removeChild(overlay);
          callback?.();
        }, 500);
      }, 500);
    },
    // TODO: transitionはカスタム対応予定
  };

  const fn = effectsMap[effect.toLowerCase()];
  if (fn) {
    fn();
  } else {
    callback?.();
  }
}
