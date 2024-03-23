let = jsonArray = [];
let choosenPropertyName = "";
let choosenStartIndex = 0;
let directionValue = 1;
function captureTab(tab, tabIndex) {
  return new Promise((resolve, reject) => {
    chrome.tabs.update(tab.id, { active: true }); // switch to the tab to make it visible
    chrome.tabs.captureVisibleTab(
      tab.windowId,
      { format: "png" },
      (imageUri) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error capturing tab: " + chrome.runtime.lastError.message
          );
          reject(chrome.runtime.lastError);
        } else {
          // You can save the screenshot data URI to disk or do something else with it here
          console.log("Captured tab: " + tab.url);
          saveScreenshot(imageUri, tabIndex);
          resolve(imageUri);
        }
      }
    );
  });
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
    filename = filename.replace("/", "-");
  }
  await chrome.downloads.download({
    url: url,
    filename: `${tabIndex}_${filename}.png`, // Save to this filename
    conflictAction: "uniquify", // If a file with this name exists, Chrome will add a number to make it unique
    saveAs: false,
  });
}
async function screenshotAllTabs() {
  const queryOptions = { currentWindow: true };
  const imagesURis = [];
  await chrome.tabs.query(queryOptions, async (tabs) => {
    for (const tab of tabs) {
      // Avoid screenshotting chrome:// pages as they are restricted
      if (!tab.url.startsWith("chrome://")) {
        imagesURis.push(await captureTab(tab, tabs.indexOf(tab)));
        await delay(1000); // 1 second delay between captures
      } else {
        console.log("Skipping screenshot for chrome:// URL.");
      }
    }
    return imagesURis;
  });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  jsonArray = message.data.jsonArray;
  choosenPropertyName = message.data.choosenPropertyName;
  choosenStartIndex = message.data.choosenStartIndex;
  directionValue = message.data.directionValue;
  // Process the received message and data (from content script)
  console.log("Background script received message:", message.data);
  screenshotAllTabs();
  // You can optionally send a response back to the content script
});
// // To initiate the screenshot process, you could call screenshotAllTabs in response to some event, like a browser action click
// chrome.browserAction.onClicked.addListener(() => {
//   screenshotAllTabs();
// });
