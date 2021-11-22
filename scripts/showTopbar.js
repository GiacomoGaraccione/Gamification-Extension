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
    var pageActs = userActions.pages.filter(filterURL)[0]

    var totalLinkObjects = pageActs.totalLinkObjects;
    var totalInputObjects = pageActs.totalInputObjects;
    var totalButtonObjects = pageActs.totalButtonObjects;
    var interactedLinks = pageActs.idsOfLinkObjects.filter(onlyUnique).length;
    var interactedInputs = pageActs.idsOfInputObjects.filter(onlyUnique).length;
    var interactedButtons = pageActs.idsOfButtonObjects.filter(onlyUnique).length;
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
    }
});