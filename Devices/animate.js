
let animationQueue = [];
let animationSpeed = 1 / 10;

function updateAnimations() {
  const G = game.display.graphic;
  for (let i = 0; i < animationQueue.length; ++i) {
    const animation = animationQueue[i];
    if (animation.cancelled) {
      animationQueue.splice(i--, 1);
      continue;
    }
    
    const {piece, oldPieces, from, to, time} = animation;
    // Draw captured piece below
    for (let oldPiece of oldPieces) {
      if (oldPiece !== null)
        oldPiece.display(G, oldPiece.tile.row, oldPiece.tile.col);
    }
    
    // Interpolate position
    let r = lerp(from.row, to.row, 1 - time);
    let c = lerp(from.col, to.col, 1 - time);
    piece.display(G, r, c);
    
    // Time left on animation
    animation.time -= animationSpeed;
    if (animation.time <= 0) {
      if (animation.next) {
        // Remove visited piece
        animation.oldPieces.shift();
        animationQueue[i] = animation.next;
      } else {
        piece.visible = true;
        piece.animation = null;
        animationQueue.splice(i--, 1);
      }
    }
  }
}


















