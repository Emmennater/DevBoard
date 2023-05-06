
// Would not recommend changing this one either
class Display {
  constructor(board) {
    this.board = board;
    this.graphic = createGraphics(WIDTH, HEIGHT);
    // this.graphic.noSmooth();
  }
  
  behavior(action) {
    // Program what the tile will do when an action occures
    
  }
  
  display() {
    const G = this.graphic;
    // this.graphic.background(0);
     
    // Tiles
    for (let r = 0; r < this.board.rows; ++r) {
      for (let c = 0; c < this.board.cols; ++c) {
        const tile = this.board.tiles[r][c]; 
        tile.display(G, r, c);
      }
    }
    
    // Pieces
    for (let r = 0; r < this.board.rows; ++r) {
      for (let c = 0; c < this.board.cols; ++c) {
        const tile = this.board.tiles[r][c]; 
        if (tile.piece !== null && tile.piece.visible)
          tile.piece.display(G, r, c);
      }
    }

    // Tiles Overlay
    for (let r = 0; r < this.board.rows; ++r) {
      for (let c = 0; c < this.board.cols; ++c) {
        const tile = this.board.tiles[r][c]; 
        tile.displayOverlay(G, r, c);
      }
    }
    
    // Grid lines
    const TILE_H = G.height / this.board.rows;
    const TILE_W = G.width / this.board.cols;
    // G.stroke(255);
    // G.strokeWeight(2);
    // for (let r = 0; r <= this.board.rows; ++r)
    //   G.line(0, r * TILE_H, G.width, r * TILE_H);
    // for (let c = 0; c <= this.board.cols; ++c)
    //   G.line(c * TILE_W, 0, c * TILE_W, G.height);
    // G.noFill();
    // G.strokeWeight(6);
    // G.rect(0, 0, G.width, G.height);
    
    // Animations
    updateAnimations();

  }
  
  run(graphic) {
    graphic.image(this.graphic, 0, 0, graphic.width, graphic.height);
    this.graphic.clear();
  }
}

























