let color = "#3aa757";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.mess === "create") {
    chrome.tabs.create({ url: chrome.runtime.getURL("main/mainTab.html") });
    sendResponse({ mess: "AAAAAAA" });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.mess === "openNew") {
    chrome.tabs.create({
      url: request.url,
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.mess === "download") {
    chrome.downloads.download({
      url: request.obj.url,
      filename: request.obj.filename,
    });
  }
});

chrome.tabs.onHighlighted.addListener(function (tabIds, windowId) {
  chrome.storage.sync.get(
    ["pastPages", "startingURL"],
    async function (result) {
      var pastPages = result.pastPages;
      var startingURL = result.startingURL;
      var [tab] = await chrome.tabs.query({ url: startingURL });
      if (tab.active === true && tab.url.indexOf(startingURL) >= 0) {
        chrome.storage.sync.get(["visitedPages"], function (result) {
          var visitedPages = result.visitedPages;
          chrome.storage.sync.set({ currentURL: tab.url });
          if (!visitedPages.includes(tab.url)) {
            visitedPages.push(tab.url);
            chrome.storage.sync.set({ visitedPages: visitedPages });
          }
        });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: showFirstTimeStar,
        });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: showSidenav,
        });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: countInteractableElements,
        });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: drawOverlays,
        });
        //chiamata a funzione di calcolo elementi cliccabili
      }
    }
  );
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.storage.sync.get(
    ["pastPages", "startingURL"],
    async function (result) {
      var pastPages = result.pastPages;
      var startingURL = result.startingURL;
      if (changeInfo.status === "complete") {
        var reachedURL = tab.url;
        if (reachedURL.indexOf(startingURL) >= 0 && startingURL !== "") {
          chrome.storage.sync.get(["visitedPages"], function (result) {
            chrome.storage.sync.set({ currentURL: tab.url });
            var visitedPages = result.visitedPages;
            if (!visitedPages.includes(tab.url)) {
              visitedPages.push(tab.url);
              chrome.storage.sync.set({ visitedPages: visitedPages });
            }
          });
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showFirstTimeStar,
          });

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showSidenav,
          });
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: countInteractableElements,
          });
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: drawOverlays,
          });
          //chiamata a funzione di calcolo elementi cliccabili
        }
      }
    }
  );
});

function showFirstTimeStar() {
  chrome.storage.sync.get(["pageActions", "currentURL"], function (result) {
    var pageActions = JSON.parse(result.pageActions);
    var currentURL = result.currentURL;
    var oldPage = false;
    for (var i = 0; i < pageActions.length && !oldPage; i++) {
      if (pageActions[i].url === currentURL) {
        oldPage = true;
      }
    }
    if (!oldPage) {
      var found = document.getElementById("gamificationExtensionNewPageStar");
      if (found === null) {
        var div = document.createElement("img");
        document.body.appendChild(div);
        div.id = "gamificationExtensionNewPageStar";
        div.width = 30;
        div.height = 20;
        div.src = chrome.runtime.getURL("img/star.png");
        div.style =
          "position: fixed; bottom: 0;  right: 0;width: 30px;border: 3px solid #FFD700;";
      }
    }
  });
}

