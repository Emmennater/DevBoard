
class Board {
  constructor() {
    this.rows = Board.rows;
    this.cols = Board.cols;
    this.tiles = Array(this.rows);
    for (let r = 0; r < this.rows; ++r) {
      this.tiles[r] = Array(this.cols);
      for (let c = 0; c < this.cols; ++c) {
        this.tiles[r][c] = new Tile(this, r, c);
      }
    }
  }
  
  eraseInstancesOfBlueprint(blueprint) {
    for (let r = 0; r < this.rows; ++r) {
      for (let c = 0; c < this.cols; ++c) {
        let tile = this.tiles[r][c];
        let piece = tile.piece;
        if (!piece || !piece.blueprint) continue;
        if (piece.blueprint.name == blueprint.name) tile.piece = null;
      }
    }
  }

  behavior(action) {
    // Program what the board will do when an action occures
    
  }
  
  startup() {
    // Program how the game will be set up initially
    
  }
  
}

// Static Variables (can be changed with gamerules)
Board.rows = 8;
Board.cols = 8;






















