
let selectedObject = null;
let pieces = [];
let rules = [];
let defaultObject = null;
let editing = false;
let removing = false;
let currentSprite = 0;
let ignoreInput = false;
let selectedFunction = null;
let boardData = null;
const MAX_URLS = 99;

function resetSelected() {
  if (selectedObject === null ||
      selectedObject.elems.button === undefined)
    return;
  selectedObject.elems.button.classList.remove("selected");
}

function removeSelected() {
  // Cannot remove default object
  if (selectedObject === defaultObject) return;

  // Prompt yes or no
  if (!confirm("Are you sure you want to remove this component?")) return;

  function removeObject(objList, obj) {
    // Locate next element
    let idx = objList.findIndex(e => e === obj);
    if (idx == objList.length - 1) idx--;

    // Remove the element
    objList.removeObj(obj);
    obj.elems.button.remove();
    game.board.eraseInstancesOfBlueprint(obj);

    // Set the next element as the selected object, if available
    if (idx < objList.length) {
      setSelectedObject(objList[idx]);
      return true;
    }

    return false;
  }

  // Remove the selected object
  let objectRemoved = false;
  switch (selectedObject.constructor.name) {
    case "PieceBlueprint":
      objectRemoved = removeObject(pieces, selectedObject);
      break;
    case "RuleBlueprint":
      objectRemoved = removeObject(rules, selectedObject);
      break;
  }

  // Set to default object if no other object was selected
  if (!objectRemoved) {
    selectedObject = defaultObject;
    selectedObject.updateUI();
  }
}

function isSelectedSprite() {
  return selectedObject.constructor.name == "PieceBlueprint";
}

function setSelectedObject(obj) {
  // Deselect if the same piece is selected
  if (obj == selectedObject) {
    resetSelected();
    selectedObject = defaultObject;
    defaultObject.updateUI();
    return;
  }

  // Set new selected element  
  resetSelected();
  obj.elems.button.classList.add("selected");

  // Update the user interface
  selectedObject = obj;
  selectedObject.updateUI();

  // Update cycled sprite
  if (isSelectedSprite()) currentSprite = currentSprite % selectedObject.sprites.length;
}

function updateSpriteUrlButtons() {
  let urlList = document.getElementById("sprite-urls-list");
  let addUrlButton = document.getElementById("add-url");
  let removeUrlButton = document.getElementById("remove-url");
  addUrlButton.disabled = urlList.children.length == MAX_URLS;
  removeUrlButton.disabled = urlList.children.length == 1;
}

function createSpriteUrlListItem(num) {
  let listElem = document.createElement("li");
  let input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("id", "piece-img-url-" + num);
  input.setAttribute("contenteditable", "plaintext-only");
  input.setAttribute("placeholder", "https://piece-team-" + num + ".png");
  
  // Input listener
  input.onchange = ()=>{
    // Update url value
    selectedObject.urls[num - 1] = input.value;

    // Attempt to load sprite
    selectedObject.loadSprite(num - 1);
  };
  
  listElem.appendChild(input);
  return listElem;
}

function addUrlToSelected() {
  let urlList = document.getElementById("sprite-urls-list");
  let num = urlList.children.length + 1;
  let listElem = createSpriteUrlListItem(num);
  urlList.appendChild(listElem);

  // Scroll to latest sprite
  let listDiv = document.getElementById("sprite-urls");
  listDiv.scrollTop = listDiv.scrollHeight;

  // Enable remove url button when more than one item left
  updateSpriteUrlButtons();

  // Add the empty url
  selectedObject.addSpriteUrl("");
}

function removeUrlFromSelected() {
  let urlList = document.getElementById("sprite-urls-list");
  urlList.removeChild(urlList.lastChild);

  // Disable remove url button when only one item left
  updateSpriteUrlButtons();

  // Remove the last url
  selectedObject.removeSpriteUrl();
}

function getPieceObjectByName(name) {
  for (let piece of pieces) {
    if (piece.name == name) return piece;
  }
  return null;
}

function toggleBoardEditing() {
  const button = document.getElementById("editing");
  button.classList.toggle("selected");
  editing = !editing;
  
  // Make sure editing stuff is off when editing is disabled
  const rButton = document.getElementById("removing");
  const sButton = document.getElementById("cycle-sprite");
  rButton.disabled = !rButton.disabled;
  sButton.disabled = !sButton.disabled;
  if (!editing) {
    if (removing) {
      rButton.classList.toggle("selected");
      removing = !removing;
    }
  }
}

