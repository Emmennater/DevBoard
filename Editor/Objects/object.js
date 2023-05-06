
class ObjectBlueprint {
  constructor(name) {
    this.name = name;
    this.desc = "object description";
    this.elems = {};
    this.editable = "plaintext-only";
    this.functions = [];
    this.initLogic();
  }

  initLogic() {
    // const area = document.getElementById("program-area");
    this.logistics = document.createElement("div");
  }
  
  removeFunction(fun) {
    this.functions.removeObj(fun);
  }

  updateUI() {
    
    // Update name
    let title = document.getElementById("selected-title");
    title.setAttribute("contenteditable", this.editable);
    title.innerText = this.name;
    
    // Update desc
    let desc = document.getElementById("selected-desc");
    desc.setAttribute("contenteditable", this.editable);
    desc.innerText = this.desc;
    
    // Enable / Disable remove button
    let removeButton = document.getElementById("remove-obj");
    removeButton.style.visibility = this.editable == "false" ? "hidden" : "visible";
    
    // Enable / Disable program area
    let area = document.getElementById("logic-group");
    area.style.visibility = this.editable == "false" ? "hidden" : "visible";

    // Show logistics
    const program = document.getElementById("program-area");
    program.replaceChildren(this.logistics);

    // Update sprite urls
    let group = document.getElementById("sprite-url-group");
    group.style.visibility = "hidden";
    
  }

}



















