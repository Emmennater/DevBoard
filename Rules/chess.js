
let selectedTile = null;

function loadAssets() {}
function main() {}

function setPiece(board, r, c, name, team) {
  placePiece(board, r, c, new Piece(null, {blueprint:getPieceObjectByName(name), team: team, name: name}));
}

Board.prototype.startup = function() {
  // Black pieces
  // setPiece(this, 7, 0, "Rook",   1);
  // setPiece(this, 7, 1, "Knight", 1);
  // setPiece(this, 7, 2, "Bishop", 1);
  // setPiece(this, 7, 3, "Queen",  1);
  // setPiece(this, 7, 4, "King",   1);
  // setPiece(this, 7, 5, "Bishop", 1);
  // setPiece(this, 7, 6, "Knight", 1);
  // setPiece(this, 7, 7, "Rook",   1);
  // setPiece(this, 6, 0, "Pawn",   1);
  // setPiece(this, 6, 1, "Pawn",   1);
  // setPiece(this, 6, 2, "Pawn",   1);
  // setPiece(this, 6, 3, "Pawn",   1);
  // setPiece(this, 6, 4, "Pawn",   1);
  // setPiece(this, 6, 5, "Pawn",   1);
  // setPiece(this, 6, 6, "Pawn",   1);
  // setPiece(this, 6, 7, "Pawn",   1);
  
  // White pieces
  // setPiece(this, 0, 0, "Rook",   0);
  // setPiece(this, 0, 1, "Knight", 0);
  // setPiece(this, 0, 2, "Bishop", 0);
  // setPiece(this, 0, 3, "Queen",  0);
  // setPiece(this, 0, 4, "King",   0);
  // setPiece(this, 0, 5, "Bishop", 0);
  // setPiece(this, 0, 6, "Knight", 0);
  // setPiece(this, 0, 7, "Rook",   0);
  // setPiece(this, 1, 0, "Pawn",   0);
  // setPiece(this, 1, 1, "Pawn",   0);
  // setPiece(this, 1, 2, "Pawn",   0);
  // setPiece(this, 1, 3, "Pawn",   0);
  // setPiece(this, 1, 4, "Pawn",   0);
  // setPiece(this, 1, 5, "Pawn",   0);
  // setPiece(this, 1, 6, "Pawn",   0);
  // setPiece(this, 1, 7, "Pawn",   0);
}

Tile.prototype.behavior = function(action) {
  // Program what the tile will do when an action occures
  const pieceSelected = selectedObject.constructor.name == "PieceBlueprint";
  if (action.type == "clicked") {
    if (editing && (pieceSelected || removing)) {
      selectedTile = null;

      // Place selected piece
      if (removing) {
        mouse.hovered.piece = null;
      } else {
        mouse.hovered.piece = new Piece(mouse.hovered, {blueprint:selectedObject, team: currentSprite, name:selectedObject.name});
      }
    } else {
      // If a tile is already selected and a peice exists
      // attempt to move it
      if (selectedTile !== null &&
          selectedTile !== mouse.hovered &&
          selectedTile.piece !== null) {
        let piece = selectedTile.piece;
        if (editing || !piece.motionRestricted || piece.canMoveTo(mouse.hovered)) {
          // Movement vector
          let vector = { rows: mouse.hovered.row - selectedTile.row, cols: mouse.hovered.col - selectedTile.col };
          let captured = mouse.hovered.piece;
          movePiece(selectedTile, mouse.hovered, true);
          globalFunctions["Piece Moved"].executeListeners([], {piece, vector, captured});
        }
        selectedTile = null;
      } else if (selectedTile === mouse.hovered) {
        selectedTile = null;
      } else {
        // Select the hovered piece
        selectedTile = mouse.hovered;
      }
      if (selectedTile.piece == null) selectedTile = null;
    }
  }
}

Tile.prototype.display = function(graphic, row, col) {
  // Program what the tile will display
  // (this includes the peice)

  // Some useful information
  const G = graphic;
  const TILE_H = G.height / this.board.rows;
  const TILE_W = G.width / this.board.cols;
  const TILE_Y = TILE_H * (this.board.rows - 1 - row);
  const TILE_X = TILE_W * col;

  // Odd Even tiles
  if ((row + col) % 2) {
    G.fill(0, 70);
    if (selectedTile == this)
      G.fill(0, 30, 60, 70);
    // G.fill(34, 163, 159);
  } else {
    G.fill(80, 50);
    if (selectedTile == this)
      G.fill(80, 110, 150, 50);
    // G.fill(243, 239, 224);
  }

  // Default
  G.noStroke();
  G.rect(TILE_X, TILE_Y, TILE_W, TILE_H);
    
}

Tile.prototype.displayOverlay = function(graphic, row, col) {
  // Some useful information
  const G = graphic;
  const TILE_H = G.height / this.board.rows;
  const TILE_W = G.width / this.board.cols;
  const TILE_Y = TILE_H * (this.board.rows - 1 - row);
  const TILE_X = TILE_W * col;

  // Display piece while editing
  if (!editing || removing) return;
  if (selectedObject === defaultObject) return;
  if (mouse.hovered != this) return;
  const pieceSelected = selectedObject.constructor.name == "PieceBlueprint";
  if (!pieceSelected) return;
  let sprite = selectedObject.sprites[currentSprite];
  if (!sprite) return;

  G.fill(255, 0, 0, 50);
  G.tint(255, 127.5);
  G.image(sprite, TILE_X, TILE_Y, TILE_W, TILE_H);
  G.noTint();
  
  setCursor("pointer");

}

Piece.prototype.display = function(graphic, row, col) {
  // Program what the tile will display
  // (this includes the peice)
  
  // Some useful information
  const G = graphic;
  const TILE_S = G.height / this.tile.board.rows;
  const TILE_Y = TILE_S * (this.tile.board.rows - 1 - row);
  const TILE_X = TILE_S * col;
  
  // G.fill(50);
  // G.noStroke();
  // G.textAlign(CENTER, CENTER);
  // G.textSize(TILE_S * 0.9);
  // G.text(this.icon, TILE_X+TILE_S/2, TILE_Y+TILE_S*0.6);
  
  // Make sure the image is loaded
  if (this.team == undefined || !this.blueprint || !this.blueprint.sprites) return;
  const img = this.blueprint.sprites[this.team];
  if (img == undefined) return;
  G.image(img, TILE_X, TILE_Y, TILE_S, TILE_S);
  
}


/*

















*/
