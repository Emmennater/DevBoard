
class Piece {
  constructor(tile, data) {
    this.tile = tile;
    this.name = "piece";
    this.visible = true;
    this.motionRestricted = true;
    this.passThrough = true;
    this.selfCapture = true;
    this.motionVectors = 0;
    this.allowedMotionVectors = {};
    this.localVariables = {};
    this.init(data);
  }
  
  init(data) {
    // Default init function
    for (let key of Object.keys(data)) {
      this[key] = data[key];
    }
  }
  
  allowMotion(rowStep, colStep, range, condition = ()=>true) {
    let hash = rowStep + "," + colStep + "," + range + "," + this.motionVectors;
    this.allowedMotionVectors[hash] = {rowStep, colStep, range, condition, index: this.motionVectors};
    this.motionVectors++;
  }

  resetMotionVectors() {
    this.allowedMotionVectors = {};
    this.motionVectors = 0;
  }

  removeMotionVector(index) {
    // Find the key
    for (let key of Object.keys(this.allowedMotionVectors)) {
      if (this.allowedMotionVectors[key].index == index) {
        delete this.allowedMotionVectors[key];
      }
    }
  }

  canMoveTo(tile) {
    if (!this.selfCapture && tile.piece !== null && tile.piece.team == this.team) return false;

    // Check for disabled sprite index movement
    if (disabledSpriteMoves[this.team] === false ||
        disabledSpriteMoves[this.team] === 0) return false;

    let checkMotionVector = (vector) => {
      let currentRow = this.tile.row;
      let currentCol = this.tile.col;
      for (let i = 0; i < vector.range; ++i) {
        try {
          currentRow += vector.rowStep;
          currentCol += vector.colStep;
          let currentTile = getTile(tile.board, currentRow, currentCol);
          if (currentTile == tile) return true;
          if (currentTile.piece && !this.passThrough) return false;
        } catch (exception) {
          break;
        }
      }
      return false;
    }

    // Movement vector
    let vector = { rows: this.tile.row - tile.row, cols: this.tile.col - tile.col };

    // Check for a legal move
    for (let key of Object.keys(this.allowedMotionVectors)) {
      // Check condition
      if (!this.allowedMotionVectors[key].condition(tile, vector)) continue;
      if (checkMotionVector(this.allowedMotionVectors[key])) return true;
    }

    return false;
  }

  behavior(action) {
    // Program what the tile will do when an action occures
    
  }
  
  display(graphic, row, col) {
    // Program what the tile will display
    // (this includes the peice)
    
    // Some useful information
    const G = graphic;
    const TILE_H = G.height / this.tile.board.rows;
    const TILE_W = G.width / this.tile.board.cols;
    const TILE_Y = TILE_H * row;
    const TILE_X = TILE_W * col;
    
  }
  
}



























