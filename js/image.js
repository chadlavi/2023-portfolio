const getOverlay = () => document.getElementById("image-overlay");

const allowScrolling = () => {
  document.body.classList.remove("no-scroll");
};

const freezeScrolling = () => {
  document.body.classList.add("no-scroll");
};

const makeVisible = (e) => e.classList.add("visible");

const removeVisible = (e) => e.classList.remove("visible");

const removeOverlay = () => {
  const overlay = getOverlay();
  removeVisible(overlay);
  allowScrolling();
  overlay.innerHTML = "";
};

const createImg = (srcset) => {
  const image = document.createElement("img");
  image.setAttribute("srcset", srcset);
  return image;
};

const imageClick = (srcset) => () => {
  const overlay = getOverlay();
  const image = createImg(srcset);
  overlay.onclick = removeOverlay;
  overlay.appendChild(image);
  makeVisible(overlay);
  freezeScrolling();
};

const setupZoom = () => {
  document.getElementById("image-overlay")?.remove();
  const newOverlay = document.createElement("div");
  newOverlay.id = "image-overlay";
  document.body.append(newOverlay);
  document.querySelectorAll("img.zoomable").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.onclick = imageClick(img.srcset);
  });
};

const setupNewTab = () => {
  document.querySelectorAll("img.zoomable").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.onclick = () => window.open(img.srcset, "_blank");
  });
};

if (window.innerWidth > 1600) {
  setupZoom();
} else {
  setupNewTab();
}
