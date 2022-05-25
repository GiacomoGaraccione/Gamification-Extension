let apiUrl = "http://localhost:3001/api"

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.mess === "create") {
    chrome.tabs.create({ url: chrome.runtime.getURL("main/mainTab.html") });
    sendResponse({ mess: "Main tab opened correctly" });
  } else if (request.mess === "close") {
    chrome.tabs.remove(sender.tab.id)
    chrome.tabs.update(request.mess.id, { highlighted: true });
  } else if (request.mess === "end") {
    chrome.tabs.update(sender.tab.id, { url: chrome.runtime.getURL("main/mainTab.html") })
  } else if (request.mess === "openNew") {
    chrome.tabs.remove(sender.tab.id)
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
  } else if (request.mess === "fetch") {
    const apiCall = apiUrl + request.body
    //called when a page is visited
    //updates the count of widgets present in the page
    if (request.body === "/pages" && request.method === "post") {
      fetch(apiCall, {
        method: 'post',
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          url: request.content.url,
          totalLinkObjects: request.content.totalLinkObjects,
          totalInputObjects: request.content.totalInputObjects,
          totalButtonObjects: request.content.totalButtonObjects,
          totalSelectObjects: request.content.totalSelectObjects
        })
      }).then(function () {
        sendResponse({ data: request.content })
      })
    } else if (request.body === "/pages" && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          function filterURL(event) {
            return event.url === request.content.url
          }
          sendResponse({ data: data.filter(filterURL) })
        })
      })
    } else if (request.body.indexOf("/pages/actions") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          function filterURL(event) {
            return event.url === request.content.url
          }
          sendResponse({ data: data.filter(filterURL) })
        })
      })
    } else if (request.body.indexOf("/pages/actions") >= 0 && request.method === "post") {
      fetch(apiCall, {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          url: request.content.url,
          username: request.content.username,
          objectId: request.content.objectId,
          objectType: request.content.objectType
        })
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/pages/issues") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          function filterURL(event) {
            return event.url === request.content.url
          }
          sendResponse({ data: data.filter(filterURL) })
        })
      })
    } else if (request.body.indexOf("/pages/issues") >= 0 && request.method === "post") {
      fetch(apiCall, {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          url: request.content.url,
          username: request.content.username,
          objectId: request.content.objectId,
          objectType: request.content.objectType,
          issueText: request.content.issueText
        })
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/pages/issues") >= 0 && request.method === "delete") {
      fetch(apiCall, {
        method: "delete",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(request.content)
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/pages/records") >= 0 && request.method === "post" && request.firstTime) {
      let body = {
        url: request.content.url,
        username: request.content.username,
        highestWidgets: 0,
        coverage: 0,
        linksCoverage: 0,
        inputsCoverage: 0,
        buttonsCoverage: 0,
        selectsCoverage: 0,
        highestLinks: 0,
        highestInputs: 0,
        highestButtons: 0,
        highestSelects: 0
      }
      fetch(apiCall, {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(body)
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body.indexOf("/pages/records") >= 0 && request.method === "post" && !request.firstTime) {
      let pos = apiCall.indexOf(request.content.username)
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          function filterURL(event) {
            return event.url === request.content.url
          }
          let record = data.filter(filterURL)[0]
          let body = {
            username: request.content.username,
            url: request.content.url,
            coverage: request.content.coverage,
            highestWidgets: request.content.highestWidgets ? request.content.highestWidgets : record.highestWidgets,
            linksCoverage: request.content.linksCoverage ? request.content.linksCoverage : record.linksCoverage,
            inputsCoverage: request.content.inputsCoverage ? request.content.inputsCoverage : record.inputsCoverage,
            buttonsCoverage: request.content.buttonsCoverage ? request.content.buttonsCoverage : record.buttonsCoverage,
            selectsCoverage: request.content.selectsCoverage ? request.content.selectsCoverage : record.selectsCoverage,
            highestLinks: request.content.highestLinks ? request.content.highestLinks : record.highestLinks,
            highestInputs: request.content.highestInputs ? request.content.highestInputs : record.highestInputs,
            highestButtons: request.content.highestButtons ? request.content.highestButtons : record.highestButtons,
            highestSelects: request.content.highestSelects ? request.content.highestSelects : record.highestSelects
          }
          fetch(apiCall.slice(0, pos - 1), {
            method: "post",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(body)
          }).then((res) => {
            res.json().then((data) => {
              sendResponse({ data: data })
            })
          })
        })
      })
    } else if (request.body.indexOf("/pages/records") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body.indexOf("/users") >= 0 && request.body.indexOf("/records") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body.indexOf("/users") >= 0 && request.body.indexOf("/records") >= 0 && request.method === "post") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          let body = {
            username: request.content.username,
            highestNewVisitedPages: request.content.highestNewVisitedPages > data.highestNewVisitedPages ? request.content.highestNewVisitedPages : data.highestNewVisitedPages,
            highestNewWidgets: request.content.highestNewWidgets > data.highestNewWidgets ? request.content.highestNewWidgets : data.highestNewWidgets,
            highestCoverage: request.content.highestCoverage > data.highestCoverage ? request.content.highestCoverage : data.highestCoverage
          }
          fetch(apiCall, {
            method: "PATCH",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(body)
          }).then((res) => {
            res.json().then((data) => {
              sendResponse({ data: data })
            })
          })
        })
      })
    } else if (request.body.indexOf("/users") >= 0 && request.body.indexOf("/achievements") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body.indexOf("/users") >= 0 && request.body.indexOf("/achievements") >= 0 && request.method === "post") {
      fetch(apiCall, {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ text: request.content.text })
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/users") >= 0 && request.body.indexOf("/avatars") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body.indexOf("/users") >= 0 && request.body.indexOf("/avatars") >= 0 && request.method === "post") {
      fetch(apiCall, {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ name: request.content.name })
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/users/records/") >= 0) {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body === "/login") {
      fetch(apiCall, {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ username: request.content.username, password: request.content.password })
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body === "/users" && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body === "/users" && request.method === "post") {
      fetch(apiCall, {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ username: request.content.username, password: request.content.password, selectedAvatar: request.content.selectedAvatar })
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/pages/crops") >= 0 && request.method === "post") {
      fetch(apiCall, {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ imageUrl: request.content.imageUrl, widgetType: request.content.widgetType, widgetId: request.content.widgetId, textContent: request.content.textContent, selectIndex: request.content.selectIndex, selector: request.content.selector, xpath: request.content.xpath, id: request.content.id })
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/pages/crops") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body.indexOf("/pages/crops") >= 0 && request.method === "patch") {
      fetch(apiCall, {
        method: "PATCH",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ widgetId: request.content.widgetId, textContent: request.content.textContent, lastInput: request.content.lastInput, submit: request.content.submit, selectIndex: request.content.selectIndex })
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/users/") >= 0 && request.body.indexOf("/issues") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body.indexOf("/users") >= 0 && request.content.selectedAvatar && request.method === "patch") {
      fetch(apiCall, {
        method: "PATCH",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ selectedAvatar: request.content.selectedAvatar })
      }).then((res) => {
        if (res.ok) {
          sendResponse({ data: "OK" })
        } else {
          sendResponse({ data: "ERROR" })
        }
      })
    } else if (request.body.indexOf("/achievements/hints") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    } else if (request.body.indexOf("/avatars/hints") >= 0 && request.method === "get") {
      fetch(apiCall, {
        method: "get"
      }).then((res) => {
        res.json().then((data) => {
          sendResponse({ data: data })
        })
      })
    }
  }

  return true
});

