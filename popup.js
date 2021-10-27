let mainButton = document.getElementById("mainButton");

mainButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.storage.sync.set({ tabId: tab.id });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: openMainTab,
  });
});

function openMainTab() {
  chrome.runtime.sendMessage({ mess: "create" }, function (response) {
    console.log(response);
  });
}
