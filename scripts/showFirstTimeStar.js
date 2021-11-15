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
                "position: fixed; bottom: 10%;  right: 0;width: 30px;border: 3px solid #FFD700;";
        }
    }
});