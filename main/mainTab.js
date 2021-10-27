var recordFileButton = document.getElementById("recordFileButton");
var profileFileButton = document.getElementById("profileFileButton");
var pageURL = document.getElementById("pageURL");
var pageURLButton = document.getElementById("pageURLButton");
var url = "";

window.addEventListener("popstate", function (event) {
  console.log(event.state);
});

var total = [];
recordFileButton.addEventListener("click", function () {
  var input = recordFileButton.parentElement.getElementsByTagName("input");
  input[0].addEventListener("change", function () {
    var fr = new FileReader();

    fr.onload = function () {
      chrome.storage.sync.set({ pageActions: fr.result });
      //console.log(fr.result);
      /*var res = fr.result;
      var str = "";
      for (var i = 0; i < res.length; i++) {
        if (res[i] !== ";" && res[i] !== "\n") {
          str += res[i];
        } else {
          total.push(str);
          str = "";
        }
      }

      chrome.storage.sync.set({ pastPages: total });*/
    };
    fr.readAsText(this.files[0]);
  });
  $($(this).parent().find("input")).click();
});

pageURLButton.addEventListener("click", async () => {
  var url = document.getElementById("pageURL").value;
  //TODO: check if correct url
  var [tab] = await chrome.tabs.query({ url: url });
  chrome.storage.sync.set({ startingURL: url });
  chrome.storage.sync.set({ visitedPages: [] });
  //var pageActions = JSON.stringify([]);
  //chrome.storage.sync.set({ pageActions: pageActions });
  if (tab === undefined) {
    chrome.runtime.sendMessage({
      mess: "openNew",
      url: url,
    });
  } else {
    chrome.tabs.update(tab.id, { highlighted: true });
  }
});
