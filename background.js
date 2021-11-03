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
      var [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (
        tab.active === true &&
        tab.url.indexOf(startingURL) >= 0 &&
        startingURL !== ""
      ) {
        chrome.storage.sync.get(["visitedPages"], function (result) {
          var visitedPages = result.visitedPages;
          chrome.storage.sync.set({ currentURL: tab.url }, function () {
            if (!visitedPages.includes(tab.url)) {
              visitedPages.push(tab.url);
              chrome.storage.sync.set({ visitedPages: visitedPages });
            }
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
              function: showTopbar,
            });
          });
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
            chrome.storage.sync.set({ currentURL: tab.url }, function () {
              var visitedPages = result.visitedPages;
              if (!visitedPages.includes(tab.url)) {
                visitedPages.push(tab.url);
                chrome.storage.sync.set({ visitedPages: visitedPages });
              }
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
                function: showTopbar,
              });
            });
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
  function isButtonOfExtension(button) {
    return (
      button.id === "gamificationExtensionRemoveOverlaysButton" ||
      button.id === "gamificationExtensionSidenavButton" ||
      button.id === "gamificationExtensionSidenavCloseButton" ||
      button.id === "gamificationExtensionEndSessionButton" ||
      button.id === "gamificationExtensionToggleClickedElementsButton" ||
      button.id === "gamificationExtensionRemoveOverlaysButton" ||
      button.id === "gamificationExtensionToggleAllElementsButton"
    );
  }

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
          var filteredLinkIds =
            pageActionsObj[i].idsOfLinkObjects.filter(onlyUnique);
          pageActionsObj[i].idsOfLinkObjects = filteredLinkIds;
          var filteredInputIds =
            pageActionsObj[i].idsOfInputObjects.filter(onlyUnique);
          pageActionsObj[i].idsOfInputObjects = filteredInputIds;
          var filteredButtonIds =
            pageActionsObj[i].idsOfButtonObjects.filter(onlyUnique);
          pageActionsObj[i].idsOfButtonObjects = filteredButtonIds;
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
    var linksToRemove = document.body.getElementsByTagName("a");
    for (var i = 0; i < linksToRemove.length; i++) {
      //rimuove i border a ogni oggetto interagibile
      linksToRemove[i].style = "border:0; border-style:solid;";
    }

    var inputsToRemove = document.body.getElementsByTagName("input");
    for (var i = 0; i < inputsToRemove.length; i++) {
      inputsToRemove[i].style = "border:0; border-style:solid;";
    }

    var buttonsToRemove = document.body.getElementsByTagName("button");
    for (var i = 0; i < buttonsToRemove.length; i++) {
      if (!isButtonOfExtension(buttonsToRemove[i]))
        buttonsToRemove[i].style = "border:0; border-style:solid;";
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
      "height: 100%; width: 0; position: fixed; z-index: 1; top: 0; right: 0; background-color: rgb(211 245 230); overflow-x: hidden; padding-top: 60px; transition: 0.5s;";
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
      var topnav = document.getElementById("gamificationExtensionTopnav");
      if (topnav != null) {
        document.body.removeChild(topnav);
      }
      //l'url di partenza viene cancellato per evitare di mostrare di nuovo tutte le aggiunte alla pagina
      chrome.storage.sync.set({ startingURL: "" });
    };

    var toggleClickedElementsButton = document.createElement("button");
    div.appendChild(toggleClickedElementsButton);
    toggleClickedElementsButton.id =
      "gamificationExtensionToggleClickedElementsButton";
    toggleClickedElementsButton.textContent = "Show Interacted Elements";
    toggleClickedElementsButton.onclick = function () {
      var linksToRemove = document.body.getElementsByTagName("a");
      for (var i = 0; i < linksToRemove.length; i++) {
        //rimuove i border a ogni oggetto interagibile
        linksToRemove[i].style = "border:0; border-style:solid;";
      }

      var inputsToRemove = document.body.getElementsByTagName("input");
      for (var i = 0; i < inputsToRemove.length; i++) {
        inputsToRemove[i].style = "border:0; border-style:solid;";
      }

      var buttonsToRemove = document.body.getElementsByTagName("button");
      for (var i = 0; i < buttonsToRemove.length; i++) {
        if (!isButtonOfExtension(buttonsToRemove[i]))
          buttonsToRemove[i].style = "border:0; border-style:solid;";
      }

      chrome.storage.sync.get(["pageActions", "currentURL"], function (result) {
        var retrievedObj = JSON.parse(result.pageActions);
        var links = document.body.getElementsByTagName("a");
        var inputs = document.body.getElementsByTagName("input");
        var buttons = document.body.getElementsByTagName("button");

        for (var i = 0; i < retrievedObj.length; i++) {
          if (retrievedObj[i].url === result.currentURL) {
            var idsOfLinkObjects = retrievedObj[i].idsOfLinkObjects;
            for (var j = 0; j < links.length; j++) {
              if (idsOfLinkObjects.indexOf(j - 1) >= 0) {
                links[j - 1].style =
                  "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
              }
            }

            var idsOfInputObjects = retrievedObj[i].idsOfInputObjects;
            for (var j = 0; j < inputs.length; j++) {
              if (idsOfInputObjects.indexOf(j - 1) >= 0) {
                inputs[j - 1].style =
                  "border:3px; border-style:solid; border-color:#00FF00; padding: 1em;";
              }
            }

            var idsOfButtonObjects = retrievedObj[i].idsOfButtonObjects;
            for (var j = 0; j < idsOfButtonObjects.length; j++) {
              if (
                idsOfButtonObjects.indexOf(j - 1) >= 0 &&
                !isButtonOfExtension(buttons[j - 1])
              ) {
                buttons[j - 1].style =
                  "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;";
              }
            }
          }
        }
      });
    };

    var removeOverlaysButton = document.createElement("button");
    div.appendChild(removeOverlaysButton);
    removeOverlaysButton.id = "gamificationExtensionRemoveOverlaysButton";
    removeOverlaysButton.textContent = "Remove Overlays";
    removeOverlaysButton.onclick = function () {
      var linksToRemove = document.body.getElementsByTagName("a");
      for (var i = 0; i < linksToRemove.length; i++) {
        //rimuove i border a ogni oggetto interagibile
        linksToRemove[i].style = "border:0; border-style:solid;";
      }

      var inputsToRemove = document.body.getElementsByTagName("input");
      for (var i = 0; i < inputsToRemove.length; i++) {
        inputsToRemove[i].style = "border:0; border-style:solid;";
      }

      var buttonsToRemove = document.body.getElementsByTagName("button");
      for (var i = 0; i < buttonsToRemove.length; i++) {
        if (!isButtonOfExtension(buttonsToRemove[i]))
          buttonsToRemove[i].style = "border:0; border-style:solid;";
      }
    };

    var toggleAllElementsButton = document.createElement("button");
    div.appendChild(toggleAllElementsButton);
    toggleAllElementsButton.id = "gamificationExtensionToggleAllElementsButton";
    toggleAllElementsButton.textContent = "Show All Elements";
    toggleAllElementsButton.onclick = function () {
      var links = document.body.getElementsByTagName("a");
      for (var i = 0; i < links.length; i++) {
        links[i].style =
          "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
      }

      var inputs = document.body.getElementsByTagName("input");
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].style =
          "border:3px; border-style:solid; border-color:#00FF00; padding: 1em;";
      }

      var buttons = document.body.getElementsByTagName("button");
      for (var i = 0; i < buttons.length; i++) {
        if (!isButtonOfExtension(buttons[i])) {
          buttons[i].style =
            "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;";
        }
      }
    };

    chrome.storage.sync.get(
      ["pageActions", "pageStats", "currentURL"],
      function (result) {
        var pageActions = JSON.parse(result.pageActions);
        var pageStats = JSON.parse(result.pageStats);
        function filterURL(event) {
          return event.url === result.currentURL;
        }
        var stats = pageStats.filter(filterURL)[0];
        var actions = pageActions.filter(filterURL)[0];
        var noStats = stats === undefined;
        var noActions = actions === undefined;
        console.log(actions);

        var table = document.createElement("table");
        var linksRow = table.insertRow();
        for (var i = 0; i < 4; i++) {
          var cell = linksRow.insertCell();
          var text = "";
          switch (i) {
            case 0:
              text = "Links";
              break;
            case 1:
              text = noStats ? 0 : stats.interactedLinks.length;
              break;
            case 2:
              text = noStats ? 0 : stats.newLinks.length;
              break;
            case 3:
              text = noActions ? 0 : actions.idsOfLinkObjects.length;
              break;
          }
          cell.appendChild(document.createTextNode(text));
        }
        var inputsRow = table.insertRow();
        for (var i = 0; i < 4; i++) {
          var cell = inputsRow.insertCell();
          var text = "";
          switch (i) {
            case 0:
              text = "Forms";
              break;
            case 1:
              text = noStats ? 0 : stats.interactedInputs.length;
              break;
            case 2:
              text = noStats ? 0 : stats.newInputs.length;
              break;
            case 3:
              text = noActions ? 0 : actions.idsOfInputObjects.length;
              break;
          }
          cell.appendChild(document.createTextNode(text));
        }
        var buttonsRow = table.insertRow();
        for (var i = 0; i < 4; i++) {
          var cell = buttonsRow.insertCell();
          var text = "";
          switch (i) {
            case 0:
              text = "Buttons";
              break;
            case 1:
              text = noStats ? 0 : stats.interactedButtons.length;
              break;
            case 2:
              text = noStats ? 0 : stats.newButtons.length;
              break;
            case 3:
              text = noActions ? 0 : actions.idsOfButtonObjects.length;
              break;
          }
          cell.appendChild(document.createTextNode(text));
        }

        var tableHead = table.createTHead();
        var headRow = tableHead.insertRow();
        var th1 = document.createElement("th");
        var text1 = document.createTextNode("");
        th1.appendChild(text1);
        var th2 = document.createElement("th");
        var text2 = document.createTextNode("Current Session");
        th2.appendChild(text2);
        var th3 = document.createElement("th");
        var text3 = document.createTextNode("New");
        th3.appendChild(text3);
        var th4 = document.createElement("th");
        var text4 = document.createTextNode("Total");
        th4.appendChild(text4);
        headRow.appendChild(th1);
        headRow.appendChild(th2);
        headRow.appendChild(th3);
        headRow.appendChild(th4);

        div.appendChild(table);
      }
    );

    /*var pagesRow = table.insertRow();
    for (var i = 0; i < 4; i++) {
      var cell = pagesRow.insertCell();
      var text = i === 0 ? "Pages" : i;
      cell.appendChild(document.createTextNode(text));
    }*/
  }
}

