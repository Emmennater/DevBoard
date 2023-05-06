
mouse = {x:0, y:0, hovered:null};

function mousePressed() {
  
  try {
    const tile = getTile(game.board, Math.floor(mouse.y), Math.floor(mouse.x));
    tile.behavior({type:"clicked"});
  } catch (exception) {
    // print("out of bounds!");
  }
}

function getCanvasMouse() {
  let bounds = Canvas.getBoundingClientRect();
  let scl = Canvas.width / int(bounds.width);
  let mx = (mouseX - bounds.x) * scl;
  let my = (mouseY - bounds.y) * scl;
  return { mx, my };
}

function updateMouse() {
  if (ignoreInput) return;

  // Calculate the square
  const { mx, my } = getCanvasMouse();
  mouse.x = (mx - game.viewport.x) / game.viewport.w * game.board.cols;
  mouse.y = (my - game.viewport.y) / game.viewport.h * game.board.rows;
  
  const row = game.board.rows - 1 - Math.floor(mouse.y);
  const col = Math.floor(mouse.x);
  if (row < 0 || row >= game.board.rows ||
      col < 0 || col >= game.board.cols) {
    mouse.hovered = null;
    return;
  }
  
  // Update hovered tile
  const tile = game.board.tiles[row][col];
  
  // Mouse pointer
  if (tile.piece !== null)
    setCursor("pointer");
  
  if (tile == mouse.hovered) return;
  if (mouse.hovered !== null) {
    mouse.hovered.hovered = false;
    mouse.hovered.behavior({type:"unhovered"});
  }
  tile.hovered = true;
  tile.behavior({type:"hovered"});
  
  // Set hovered afterwards so the tiles behavior function can see
  // the last hovered tile
  mouse.hovered = tile;
  
}






















