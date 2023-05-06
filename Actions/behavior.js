
let actionQueue = [];

function updateAllBehavior() {
  for (let i=0; i<actionQueue.length; ++i) {
    let action = actionQueue.shift();
    
    // Update board
    game.board.behavior(action);
    
    // Update tiles and peices
    for (let r = 0; r < game.board.rows; ++r) {
      for (let c = 0; c < game.board.cols; ++c) {
        const tile = game.board.tiles[r][c];
        tile.behavior(action);
        if (tile.peice !== null) tile.peice.behavior(action);
      }
    }
    
    // Update display
    game.display.behavior(action);
    
  }
}

function updatePiece(row, col) {
  if (row < 0 || row >= game.board.rows ||
      col < 0 || col >= game.board.cols)
    throw Error("Position out of bounds!");
  const peice = game.board.tiles[row][col].peice;
  if (piece === null) return;
  peice.behavior(action);
}


















