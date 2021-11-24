chrome.storage.sync.get(["pageActions", "currentURL", "profileInfo"], function (result) {
    var profileInfo = JSON.parse(result.profileInfo)
    function filterUser(event) {
        return event.username === profileInfo.username
    }

    function filterURL(event) {
        return event.url === result.currentURL
    }
    var pageActions = JSON.parse(result.pageActions);
    var userActions = pageActions.filter(filterUser)[0]
    var firstTime = userActions === undefined
    var pageActs = firstTime ? {} : userActions.pages.filter(filterURL)[0]
    var newPage = true
    if (!firstTime) {
        var pages = userActions.pages.filter(filterURL)[0]
        if (pages) {
            newPage = false
        }
    }

    var buttons = document.getElementsByTagName("button")
    var buttonsCount = 0
    for (var i = 0; i < buttons.length; i++) {
        if (!isButtonOfExtension(buttons[i])) {
            buttonsCount++
        }
    }

    var totalLinkObjects = newPage ? document.getElementsByTagName("a").length : pageActs.totalLinkObjects;
    var totalInputObjects = newPage ? document.getElementsByTagName("input").length : pageActs.totalInputObjects;
    var totalButtonObjects = newPage ? buttonsCount : pageActs.totalButtonObjects;
    var interactedLinks = newPage ? 0 : pageActs.idsOfLinkObjects.filter(onlyUnique).length;
    var interactedInputs = newPage ? 0 : pageActs.idsOfInputObjects.filter(onlyUnique).length;
    var interactedButtons = newPage ? 0 : pageActs.idsOfButtonObjects.filter(onlyUnique).length;
    var progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (totalLinkObjects + totalInputObjects + totalButtonObjects);


    var topnav = document.createElement("div");
    topnav.id = "gamificationExtensionTopnav";
    var found = document.getElementById("gamificationExtensionTopnav");
    if (found === null) {
        document.body.appendChild(topnav);
        topnav.style = "background-color: transparent;position: fixed;bottom: 0;width: 100%;";
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
        chrome.storage.sync.get(["currentURL", "pageActions", "profileInfo"], function (result) {
            var profileInfo = JSON.parse(result.profileInfo)
            function filterUser(event) {
                return event.username === profileInfo.username
            }
            function filterURL(event) {
                return event.url === result.currentURL
            }
            var pageActions = JSON.parse(result.pageActions);
            var pageActionsUser = pageActions.filter(filterUser)[0]

            var page = pageActionsUser.pages.filter(filterURL)[0]
            page.coverage = progress
            chrome.storage.sync.set({ pageActions: JSON.stringify(pageActions) })
        })
    }
});