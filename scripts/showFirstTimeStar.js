chrome.storage.sync.get(["pageActions", "currentURL", "profileInfo"], function (result) {
    var profileInfo = JSON.parse(result.profileInfo)
    function filterURL(event) {
        return event.url === result.currentURL
    }

    function filterUser(event) {
        return event.username === profileInfo.username
    }
    var pageActions = JSON.parse(result.pageActions);
    var pageActionsUser = pageActions.filter(filterUser)[0]

    var pagesUser = pageActionsUser.pages.filter(filterURL)

    if (pagesUser.length === 0) {
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