chrome.tabs.onHighlighted.addListener(function (tabIds, windowId) {

  chrome.storage.sync.get(["pastPages", "startingURL"], async function (result) {
    let startingURL = result.startingURL;
    let [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.active === true && tab.url.indexOf(startingURL) >= 0 && startingURL !== "") {
      chrome.storage.sync.get(["visitedPages", "newPages", "pageActions", "profileInfo"], function (result) {
        let visitedPages = result.visitedPages;
        let newPages = result.newPages;
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.storage.sync.set({ currentURL: tab.url }, function () {
          if (!visitedPages.includes(tab.url)) {
            visitedPages.push(tab.url);
            chrome.storage.sync.set({ visitedPages: visitedPages });
          }
          function filterURL(event) {
            return event.url === tab.url;
          }
          let apiCall = apiUrl + "/pages/records/" + profileInfo.username
          fetch(apiCall, {
            method: "get"
          }).then((res) => {
            res.json().then((data) => {
              let pagesFiltered = data.filter(filterURL)
              if (!newPages.includes(tab.url) && pagesFiltered.length === 0) {
                newPages.push(tab.url);
                chrome.storage.sync.set({ newPages: newPages });
              }
              callScripts(tab)
            })
          })
        });
      });
    }
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.storage.sync.get(["pastPages", "startingURL", "profileInfo"], async function (result) {
    let startingURL = result.startingURL;
    let profileInfo = JSON.parse(result.profileInfo)
    if (changeInfo.status === "complete") {
      let reachedURL = tab.url;
      if (reachedURL.indexOf(startingURL) >= 0 && startingURL !== "") {
        chrome.storage.sync.get(["visitedPages", "newPages", "pageActions"], function (result) {
          chrome.storage.sync.set({ currentURL: tab.url, tabId: tab.id }, function () {
            let visitedPages = result.visitedPages;
            let newPages = result.newPages;
            if (!visitedPages.includes(tab.url)) {
              visitedPages.push(tab.url);
              chrome.storage.sync.set({ visitedPages: visitedPages });
            }
            //check se tab.url è presente anche in pageActions prima di inserire
            function filterURL(event) {
              return event.url === tab.url;
            }
            let apiCall = apiUrl + "/pages/records/" + profileInfo.username
            fetch(apiCall, {
              method: "get"
            }).then((res) => {
              res.json().then((data) => {
                let pagesFiltered = data.filter(filterURL)
                if (!newPages.includes(tab.url) && pagesFiltered.length === 0) {
                  newPages.push(tab.url);
                  chrome.storage.sync.set({ newPages: newPages });
                }
                callScripts(tab)
              })
            })
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
      "scripts/otherElementsListener.js"/*,
  "scripts/stackHandler.js"*/]
  });
}

