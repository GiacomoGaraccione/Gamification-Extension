let mainButton = document.getElementById("mainButton");
let endButton = document.getElementById("endButton");
let beginButton = document.getElementById("beginButton");

mainButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  mainButton.hidden = true;
  beginButton.hidden = false;
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

endButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: endSession,
  });
});

function endSession() {
  chrome.storage.sync.get(["fileContent"], function (result) {
    var blob = new Blob(result.fileContent, {
      type: "text/plain;charset=UTF-8",
    });
    var url = window.URL.createObjectURL(blob);
    var obj = { url: url, filename: "prova.txt" };
    chrome.runtime.sendMessage({ obj: obj }, function (response) {
      console.log(response.mess);
    });
  });
}

beginButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.sync.set({ tabId: tab.id });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: beginSession,
  });
});

// The body of this function will be executed as a content script inside the
// current page
function beginSession() {
  var nodes = [];
  var offsets = [];
  /*
  function checkChildren(node) {
    var divChildren = node.getElementsByTagName("div");
    if (divChildren.length > 0) {
      for (var i = 0; i < divChildren.length; i++) {
        checkChildren(divChildren[i]);
      }
    } else {
      if (!nodes.includes(node)) {
        nodes.push(node);
      }
    }
  }

  var el = document.body.getElementsByTagName("div");

  for (var i = 0; i < el.length; i++) {
    checkChildren(el[i]);
  }
  var count = 1;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].childNodes.length === 1) {
      //l'idea sarebbe prendere l'oggetto contenuto dal div se quest'ultimo ha un solo child
      //console.log("1 solo figlio ", nodes[i].childNodes[0]);
      var rect = nodes[i].childNodes[0].getBoundingClientRect();
      //console.log("posizione: ", rect);
      var temp =
        "Item number " + //idealmente dovrebbe essere l'id univoco dell'oggetto ma alcuni non lo hanno
        count +
        ": " +
        rect.x +
        "," +
        rect.y +
        "," +
        rect.height +
        "," +
        rect.width +
        "\n";
      offsets.push(temp);
      count++;
    } else if (nodes[i].childNodes.length >= 2) {
      //e prendere il div contenente tutti i figli se questo ne ha almeno 2
      //console.log("almeno 2 figli ", nodes[i]);
      var rect = nodes[i].getBoundingClientRect();
      var temp =
        "Item number " +
        count +
        ": " +
        rect.x +
        "," +
        rect.y +
        "," +
        rect.height +
        "," +
        rect.width +
        "\n";
      offsets.push(temp);
      count++;
      //console.log("posizione: ", rect);
    } //div con numero di figli uguale a 0 sono da ignorare o no?
  }
  chrome.storage.sync.set({
    fileContent: offsets, //["fileContent\n", "aaaaaa\n", "12345\n", "fsssf\n"],
  });*/
}
