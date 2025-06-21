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

  fireLaser(centerX, centerY);
  setTimeout(() => {
    triggerExplosion(centerX, centerY, rect.width * 3);
  }, 250); // sync with beam hit

  // Move icon to used batch after delay
  setTimeout(() => {
    markAsUsed(icon);
  }, 750);
}

function markAsUsed(icon) {
  icon.classList.add("used");
  const type = icon.dataset.type;
  icon.src = type === "rocket" ? "rocket_fill.png" : "launcher_fill.png";
}

function getRandomEdgeStart() {
  const { innerWidth: w, innerHeight: h } = window;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: return { x: Math.random() * w, y: 0 };          // top
    case 1: return { x: w, y: Math.random() * h };          // right
    case 2: return { x: Math.random() * w, y: h };          // bottom
    case 3: return { x: 0, y: Math.random() * h };          // left
  }
}

function fireLaser(targetX, targetY) {
  const start = getRandomEdgeStart();

  const dx = targetX - start.x;
  const dy = targetY - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = 1.5 * Math.PI + Math.atan2(dy, dx);

  // Create beam
  const beam = document.createElement("div");
  beam.classList.add("laser-beam");
  document.body.appendChild(beam);

  Object.assign(beam.style, {
    left: `${start.x}px`,
    top: `${start.y}px`,
    height: `${length}px`,
    transform: `rotate(${angle}rad)`,
  });

  // Remove after animation
  beam.addEventListener("animationend", () => beam.remove());
}

function triggerExplosion(x, y, size = 100) {
  const explosion = document.getElementById('explosion-flash');

  // Position the center of the explosion
  explosion.style.left = `${x - size / 2}px`;
  explosion.style.top = `${y - size / 2}px`;
  explosion.style.width = `${size}px`;
  explosion.style.height = `${size}px`;

  // Reset styles
  explosion.style.transition = 'none';
  explosion.style.opacity = '0';
  explosion.style.transform = 'scale(0)';

  // Trigger reflow
  void explosion.offsetWidth;

  // Animate explosion
  explosion.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  explosion.style.opacity = '1';
  explosion.style.transform = 'scale(2)';

  // Fade out after delay
  setTimeout(() => {
    explosion.style.opacity = '0';
    explosion.style.transform = 'scale(0)';
  }, 500);
}

window.addEventListener("load", renderIcons);
window.addEventListener("resize", () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(renderIcons, 150);
});