function toggleRemovingPieces() {
  const button = document.getElementById("removing");
  button.classList.toggle("selected");
  removing = !removing;
}

function cyclePieceSprite() {
  if (!isSelectedSprite()) return;
  currentSprite = (currentSprite + 1) % selectedObject.sprites.length;
}

function updatePointerEvents(state) {
  const page = document.getElementById("main-page");
  if (state) {
    page.style.pointerEvents = "auto";
  } else {
    page.style.pointerEvents = "none";
  }
}

function addLogicFunction(isChild = false, parent = null, depth = 0, defaultText = DEFAULT_FUNCTION_TEXT) {
  let fun = new LogicFunction();
  fun.depth = depth;
  fun.isParam = isChild;

  let wrapper = document.createElement("div");
  wrapper.classList.add("def");
  let button = document.createElement("button");
  button.setAttribute("class", "fname");
  button.classList.add("default");
  button.onclick = ()=>editFunction(fun);
  button.innerText = defaultText;
  wrapper.appendChild(button);
  fun.elem = wrapper;
  fun.buttonElem = button;

  // SIDE EFFECT (fix)
  fun.parentObject = selectedObject;

  if (parent == null) {
    // parent = document.getElementById("program-area");
    parent = selectedObject.logistics;

    // SIDE EFFECT (fix)
    selectedObject.functions.push(fun);
  } else {
    wrapper.classList.add("child");
    wrapper.classList.add("depth-" + ((depth - 1) % 2 + 1));
  }

  // Add to program
  parent.appendChild(wrapper);

  return fun;
}

function addFunctionParameter(functionObject = selectedFunction, required = false, defaultText = DEFAULT_FUNCTION_TEXT) {
  let param = addLogicFunction(required, functionObject.elem, functionObject.depth + 1, defaultText);
  param.parent = functionObject;
  functionObject.parameters[functionObject.paramCount] = param;
  functionObject.paramCount++;
  return param;
}

function editFunction(obj) {
  const menu = document.getElementById("function-menu");
  menu.style.visibility = "visible";

  // Automatically select input box
  const funName = document.getElementById("function-name");
  funName.select();

  ignoreInput = true;
  selectedFunction = obj;
  obj.updateUI();

  updatePointerEvents(false);
}

function closeFunctionMenu() {
  const menu = document.getElementById("function-menu");
  menu.style.visibility = "hidden";
  ignoreInput = false;
  updatePointerEvents(true);
}

function loadBoardData(board) {
  if (boardData)
  for (let r = 0; r < boardData.length; ++r) {
    for (let c = 0; c < boardData[r].length; ++c) {
      let piece = boardData[r][c];
      if (piece === null) continue;
      let name = piece[0];
      let team = piece[1];
      setPiece(board, r, c, name, team);
    }
  }
}

function reloadBoard() {
  globalVars = {};
  disabledSpriteMoves = {};
  clearBoard(game.board);
  loadBoardData(game.board);
  globalFunctions["On Start"].executeListeners();
}

function resetAll() {
  pieces.length = 0;
  rules.length = 0;
  selectedFunction = null;
  selectedObject = defaultObject;
  currentSprite = 0;
  globalVars = {};
  disabledSpriteMoves = {};
  
  // Remove elements
  let pieceElems = document.getElementById("pieces");
  let ruleElems = document.getElementById("rules");
  pieceElems.replaceChildren([]);
  ruleElems.replaceChildren([]);
  setSelectedObject(defaultObject);

  // Remove listeners
  for (let fun of functions) {
    fun.removeListeners();
  }

  // Clear board
  clearBoard(game.board);

}

function exportAll() {
  let pieceObjs = [];
  let ruleObjs = [];
  let board = [];
  let obj = [pieceObjs, ruleObjs, board];

  // Export pieces
  for (let piece of pieces) {
    let funs = [];
    let ruleObj = [piece.name, piece.desc, piece.urls, funs];
    for (let fun of piece.functions) {
      funs.push(fun.export());
    }
    pieceObjs.push(ruleObj);
  }

  // Export rules
  for (let rule of rules) {
    let funs = [];
    let ruleObj = [rule.name, rule.desc, funs];
    for (let fun of rule.functions) {
      funs.push(fun.export());
    }
    ruleObjs.push(ruleObj);
  }

  // Export board
  board.length = game.board.rows;
  // board[0] = game.board.rows;
  // board[1] = game.board.cols;
  // board[2] = Array(game.board.rows);
  for (let r = 0; r < game.board.rows; ++r) {
    board[r] = Array(game.board.cols);
    for (let c = 0; c < game.board.cols; ++c) {
      let tile = game.board.tiles[r][c];
      if (!tile.piece) {
        board[r][c] = null;
      } else {
        board[r][c] = [tile.piece.name, tile.piece.team];
      }
    }
  }

  // Complete export
  let out = JSON.stringify(obj);
  return out;
}

