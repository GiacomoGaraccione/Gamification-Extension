
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.mess === "create") {
    chrome.tabs.create({ url: chrome.runtime.getURL("main/mainTab.html") });
    sendResponse({ mess: "Main tab opened correctly" });
  } else if (request.mess === "openNew") {
    chrome.tabs.create({
      url: request.url,
    });
  } else if (request.mess === "download") {
    chrome.downloads.download({
      url: request.obj.url,
      filename: request.obj.filename,
    });
  } else if (request.mess === "notification") {
    chrome.notifications.create(
      null,
      {
        type: 'basic',
        iconUrl: request.obj.path,
        title: request.obj.title,
        message: request.obj.message,
        priority: 2
      }
    )
  } else if (request.mess === "capture") {
    async function capture() {
      var [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      chrome.desktopCapture.chooseDesktopMedia([
        "screen",
        "window",
        "tab"
      ], tab, (streamId) => {
        if (streamId && streamId.length) {
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { name: "stream", streamId: streamId, coords: request.obj })
          }, 200)
        }
      })
    }
    capture()
  } else if (request.mess === "img") {
    chrome.downloads.download({
      filename: "screenshot.png",
      url: request.url
    })
  } else if (request.mess === "fetch") {
    const apiCall = "http://localhost:3001/api/users/Giacomo/avatars"
    fetch(apiCall).then(function (res) {
      res.json().then(function (data) {
        console.log(data)
        sendResponse({ data: data })
      })
    })
  }

  return true
});

chrome.tabs.onHighlighted.addListener(function (tabIds, windowId) {

  chrome.storage.sync.get(["pastPages", "startingURL"], async function (result) {
    var startingURL = result.startingURL;
    var [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.active === true && tab.url.indexOf(startingURL) >= 0 && startingURL !== "") {
      chrome.storage.sync.get(["visitedPages", "newPages", "pageActions", "profileInfo"], function (result) {
        var visitedPages = result.visitedPages;
        var newPages = result.newPages;
        var profileInfo = JSON.parse(result.profileInfo)
        function filterUser(event) {
          return event.username === profileInfo.username
        }
        chrome.storage.sync.set({ currentURL: tab.url }, function () {
          if (!visitedPages.includes(tab.url)) {
            visitedPages.push(tab.url);
            chrome.storage.sync.set({ visitedPages: visitedPages });
          }
          function filterURL(event) {
            return event.url === tab.url;
          }
          var pageActions = JSON.parse(result.pageActions);
          var pageActionsFiltered = pageActions.filter(filterUser)[0];
          var pagesFiltered = pageActionsFiltered ? pageActionsFiltered.pages.filter(filterURL) : []

          if (!newPages.includes(tab.url) && pagesFiltered.length === 0) {
            newPages.push(tab.url);
            chrome.storage.sync.set({ newPages: newPages });
          }
          callScripts(tab)
        });
      });
    }
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.storage.sync.get(["pastPages", "startingURL", "profileInfo"], async function (result) {
    var startingURL = result.startingURL;
    var profileInfo = JSON.parse(result.profileInfo)
    function filterUser(event) {
      return event.username === profileInfo.username
    }
    if (changeInfo.status === "complete") {
      var reachedURL = tab.url;
      if (reachedURL.indexOf(startingURL) >= 0 && startingURL !== "") {
        chrome.storage.sync.get(["visitedPages", "newPages", "pageActions"], function (result) {
          chrome.storage.sync.set({ currentURL: tab.url, tabId: tab.id }, function () {
            var visitedPages = result.visitedPages;
            var newPages = result.newPages;
            if (!visitedPages.includes(tab.url)) {
              visitedPages.push(tab.url);
              chrome.storage.sync.set({ visitedPages: visitedPages });
            }
            //check se tab.url è presente anche in pageActions prima di inserire
            function filterURL(event) {
              return event.url === tab.url;
            }
            var pageActions = JSON.parse(result.pageActions);
            var pageActionsFiltered = pageActions.filter(filterUser)[0];
            var pagesFiltered = pageActionsFiltered ? pageActionsFiltered.pages.filter(filterURL) : []
            if (!newPages.includes(tab.url) && pagesFiltered.length === 0) {
              newPages.push(tab.url);
              chrome.storage.sync.set({ newPages: newPages });
            }
            callScripts(tab)
          });
        });
      }
    }
  });
});

function callScripts(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["scripts/showFirstTimeStar.js",
      "scripts/showSidenav.js",
      "scripts/countInteractableElements.js",
      "scripts/showTopbar.js",
      "scripts/drawOverlays.js",
      "scripts/messageListener.js"]
  });
}