function countInteractableElements() {
  function isButtonOfExtension(button) {
    return (
      button.id === "gamificationExtensionRemoveOverlaysButton" ||
      button.id === "gamificationExtensionSidenavButton" ||
      button.id === "gamificationExtensionSidenavCloseButton" ||
      button.id === "gamificationExtensionEndSessionButton" ||
      button.id === "gamificationExtensionToggleClickedElementsButton" ||
      button.id === "gamificationExtensionRemoveOverlaysButton" ||
      button.id === "gamificationExtensionToggleAllElementsButton"
    );
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  chrome.storage.sync.get(
    ["currentURL", "pageActions", "pageStats"],
    function (result) {
      var currentURL = result.currentURL;

      //ottiene tutti gli elementi di tipo 'a' (link ad altre pagine)
      var linkObjects = document.body.getElementsByTagName("a");
      var totalLinkObjects = linkObjects.length;

      //ottiene tutti i campi di input della pagina
      var inputObjects = document.body.getElementsByTagName("input");
      var totalInputObjects = inputObjects.length;

      //ottiene tutti i buttons presenti nella pagina
      var buttonObjects = document.body.getElementsByTagName("button");
      var totalButtonObjects = 0;
      for (var i = 0; i < buttonObjects.length; i++) {
        if (!isButtonOfExtension(buttonObjects[i])) {
          totalButtonObjects++;
        }
      }

      var obj = {
        url: currentURL,
        idsOfLinkObjects: [],
        totalLinkObjects: totalLinkObjects,
        idsOfInputObjects: [],
        totalInputObjects: totalInputObjects,
        idsOfButtonObjects: [],
        totalButtonObjects: totalButtonObjects,
      };
      var retrievedObj = JSON.parse(result.pageActions);
      var newPage = true;
      for (var i = 0; i < retrievedObj.length && newPage; i++) {
        //magari in futuro aggiungere controlli sulla differenza del numero di oggetti interagibili
        if (retrievedObj[i].url === currentURL) {
          newPage = false;
        }
      }
      if (newPage) {
        retrievedObj.push(obj);
      }
      var pageActions = JSON.stringify(retrievedObj);
      chrome.storage.sync.set({ pageActions: pageActions });

      var psObj = {
        url: currentURL,
        interactedLinks: [],
        interactedInputs: [],
        interactedButtons: [],
        newLinks: [],
        newInputs: [],
        newButtons: [],
      };
      var pageStatsObj = JSON.parse(result.pageStats);
      newPage = true;
      for (var i = 0; i < pageStatsObj.length && newPage; i++) {
        if (pageStatsObj[i].url === currentURL) {
          newPage = false;
        }
      }
      if (newPage) {
        pageStatsObj.push(psObj);
      }
      chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj) });

      for (var i = 0; i < linkObjects.length; i++) {
        //funzione chiamata ogni volta che un link viene cliccato
        linkObjects[i].addEventListener("click", function (event) {
          var found = false;
          var els = document.body.getElementsByTagName("a");
          for (var j = 0; j < els.length && !found; j++) {
            if (els[j].href === event.target.href) {
              found = true;
              chrome.storage.sync.get(
                ["pageActions", "pageStats"],
                function (result) {
                  var retrievedObj = JSON.parse(result.pageActions);
                  for (var k = 0; k < retrievedObj.length; k++) {
                    if (retrievedObj[k].url === currentURL) {
                      var ids = retrievedObj[k].idsOfLinkObjects;
                      var pos = ids.indexOf(j);
                      if (pos < 0) {
                        ids.push(j - 1);
                        retrievedObj.idsOfLinkObjects = ids;
                      }
                    }
                  }
                  var pageActions = JSON.stringify(retrievedObj);

                  var pageStatsObj = JSON.parse(result.pageStats);
                  chrome.storage.sync.set({ pageActions: pageActions });
                }
              );
            }
          }
        });
      }

      for (var i = 0; i < inputObjects.length; i++) {
        inputObjects[i].addEventListener("click", function (event) {
          event.preventDefault();
          var els = document.body.getElementsByTagName("input");
          var found = false;
          for (var j = 0; j < els.length && !found; j++) {
            if (els[j].id === event.target.id) {
              found = true;
              chrome.storage.sync.get(
                ["pageActions", "pageStats"],
                function (result) {
                  var retrievedObj = JSON.parse(result.pageActions);
                  var newInput = false;
                  for (var k = 0; k < retrievedObj.length; k++) {
                    if (retrievedObj[k].url === currentURL) {
                      var ids = retrievedObj[k].idsOfInputObjects;
                      var pos = ids.indexOf(j);
                      if (pos < 0) {
                        ids.push(j - 1);
                        retrievedObj.idsOfInputObjects = ids;
                        newInput = true;
                      }
                      var pageActions = JSON.stringify(retrievedObj);
                      var pageStatsObj = JSON.parse(result.pageStats);
                      for (var m = 0; m < pageStatsObj.length; m++) {
                        if (pageStatsObj[m].url === currentURL) {
                          var ids = pageStatsObj[m].interactedInputs;
                          var pos = ids.indexOf(j);
                          if (pos < 0) {
                            ids.push(j);
                            pageStatsObj[m].interactedInputs = ids;
                          }
                          if (newInput === true) {
                            var ids = pageStatsObj[m].newInputs;
                            var pos = ids.indexOf(j);
                            if (pos < 0) {
                              ids.push(j);
                              pageStatsObj[m].newInputs = ids;
                            }
                          }
                        }
                      }
                      chrome.storage.sync.set({ pageActions: pageActions });
                      var innerDiv = document.getElementById(
                        "gamificationExtensionTopnavInner"
                      );
                      var totalLinkObjects = retrievedObj[k].totalLinkObjects;
                      var totalInputObjects = retrievedObj[k].totalInputObjects;
                      var totalButtonObjects =
                        retrievedObj[k].totalButtonObjects;
                      var interactedLinks =
                        retrievedObj[k].idsOfLinkObjects.filter(
                          onlyUnique
                        ).length;
                      var interactedInputs =
                        retrievedObj[k].idsOfInputObjects.filter(
                          onlyUnique
                        ).length;
                      var interactedButtons =
                        retrievedObj[k].idsOfButtonObjects.filter(
                          onlyUnique
                        ).length;
                      var progress =
                        ((interactedLinks +
                          interactedInputs +
                          interactedButtons) *
                          100) /
                        (totalLinkObjects +
                          totalInputObjects +
                          totalButtonObjects);
                      innerDiv.style =
                        `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
                        progress +
                        `%; white-space:nowrap`;
                      innerDiv.textContent = "Progress: " + progress + "%";
                    }
                  }
                }
              );
            }
          }
        });
      }

      for (var i = 0; i < buttonObjects.length; i++) {
        if (!isButtonOfExtension(buttonObjects[i])) {
          buttonObjects[i].addEventListener("click", function (event) {
            var els = document.body.getElementsByTagName("button");
            var found = false;
            for (var j = 0; j < els.length && !found; j++) {
              if (els[j].id === event.target.id) {
                found = true;
                chrome.storage.sync.get(
                  ["pageActions", "pageStats"],
                  function (result) {
                    var retrievedObj = JSON.parse(result.pageActions);
                    for (var k = 0; k < retrievedObj.length; k++) {
                      if (retrievedObj[k].url === currentURL) {
                        var ids = retrievedObj[k].idsOfButtonObjects;
                        var pos = ids.indexOf(j);
                        if (pos < 0) {
                          ids.push(j - 1);
                          retrievedObj.idsOfButtonObjects = ids;
                        }
                        var innerDiv = document.getElementById(
                          "gamificationExtensionTopnavInner"
                        );
                        var totalLinkObjects = retrievedObj[k].totalLinkObjects;
                        var totalInputObjects =
                          retrievedObj[k].totalInputObjects;
                        var totalButtonObjects =
                          retrievedObj[k].totalButtonObjects;
                        var interactedLinks =
                          retrievedObj[k].idsOfLinkObjects.filter(
                            onlyUnique
                          ).length;
                        var interactedInputs =
                          retrievedObj[k].idsOfInputObjects.filter(
                            onlyUnique
                          ).length;
                        var interactedButtons =
                          retrievedObj[k].idsOfButtonObjects.filter(
                            onlyUnique
                          ).length;
                        var progress =
                          ((interactedLinks +
                            interactedInputs +
                            interactedButtons) *
                            100) /
                          (totalLinkObjects +
                            totalInputObjects +
                            totalButtonObjects);
                        innerDiv.style =
                          `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
                          progress +
                          `%; white-space:nowrap`;
                        innerDiv.textContent = "Progress: " + progress + "%";
                      }
                    }
                    var pageActions = JSON.stringify(retrievedObj);

                    var pageStatsObj = JSON.parse(result.pageStats);
                    chrome.storage.sync.set({ pageActions: pageActions });
                  }
                );
              }
            }
          });
        }
      }
    }
  );
}

