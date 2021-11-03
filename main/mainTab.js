var recordFileButton = document.getElementById("recordFileButton");
var profileFileButton = document.getElementById("profileFileButton");
var pageURL = document.getElementById("pageURL");
var pageURLButton = document.getElementById("pageURLButton");
var url = "";

var total = [];
recordFileButton.addEventListener("click", function () {
  var input = recordFileButton.parentElement.getElementsByTagName("input");
  input[0].addEventListener("change", function () {
    var fr = new FileReader();

    fr.onload = function () {
      chrome.storage.sync.set({ pageActions: fr.result });
    };
    fr.readAsText(this.files[0]);
  });
  $($(this).parent().find("input")).click();
});

pageURLButton.addEventListener("click", async () => {
  var url = document.getElementById("pageURL").value;
  var [tab] = await chrome.tabs.query({ url: url });
  var domain = new URL(url);
  var empty = [];

  chrome.storage.sync.set({ startingURL: domain.hostname });
  chrome.storage.sync.set({ visitedPages: [] });
  chrome.storage.sync.set({ pageStats: JSON.stringify(empty) });
  if (tab === undefined) {
    chrome.runtime.sendMessage({
      mess: "openNew",
      url: url,
    });
  } else {
    chrome.tabs.update(tab.id, { highlighted: true });
  }
});
