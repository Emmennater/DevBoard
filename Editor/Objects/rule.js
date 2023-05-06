
class RuleBlueprint extends ObjectBlueprint {
  constructor(name) {
    super(name);
    this.desc = "rule description";
  }
}

function newRuleBlueprint(name = null) {
  const CREATED = (name === null);
  let index = rules.length;
  if (name === null)
    name = "Rule " + (index + 1);
  let obj = new RuleBlueprint(name);
  rules.push(obj);
  
  // Create element
  let button = document.createElement("div");
  button.setAttribute("class", "selbutton");
  button.onclick = ()=>setSelectedObject(obj);
  button.innerText = name;
  obj.elems.button = button;
  
  // Append to list
  let elems = document.getElementById("rules");
  elems.append(button);
  
  // Newly created
  if (CREATED) {
    setSelectedObject(obj);
  }
  
  return obj;
}
