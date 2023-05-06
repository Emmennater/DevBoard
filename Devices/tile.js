
class Tile {
  constructor(board, row, col) {
    this.name = "tile";
    this.piece = null;
    this.board = board;
    this.row = row;
    this.col = col;
    this.hovered = false;
  }
  
  behavior(action) {
    // Program what the tile will do when an action occures
    
  }
  
  display(graphic, row, col) {
    // Program what the tile will display
    // (this includes the peice)
    
    // Some useful information
    const G = graphic;
    const TILE_H = G.height / this.board.rows;
    const TILE_W = G.width / this.board.cols;
    const TILE_Y = TILE_H * row;
    const TILE_X = TILE_W * col;
    
  }
  
  displayOverlay(graphic, row, col) {
  
  }
}



