function showSidenav() {
  function downloadFile() {
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    chrome.storage.sync.get(
      ["pastPages", "visitedPages", "pageActions"],
      function (result) {
        var pageActions = result.pageActions;
        var pageActionsObj = JSON.parse(pageActions);
        for (var i = 0; i < pageActionsObj.length; i++) {
          var filteredIds = pageActionsObj[i].ids.filter(onlyUnique);
          pageActionsObj[i].ids = filteredIds;
        }
        var blob = new Blob([JSON.stringify(pageActionsObj)], {
          type: "text/plain;charset=UTF-8",
        });
        var url = window.URL.createObjectURL(blob);
        var obj = {
          url: url,
          filename: "gamification-extension-session-records.txt",
        };
        chrome.runtime.sendMessage({ obj: obj, mess: "download" });
      }
    );
  }

  function removeBorders() {
    var nodes = [];

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

    var el = document.body.getElementsByTagName("a");

    for (var i = 0; i < el.length; i++) {
      checkChildren(el[i]);
    }

    for (var i = 0; i < nodes.length; i++) {
      //rimuove i border a ogni oggetto interagibile
      nodes[i].style = "border:0; border-style:solid;";
    }
  }
  var div = document.createElement("div");
  var button = document.createElement("button");
  var found = document.getElementById("gamificationExtensionSidenav");
  if (found === null) {
    document.body.appendChild(button);
    button.id = "gamificationExtensionSidenavButton";
    button.style = "position: absolute; top: 50%; right: 0; width: 100;";
    button.textContent = "Open Menu";
    button.onclick = function () {
      document.getElementById("gamificationExtensionSidenav").style.width =
        "250px";
    };
    document.body.appendChild(div);
    div.id = "gamificationExtensionSidenav";
    div.style =
      "height: 100%; width: 0; position: fixed; z-index: 1; top: 0; right: 0; background-color: #111; overflow-x: hidden; padding-top: 60px; transition: 0.5s;";
    var closeButton = document.createElement("button");
    div.appendChild(closeButton);
    closeButton.id = "gamificationExtensionSidenavCloseButton";
    closeButton.textContent = "Close Menu";
    closeButton.onclick = function () {
      document.getElementById("gamificationExtensionSidenav").style.width = "0";
    };
    var endButton = document.createElement("button");
    div.appendChild(endButton);
    endButton.id = "gamificationExtensionEndSessionButton";
    endButton.textContent = "End Session";
    endButton.style = "bottom: 10%; right: 50%;";
    endButton.onclick = function () {
      //chiudere sidenav ed eliminarla dal documento
      //eliminare overlay aggiunti alla pagina
      //magari ritornare alla homepage dell'estensione?
      downloadFile();
      //chiusura della sidenav
      document.getElementById("gamificationExtensionSidenav").style.width = "0";
      button.parentElement.removeChild(button);
      div.parentElement.removeChild(div);
      //rimozione della stella se la pagina è una vista per la prima volta
      var star = document.getElementById("gamificationExtensionNewPageStar");
      if (star != null) {
        document.body.removeChild(star);
      }
      removeBorders();
      //l'url di partenza viene cancellato per evitare di mostrare di nuovo tutte le aggiunte alla pagina
      chrome.storage.sync.set({ startingURL: "" });
    };
  }
}

function countInteractableElements() {
  chrome.storage.sync.get(["currentURL"], function (result) {
    var currentURL = result.currentURL;
    var el = document.body.getElementsByTagName("a");
    //Ricercare tutti i possibili elementi comuni (nav, button, a, tabelle)?

    for (var i = 0; i < el.length; i++) {
      //aggiunge un outline generico ad ogni oggetto individuato
      //el[i].style =
      //"border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
      //funzione chiamata ogni volta che un link viene cliccato
      el[i].addEventListener("click", function (event) {
        var found = false;
        var els = document.body.getElementsByTagName("a");
        for (var j = 0; j < els.length && !found; j++) {
          if (els[j].href === event.target.href) {
            found = true;
            chrome.storage.sync.get(["pageActions"], function (result) {
              var array = [];
              array.push(j - 1);
              var obj = { url: currentURL, ids: array };
              var retrievedObj = JSON.parse(result.pageActions);
              var newPage = true;
              for (var k = 0; k < retrievedObj.length && newPage; k++) {
                if (retrievedObj[k].url === currentURL) {
                  newPage = false;
                  var ids = retrievedObj[k].ids;
                  var pos = ids.indexOf(j);
                  if (pos === -1) {
                    ids.push(j - 1);
                    retrievedObj.ids = ids;
                  }
                }
              }
              if (newPage) {
                retrievedObj.push(obj);
              }
              var pageActions = JSON.stringify(retrievedObj);
              chrome.storage.sync.set({ pageActions: pageActions });
            });
          }
        }
      });
    }
  });
}

function drawOverlays() {
  chrome.storage.sync.get(["pageActions", "currentURL"], function (result) {
    var retrievedObj = JSON.parse(result.pageActions);
    var el = document.body.getElementsByTagName("a");

    for (var i = 0; i < retrievedObj.length; i++) {
      if (retrievedObj[i].url === result.currentURL) {
        var ids = retrievedObj[i].ids;
        for (var j = 0; j < el.length; j++) {
          if (ids.indexOf(j - 1) >= 0) {
            el[j - 1].style =
              "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
          }
        }
      }
    }
  });
}
