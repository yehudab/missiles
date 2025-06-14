  const minIconSize = 24;
  const maxIconSize = 64;
  const rocketContainer = document.getElementById("rockets");
  const iconGap = 4; // match --icon-gap in CSS

  function getGapFromComputedStyle(containerEl) {
    const computed = window.getComputedStyle(containerEl);
    const rowGap = parseFloat(computed.rowGap) || 0;
    const columnGap = parseFloat(computed.columnGap) || 0;
    return { rowGap, columnGap };
  }

function renderIcons() {
  rocketContainer.innerHTML = "";

  const containerWidth = rocketContainer.clientWidth;
  const containerHeight = rocketContainer.clientHeight;

  // Get actual gap values from computed style
  const { rowGap, columnGap } = getGapFromComputedStyle(rocketContainer);

  let bestSize = minIconSize;

  for (let size = maxIconSize; size >= minIconSize; size--) {
    const totalWidthPerIcon = size + columnGap;
    const totalHeightPerIcon = size + rowGap;

    const iconsPerRow = Math.floor((containerWidth - columnGap) / totalWidthPerIcon);
    const iconsPerCol = Math.floor((containerHeight - rowGap) / totalHeightPerIcon);

    const totalFittable = iconsPerRow * iconsPerCol;

    if (totalFittable >= totalRockets) {
      bestSize = size;
      break;
    }
  }

  for (let i = 0; i < totalRockets; i++) {
    const img = document.createElement("img");
    img.src = i < totalFilledRockets ? "rocket_fill.png" : "rocket.png";
    img.alt = "Rocket";
    img.style.width = bestSize + "px";
    img.style.height = bestSize + "px";
    rocketContainer.appendChild(img);
  }
}


  window.addEventListener("load", renderIcons);
  window.addEventListener("resize", () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(renderIcons, 150);
  });