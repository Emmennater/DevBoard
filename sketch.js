
function preload() {
  gamebg = loadImage("Assets/fadebg.png");
  
  // Load other game assets
  loadAssets();
}

async function setup() {
  // Setup canvas
  // Canvas = createCanvas(400, 400);
  noCanvas();
  Canvas = document.getElementById("board");
  updateCanvasSize();
  noSmooth();
  
  // Setup therules
  game = new Game(Canvas);
  
  // Setup the custom rules
  main();
  
  // Initiate
  initFunctions();
  initUI();
  initChessPreset();
  game.init();
  globalFunctions["On Start"].executeListeners();
}

function draw() {
  // Actions
  setCursor("default");
  updateMouse();
  
  // Updates
  globalFunctions["Every Tick"].executeListeners();

  // Run the game
  game.run();
}





















