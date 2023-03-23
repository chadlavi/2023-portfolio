const VENDORS = ["moz", "webkit"];
const ANIMATE_CLASS = "animated";
const BOX_CLASS = "wow";
const DOC_ELEMENT = window.document.documentElement;

/**
 *
 * @param {Element} e
 * @param {string} property
 * @returns {string}
 */
function getVendorCSS(e, property) {
  const style = getComputedStyle(e);
  let result = style.getPropertyCSSValue(property);
  if (!result) {
    for (let vendor of VENDORS) {
      result = result || style.getPropertyCSSValue(`-${vendor}-${property}`);
    }
  }
  return result;
}

/**
 *
 * @param {Element} element
 * @returns {number}
 */
function offsetTop(element) {
  // SVG elements don't have an offsetTop in Firefox.
  // This will use their nearest parent that has an offsetTop.
  // Also, using ('offsetTop' of element) causes an exception in Firefox.
  while (element.offsetTop === undefined) {
    element = element.parentNode;
  }
  let top = element.offsetTop;
  while ((element = element.offsetParent)) {
    top += element.offsetTop;
  }
  return top;
}

/**
 * check if box is visible
 * @param {Element} box
 * @returns {boolean}
 */
function isVisible(box) {
  const offset = box.getAttribute("data-wow-offset") || 0;
  const viewTop = window.pageYOffset;
  const viewBottom =
    viewTop + Math.min(DOC_ELEMENT.clientHeight, window.innerHeight) - offset;
  const top = offsetTop(box);
  const bottom = top + box.clientHeight;

  return top <= viewBottom && bottom >= viewTop;
}

/**
 *
 * @param {Object.<string, string} styles
 * @param {Object.<string, string>} newStyles
 */
function setCSSProperties(styles, newStyles) {
  for (let name in newStyles) {
    const value = newStyles[name];
    styles[`${name}`] = value;
    // VENDORS.forEach((vendor) => {
    //   e[`${vendor}${name.charAt(0).toUpperCase()}${name.substring(1)}`] = value;
    // });
  }
}

/**
 *
 * @param {Element} box
 * @returns {string}
 */
function getAnimationName(box) {
  let result;
  try {
    result = getVendorCSS(box, "animation-name").cssText;
  } catch (error) {
    // Opera, fall back to plain property value
    result = getComputedStyle(box).getPropertyValue("animation-name");
  }
  if (result === "none") {
    return ""; // SVG/Firefox, unable to get animation name?
  } else {
    return result;
  }
}

class WOW {
  constructor(options = {}) {
    this.start = this.start.bind(this);
    this.resetAnimation = this.resetAnimation.bind(this);
    this.scrollHandler = this.scrollHandler.bind(this);
    this.scrollCallback = this.scrollCallback.bind(this);
    this.scrolled = true;
    this.config = { ...options };

    // Map of elements to animation names:
    this.animationNameCache = new WeakMap();
    this.wowEvent = new Event(BOX_CLASS);
  }

  init() {
    if (["interactive", "complete"].includes(document.readyState)) {
      this.start();
    } else {
      document.addEventListener("DOMContentLoaded", this.start);
    }
  }

  start() {
    this.stopped = false;
    this.boxes = [...document.querySelectorAll(`.${BOX_CLASS}`)];

    if (this.boxes.length > 0) {
      for (let box of this.boxes) {
        this.applyStyle(box, true);
      }
    }
    window.addEventListener("scroll", this.scrollHandler);
    window.addEventListener("resize", this.scrollHandler);
    this.interval = setInterval(this.scrollCallback, 50);

    return new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          this.doSync(node);
        });
      });
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // unbind the scroll event
  stop() {
    this.stopped = true;
    window.removeEventListener("scroll", this.scrollHandler);
    window.removeEventListener("resize", this.scrollHandler);
    if (this.interval != null) {
      clearInterval(this.interval);
    }
  }

  /**
   *
   * @param {Element} element
   * @returns
   */
  doSync(element) {
    if (element == null) {
      ({ element } = this);
    }
    if (element.nodeType !== 1) {
      return;
    }
    element = element.parentNode || element;

    for (let box of element.querySelectorAll(`.${BOX_CLASS}`)) {
      if (!this.boxes.includes(box)) {
        this.boxes.push(box);
        if (this.stopped) {
          this.resetStyle();
        } else {
          this.applyStyle(box, true);
        }
      }
    }
  }

  /**
   * show box element
   * @param {Element} box
   */
  show(box) {
    this.applyStyle(box);
    box.classList.add(ANIMATE_CLASS);

    box.dispatchEvent(this.wowEvent);

    box.addEventListener("animationend", this.resetAnimation);
  }

  /**
   *
   * @param {Element} box
   * @param {boolean} hidden
   */
  applyStyle(box, hidden) {
    const duration = box.getAttribute("data-wow-duration");
    const delay = box.getAttribute("data-wow-delay");
    const iteration = box.getAttribute("data-wow-iteration");

    window.requestAnimationFrame(() => {
      this.customStyle(box, hidden, duration, delay, iteration);
    });
  }

  resetStyle() {
    this.boxes.forEach((box) => {
      box.style.visibility = "visible";
    });
  }

  /**
   *
   * @param {Event} event
   */
  resetAnimation(event) {
    if (event.type.toLowerCase().indexOf("animationend") >= 0) {
      event.target.classList.remove(ANIMATE_CLASS);
    }
  }

  /**
   *
   * @param {Element} box
   * @param {boolean} hidden
   * @param {string} animationDuration
   * @param {string} animationDelay
   * @param {string} animationIterationCount
   */
  customStyle(
    box,
    hidden,
    animationDuration,
    animationDelay,
    animationIterationCount
  ) {
    if (hidden) {
      this.setCachedAnimationName(box);
    }

    setCSSProperties(box.style, {
      animationDuration,
      animationDelay,
      animationIterationCount,
      visibility: hidden ? "hidden" : "visible",
      animationName: hidden ? "none" : this.getCachedAnimationName(box),
    });
  }

  /**
   *
   * @param {Element} box
   */
  setCachedAnimationName(box) {
    this.animationNameCache.set(box, getAnimationName(box));
  }
  /**
   *
   * @param {Element} box
   * @returns {string}
   */
  getCachedAnimationName(box) {
    return this.animationNameCache.get(box);
  }

  scrollHandler() {
    this.scrolled = true;
  }

  _getBoxes = () => {
    const result = [];
    for (let box of this.boxes) {
      if (isVisible(box)) {
        this.show(box);
        continue;
      }
      result.push(box);
    }
    return result;
  };

  scrollCallback() {
    if (this.scrolled) {
      this.scrolled = false;
      this.boxes = this._getBoxes();
      if (this.boxes.length < 1) {
        this.stop();
      }
    }
  }
}