function importAll(json, functionsOnly = false) {
  let data = JSON.parse(json);
  
  let piecesData = data[0];
  let rulesData = data[1];
  boardData = data[2];

  // Pieces
  for (let pieceData of piecesData) {
    let name = pieceData[0];
    let desc = pieceData[1];
    let urls = pieceData[2];
    let funs = pieceData[3];

    const piece = newPieceBlueprint(name);
    piece.desc = desc;
    for (let url of urls)
      piece.addSpriteUrl(url);

    // Logistics
    selectedObject = piece;
    for (let fun of funs) {
      let funName = fun[0];
      let rootFun = addLogicFunction();
      rootFun.import(fun);
    }
  }

  // Rules
  for (let ruleData of rulesData) {
    let name = ruleData[0];
    let desc = ruleData[1];
    let funs = ruleData[2];

    const rule = newRuleBlueprint(name);
    rule.desc = desc;

    // Logistics
    selectedObject = rule;
    for (let fun of funs) {
      let funName = fun[0];
      let rootFun = addLogicFunction();
      rootFun.import(fun);
    }
  }

  // Board
  loadBoardData(game.board);

  // Set this back to default
  selectedObject = defaultObject;
}

function copyGameJson() {
  copyToClipboard(exportAll());
  alert("Copied to Clipboard!");
}

function pasteGameJson() {
  resetAll();
  pasteJson((jsonData) => {
    try {
      importAll(jsonData);
      globalFunctions["On Start"].executeListeners();
    } catch (exception) {
      alert("Failed to load json data");
      console.error(exception);
    }
  });
}

function initUI() {
  // Update info from ui changes
  let title = document.getElementById("selected-title");
  let desc = document.getElementById("selected-desc");
  title.addEventListener("input", ()=>{
    selectedObject.name = title.innerText;
    selectedObject.elems.button.innerText = title.innerText;
  });
  desc.addEventListener("input", ()=>{
    selectedObject.desc = desc.innerText;
  });
  
  // Reset scroll position for input lines
  let elems = document.getElementsByClassName("input-line");
  for (let elem of elems) {
    let originalScrollPos = elem.scrollLeft;
    elem.addEventListener('blur', () => {
      elem.scrollLeft = originalScrollPos;
    });
  }

  // Setup function menu close button
  const closeMenu = document.getElementById("close-fmenu");
  closeMenu.onclick = ()=>closeFunctionMenu();

  // Setup delete function button
  const delFunButton = document.getElementById("delete-function");
  delFunButton.onclick = ()=>{
    if (selectedFunction.isParam) {
      selectedFunction.reset();
    } else {
      selectedFunction.delete();
    }
    closeFunctionMenu();
  }

  // Add premade functions to options list
  const funList = document.getElementById("functions-list");
  for (let fun of functions) {
    let option = document.createElement("option");
    option.setAttribute("value", fun.name);
    funList.appendChild(option);
  }

  // Update currently selected function button name when name is given
  const funName = document.getElementById("function-name");
  funName.onchange = ()=>{
    // Update the function object and button text
    selectedFunction.name = funName.value;
    selectedFunction.buttonElem.innerText = funName.value ? funName.value : selectedFunction.defaultText;

    // Create the parameters
    let found = selectedFunction.setFunction(funName.value);
    if (found) closeFunctionMenu();
  }

  // Update once at the beginning
  updateSpriteUrlButtons();

  // Update disabled buttons
  const rButton = document.getElementById("removing");
  const sButton = document.getElementById("cycle-sprite");
  rButton.disabled = true;
  sButton.disabled = true;

  // Create default object
  defaultObject = new ObjectBlueprint();
  defaultObject.name = "Nothing Selected";
  defaultObject.desc = "This is where you put the description of the object.";
  defaultObject.editable = "false";
  selectedObject = defaultObject;
  selectedObject.updateUI();
  
  // Show the main page
  document.getElementById("main-page").style.visibility = "visible";

}
















