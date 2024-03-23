let jsonArray;
let choosenStartIndex = 0;
let directionValue = 1;

let choosenPropertyName = "";

// Attach event listener to handle file selection
document
  .getElementById("file-input")
  .addEventListener("change", handleFileSelect, false);

function displayObjectProperty(index, jsonArray) {
  const maxIndex = jsonArray.length - 1;
  // Clamping the index within the bounds
  if (index < 0) {
    index = 0;
  } else if (index > maxIndex) {
    index = maxIndex;
  }
  // Assume the property you want to display is called "propertyName"
  const property = jsonArray[index].propertyName;
  document.getElementById("propertyDisplay").textContent = property;
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  // Load the file into a JSON object and process it
  reader.onload = function (event) {
    jsonArray = JSON.parse(event.target.result);
    createRadioButtons(jsonArray);

    document.getElementById("maxIndexDisplay").textContent =
      jsonArray.length - 1;

    // Setup for the input to select the index
    const indexInput = document.getElementById("indexInput");
    indexInput.addEventListener("change", () => {
      let value = parseInt(indexInput.value, 10);
      while (value < 0) {
        value = value + jsonArray.length;
      }
      choosenStartIndex = value % jsonArray.length;
      indexInput.value = choosenStartIndex;
      displayObjectProperty(choosenStartIndex, jsonArray);
      displayPropertyName(choosenPropertyName);
    });

    // Setup for the switch to change the variable value
    const directionSwitch = document.getElementById("directionSwitch");
    // let directionValue = 1; // Default value
    directionSwitch.addEventListener("change", () => {
      directionValue = directionSwitch.checked ? -1 : 1;
      displayPropertyName(choosenPropertyName);
    });
  };
  reader.readAsText(file);
}

// Create radio buttons based on the list of objects' properties
function createRadioButtons(objList) {
  const container = document.getElementById("radio-buttons-container");
  container.innerHTML = ""; // Clear existing buttons

  // Assume objList is an array of objects
  if (objList.length > 0) {
    const obj = objList[0]; // Use the first object to generate the radio buttons
    for (const key in obj) {
      const radioBtn = document.createElement("input");
      radioBtn.type = "radio";
      radioBtn.id = key;
      radioBtn.name = "objectProperty";
      radioBtn.value = key;

      const label = document.createElement("label");
      label.htmlFor = key;
      label.textContent = key;

      container.appendChild(radioBtn);
      container.appendChild(label);

      // Add a line break for visualization purposes
      container.appendChild(document.createElement("br"));
    }

    // Attach event listener to handle radio button selection
    container.addEventListener("change", function (event) {
      if (event.target.type === "radio") {
        displayPropertyName(event.target.value);
      }
    });
  }
}

// This function will display the selected property name below the radio buttons
function displayPropertyName(propertyName) {
  choosenPropertyName = propertyName;
  const display = document.getElementById("selected-property");

  display.textContent =
    propertyName +
    " Start: " +
    jsonArray[choosenStartIndex][propertyName] +
    ", Next: " +
    jsonArray[
      (choosenStartIndex + directionValue + jsonArray.length) % jsonArray.length
    ][propertyName];

  if (jsonArray[choosenStartIndex][propertyName]) {
    document.getElementById("hello").style.visibility = "visible";
  }
}

document.getElementById("hello").addEventListener("click", () => {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage({
      data: {
        jsonArray,
        choosenPropertyName,
        choosenStartIndex,
        directionValue,
      },
    });
  });
});
const recursiveTimeoutedScreenShooter = (nextIndex, tabs) => {
  if (nextIndex < 0 || nextIndex >= tabs.length) return;
  const tab = tabs[nextIndex];
  nextIndex++;

  chrome.tabs.update(tab.id, { active: true }); // switch to the tab to make it visible
  chrome.tabs.captureVisibleTab(
    tab.windowId,
    { quality: 100 },
    function (dataUrl) {
      saveScreenshot(dataUrl, tab.index);
    }
  );
  setTimeout(recursiveTimeoutedScreenShooter(nextIndex, tabs), 334);
};
