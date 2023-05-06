
let TEST;

class PieceBlueprint extends ObjectBlueprint {
  constructor(name) {
    super(name);
    this.desc = "piece description";
    this.urls = [];
    this.sprites = [];
  }
  
  addSpriteUrl(url) {
    // Each url is paired with a sprite
    // that way come removal time they
    // don't get mixed up...
    this.urls.push(url);
    this.sprites.push(null);

    // Load sprite if url is not empty
    if (url) this.loadSprite(this.urls.length - 1);
  }

  loadSprite(index) {
    try {
      loadImage(this.urls[index], img => {
        this.sprites[index] = img;
        // print(img);
      });
    } catch (exception) {
      // Invalid url
    }
  }

  removeSpriteUrl() {
    this.urls.pop();
    this.sprites.pop();
  }

  updateUI() {
    // Update general content
    super.updateUI();

    // Update sprite urls
    let urlList = document.getElementById("sprite-urls-list");
    let group = document.getElementById("sprite-url-group");
    group.style.visibility = "visible";

    // Match the sprite url length
    let difference = this.urls.length - urlList.children.length;
    if (difference > 0) {
      for (let i = 0; i < difference; ++i) {
        let listElem = createSpriteUrlListItem(urlList.children.length + 1);
        urlList.appendChild(listElem);
      }
    } else if (difference < 0) {
      for (let i = 0; i < -difference; ++i) {
        urlList.removeChild(urlList.lastChild);
      }
    }

    // Fill with the urls
    for (let i = 0; i < this.urls.length; ++i) {
      urlList.children[i].children[0].value = this.urls[i];
    }

    // Update the buttons in the gui
    updateSpriteUrlButtons();

  }
}

function newPieceBlueprint(name = null) {
  const CREATED = (name === null);
  let index = pieces.length;
  if (name === null)
    name = "Piece " + (index + 1);
  let piece = new PieceBlueprint(name);
  pieces.push(piece);
  
  // Create button element
  let button = document.createElement("div");
  button.setAttribute("class", "selbutton");
  button.onclick = ()=>setSelectedObject(piece);
  button.innerText = name;
  piece.elems.button = button;
  
  // Append to list
  let elems = document.getElementById("pieces");
  elems.append(button);
  
  // Newly created
  if (CREATED) {
    piece.addSpriteUrl(""); // At least one url
    setSelectedObject(piece);
  }

  return piece;
}


















