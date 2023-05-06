
function windowResized() {
  updateCanvasSize();
}

function updateCanvasSize() {
  if (Canvas === null) return;
  // let size = min(windowWidth, windowHeight);
  let bounds = Canvas.getBoundingClientRect();
  Canvas.width = max(int(bounds.width), 200) * 2;
  Canvas.height = max(int(bounds.height), 200) * 2;
}

function setCursor(mode) {
  Canvas.style.cursor = mode;
}
