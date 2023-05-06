
Array.prototype.removeObj = function(element) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] === element) {
      this.splice(i, 1);
      return i; // exit the loop once the element is found and removed
    }
  }
  return -1;
};

// Function to copy the JSON string to the clipboard
function copyToClipboard(text) {
  const dummyInput = document.createElement('input');
  dummyInput.setAttribute('type', 'text');
  dummyInput.setAttribute('value', text);
  document.body.appendChild(dummyInput);
  dummyInput.select();
  document.execCommand('copy');
  document.body.removeChild(dummyInput);
}

// Function to paste the JSON string from the clipboard
function pasteJson(callback) {
  // Get the text from the clipboard
  navigator.clipboard.readText()
    .then(text => {
      callback(text);
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
