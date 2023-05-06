
WIDTH = 1000;
HEIGHT = 1000;

// Backend (not programmable)
class Game {
  constructor(html5Canvas) {
    
    // Setup the game
    this.canvas = html5Canvas;
    this.ctx = this.canvas.getContext("2d");
    this.setupGame();
    
    // Initialize the program
    this.graphic = createGraphics(WIDTH, HEIGHT);
    this.viewport = {x:0, y:0, w:this.canvas.width, h:this.canvas.height};
    // this.graphic.noSmooth();
    
    
  }
  
  init() {
    this.board.startup();
  }
  
  setupGame() {
    // Create Board
    this.board = new Board();
    
    // Use dimensions to set WIDTH and HEIGHT
    if (this.board.rows > this.board.cols) {
      WIDTH /= this.board.rows / this.board.cols;
    } else {
      HEIGHT /= this.board.cols / this.board.rows;
    }
    
    // Create Display
    this.display = new Display(this.board);
  }
  
  show() {
    const MARGIN_Y = 0;
    const MARGIN_X = 0;
    // const MARGIN_Y = this.canvas.width * 0.05;
    // const MARGIN_X = this.canvas.height * 0.05;
    // this.ctx.drawImage(gamebg.canvas, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Calculate board position and size
    let sizeX = this.canvas.width - MARGIN_X * 2;
    let sizeY = this.canvas.height - MARGIN_Y * 2;
    let size, offx = 0, offy = 0;
    if (sizeX < sizeY) {
      size = sizeX;
      offy = (sizeY - sizeX) / 2;
    } else {
      size = sizeY;
      offx = (sizeX - sizeY) / 2;
    }
    
    let ratioy = this.board.rows / this.board.cols;
    let ratiox = 1;
    if (ratioy > 1) {
      ratiox = 1 / ratioy;
      ratioy = 1;
    }
    offx += (size - size * ratiox) / 2;
    offy += (size - size * ratioy) / 2;
    
    // Update viewport
    this.viewport.x = MARGIN_X + offx;
    this.viewport.y = MARGIN_Y + offy;
    this.viewport.w = size * ratiox;
    this.viewport.h = size * ratioy;
    
    // Draw the game
    this.ctx.drawImage(this.graphic.canvas, MARGIN_X + offx, MARGIN_Y + offy, size * ratiox, size * ratioy);
    this.graphic.clear();
    
  }
  
  run() {
    // Run Display
    this.display.display();
    this.display.run(this.graphic);
    
    // Display game
    this.show();
  }
}

function getTile(board, row, col) {
  if (row < 0 || row >= board.rows ||
      col < 0 || col >= board.cols)
    throw Error("Position out of bounds!");
  return board.tiles[row][col];
}

function placePiece(board, row, col, piece) {
  let tile = getTile(board, row, col);
  piece.tile = tile;
  tile.piece = piece;
}

function removePiece(board, row, col) {
  const tile = getTile(board, row, col);
  const piece = tile.piece;
  piece.tile = null;
  tile.piece = null;
}

function movePiece(fromTile, toTile, transition = false) {
  let fromPiece = fromTile.piece;
  let toPiece = toTile.piece;
  toTile.piece = fromPiece;
  fromTile.piece = null;
  fromPiece.tile = toTile;

  // Animate
  if (!transition) return;
  
  // if (fromPiece.animation) fromPiece.animation.cancelled = true;
  let animation = {piece:fromPiece, oldPieces:[toPiece], from:fromTile, to:toTile, time:1};
  if (fromPiece.animation) {
    animation.oldPieces = fromPiece.animation.oldPieces;
    if (toPiece) animation.oldPieces.push(toPiece);
    fromPiece.animation.next = animation;
  } else {
    fromPiece.visible = false;
    fromPiece.animation = animation;
    animationQueue.push(animation);
  }
}

function clearBoard(board) {
  for (let r = 0; r < board.rows; ++r) {
    for (let c = 0; c < board.cols; ++c) {
      board.tiles[r][c].piece = null;
    }
  }
}























