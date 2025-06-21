const minIconSize = 16;
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
    const iconsPerCol = Math.floor((containerHeight) / totalHeightPerIcon);

    const totalFittable = iconsPerRow * iconsPerCol;

    if (totalFittable >= totalRockets + totalLaunchers) {
      bestSize = size;
      break;
    }
  }

  for (let i = 0; i < totalLaunchers; i++) {
    if (i < totalUsedLaunchers) {
      addImage("launcher_fill.png", "משגר הושמד * 10", "launcher", false, i, bestSize);
    } else {
      addImage("launcher.png", "משגר במלאי * 10", "launcher", true, i, bestSize);
    }
  }

  for (let i = 0; i < totalRockets; i++) {
    if (i < totalUsedRockets) {
      addImage("rocket_fill.png", "טיל שוגר/הושמד * 10", "rocket", false, i + totalLaunchers, bestSize);
    } else {
      addImage("rocket.png", "טיל במלאי * 10", "rocket", true, i + totalLaunchers, bestSize);
    }
  }
}

function addImage(src, alt, type, clickable, index, size) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.style.width = size + "px";
  img.style.height = size + "px";
  img.classList.add("icon");
  
  if (clickable) {
    img.addEventListener("click", handleIconClick);
  } else {
    img.classList.add("used");
  }

  img.dataset.type = type;     // e.g. "missile" or "launcher"
  img.dataset.index = index;   
  
  rocketContainer.appendChild(img);
}

function handleIconClick(e) {
  const icon = e.currentTarget;

  const rect = icon.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  animateLaserTo(centerX, centerY);
  triggerExplosionAt(centerX, centerY);

  // Move icon to used batch after delay
  setTimeout(() => {
    markAsUsed(icon);
  }, 600);
}

function markAsUsed(icon) {
  icon.classList.add("used");
  const type = icon.dataset.type;
  icon.src = type === "rocket" ? "rocket_fill.png" : "launcher_fill.png";
}

function getRandomEdgePosition() {
  const { innerWidth: w, innerHeight: h } = window;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: return { x: Math.random() * w, y: 0 };          // top
    case 1: return { x: w, y: Math.random() * h };          // right
    case 2: return { x: Math.random() * w, y: h };          // bottom
    case 3: return { x: 0, y: Math.random() * h };          // left
  }
}

function animateLaserTo(targetX, targetY) {
  const laser = document.getElementById("laser-beam");
  const start = getRandomEdgePosition();

  // Calculate distance and angle
  const dx = targetX - start.x;
  const dy = targetY - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = 1.5*Math.PI + Math.atan2(dy, dx);

  // Reset and show laser
  laser.style.display = "block";
  laser.style.left = `${start.x}px`;
  laser.style.top = `${start.y}px`;
  laser.style.height = `0px`;
  laser.style.transform = `rotate(${angle}rad)`;
  laser.style.transition = "none";

  // Wait one frame, then animate
  requestAnimationFrame(() => {
    laser.style.transition = "height 0.2s linear";
    laser.style.height = `${distance}px`;
  });

  // After animation, hide beam and reset
  setTimeout(() => {
    laser.style.display = "none";
    laser.style.transition = "none";
    laser.style.height = "0px";
  }, 250);
}

function triggerExplosionAt(x, y) {
  const explosion = document.getElementById("explosion-circle");
  const size = 300;

  explosion.style.left = `${x - size / 2}px`;
  explosion.style.top = `${y - size / 2}px`;
  explosion.style.width = `${size}px`;
  explosion.style.height = `${size}px`;
  explosion.style.opacity = "0.8";
  explosion.style.transform = "scale(1)";

  setTimeout(() => {
    explosion.style.opacity = "0";
    explosion.style.transform = "scale(0)";
  }, 50);

  setTimeout(() => {
    explosion.style.width = "0";
    explosion.style.height = "0";
  }, 600);
}

window.addEventListener("load", renderIcons);
window.addEventListener("resize", () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(renderIcons, 150);
});