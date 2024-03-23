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

async function saveScreenshot(dataUrl, tabIndex) {
  if (!dataUrl) return;
  const url = dataUrl.replace(
    /^data:image\/[^;]/,
    "data:application/octet-stream"
  );

  let filename = tabIndex;
  if (jsonArray.length > 0 && choosenPropertyName !== "") {
    let _index = choosenStartIndex + directionValue * tabIndex;
    while (_index < 0) {
      _index = _index + jsonArray.length;
    }
    _index = _index % jsonArray.length;
    filename = jsonArray[_index][choosenPropertyName];
    filename = filename.replace("/", "_");
  }
  await chrome.downloads.download({
    url: url,
    filename: `screensh00ting/${tabIndex}_${filename}.png`, // Save to this filename
    conflictAction: "uniquify", // If a file with this name exists, Chrome will add a number to make it unique
    saveAs: false,
  });
  await delay(1000);
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
document.getElementById("hello").addEventListener("click", () => {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    // get all tabs in current window
    // for (let tab of tabs) {
    chrome.runtime.sendMessage({
      data: {
        jsonArray,
        choosenPropertyName,
        choosenStartIndex,
        directionValue,
      },
    });
    // screenshotAllTabs((dataUrl, tabIndex) => saveScreenshot(dataUrl, tabIndex));
    // recursiveTimeoutedScreenShooter(0, tabs);

    // chrome.tabs.update(tab.id, { active: true }); // switch to the tab to make it visible
    // chrome.tabs.captureVisibleTab(
    //   tab.windowId,
    //   { quality: 100 },
    //   function (dataUrl) {
    //     saveScreenshot(dataUrl, tab.index);
    //   }
    // );
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
// function helloWorld() {
//   alert("Hello, world!");
// }

// You also need to ensure that you have the permission to access the file URL in manifest.json if it's a local file
// const jsonFilePath = "path_to_your_json_file/objects.json";

// // Function to read the JSON file and parse it
// function loadJsonFile(callback) {
//   fetch(jsonFilePath)
//     .then((response) => response.json())
//     .then((data) => callback(data))
//     .catch((error) => console.error("Error loading JSON:", error));
// }

// Function to update the display with the chosen object property

// Initial setup once JSON is loaded
// loadJsonFile((jsonArray) => {
//   // Display the max index in the UI
//   document.getElementById("maxIndexDisplay").textContent = jsonArray.length - 1;

//   // Setup for the input to select the index
//   const indexInput = document.getElementById("indexInput");
//   indexInput.addEventListener("change", () => {
//     displayObjectProperty(parseInt(indexInput.value, 10), jsonArray);
//   });

//   // Setup for the switch to change the variable value
//   const directionSwitch = document.getElementById("directionSwitch");
//   let directionValue = 1; // Default value
//   directionSwitch.addEventListener("change", () => {
//     directionValue = directionSwitch.checked ? -1 : 1;
//   });
// });