function showTopbar() {
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  chrome.storage.sync.get(["pageActions", "currentURL"], function (result) {
    var pageActions = JSON.parse(result.pageActions);
    var currentURL = result.currentURL;
    for (var i = 0; i < pageActions.length; i++) {
      if (pageActions[i].url === currentURL) {
        var totalLinkObjects = pageActions[i].totalLinkObjects;
        var totalInputObjects = pageActions[i].totalInputObjects;
        var totalButtonObjects = pageActions[i].totalButtonObjects;
        var interactedLinks =
          pageActions[i].idsOfLinkObjects.filter(onlyUnique).length;
        var interactedInputs =
          pageActions[i].idsOfInputObjects.filter(onlyUnique).length;
        var interactedButtons =
          pageActions[i].idsOfButtonObjects.filter(onlyUnique).length;
        var progress =
          ((interactedLinks + interactedInputs + interactedButtons) * 100) /
          (totalLinkObjects + totalInputObjects + totalButtonObjects);
      }
    }
    var topnav = document.createElement("div");
    topnav.id = "gamificationExtensionTopnav";
    var found = document.getElementById("gamificationExtensionTopnav");
    if (found === null) {
      document.body.appendChild(topnav);
      topnav.style =
        "background-color: transparent;position: fixed;bottom: 0;width: 100%;";
      var outerDiv = document.createElement("div");
      outerDiv.id = "gamificationExtensionTopnavOuter";
      outerDiv.style =
        "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
      topnav.appendChild(outerDiv);
      var innerDiv = document.createElement("div");
      innerDiv.id = "gamificationExtensionTopnavInner";
      if (progress === undefined) {
        progress = 0;
      }
      innerDiv.style =
        `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
        progress +
        `%; white-space:nowrap`;
      innerDiv.textContent = "Progress: " + progress + "%";
      outerDiv.appendChild(innerDiv);
    }
  });
}
