chrome.storage.sync.get(["pageActions", "currentURL"], function (result) {
    var pageActions = JSON.parse(result.pageActions);
    var currentURL = result.currentURL;
    for (var i = 0; i < pageActions.length; i++) {
        if (pageActions[i].url === currentURL) {
            var totalLinkObjects = pageActions[i].totalLinkObjects;
            var totalInputObjects = pageActions[i].totalInputObjects;
            var totalButtonObjects = pageActions[i].totalButtonObjects;
            var interactedLinks = pageActions[i].idsOfLinkObjects.filter(onlyUnique).length;
            var interactedInputs = pageActions[i].idsOfInputObjects.filter(onlyUnique).length;
            var interactedButtons = pageActions[i].idsOfButtonObjects.filter(onlyUnique).length;
            var progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (totalLinkObjects + totalInputObjects + totalButtonObjects);
        }
    }
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