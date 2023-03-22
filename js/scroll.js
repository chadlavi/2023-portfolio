function isElementVisible(e) {
  const edges = e.getBoundingClientRect();
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;

  if (
    edges.right < 0 ||
    edges.bottom < 0 ||
    edges.left > viewportWidth ||
    edges.top > viewportHeight
  ) {
    return false;
  }
  return true;
}

const changeBodyBackgroundColor = (color) => {
  const bodyClassesArray = [...document.body.classList];
  const newClassesArray = [
    ...bodyClassesArray.filter((c) => !c.match(/^bkg/i)),
    `bkg-${color}`,
  ];
  const newClassesString = newClassesArray.join(" ");
  document.body.classList = newClassesString;
};

const checkAllSections = () => {
  const scrollPoint = window.innerHeight / 2;
  const sections = [...document.querySelectorAll("section")];
  const visibleSections = sections.filter((s) => isElementVisible(s));
  visibleSections.forEach((section) => {
    const sectionData = section.getBoundingClientRect();
    if (sectionData.top <= scrollPoint) {
      const sectionColor = section.dataset.color;
      if (sectionColor) {
        changeBodyBackgroundColor(sectionColor);
      } else {
        changeBodyBackgroundColor("default");
      }
    }
  });
  if (visibleSections.length === 0) {
    changeBodyBackgroundColor("default");
  }
};

window.addEventListener("scroll", checkAllSections);
