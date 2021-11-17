function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
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
                var filteredLinkIds = pageActionsObj[i].idsOfLinkObjects.filter(onlyUnique);
                pageActionsObj[i].idsOfLinkObjects = filteredLinkIds;
                var filteredInputIds = pageActionsObj[i].idsOfInputObjects.filter(onlyUnique);
                pageActionsObj[i].idsOfInputObjects = filteredInputIds;
                var filteredButtonIds = pageActionsObj[i].idsOfButtonObjects.filter(onlyUnique);
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

function drawBorderOnAll() {
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
}

function drawBorderOnInteracted() {
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
                        idsOfButtonObjects.indexOf(j) >= 0 &&
                        !isButtonOfExtension(buttons[j])
                    ) {
                        buttons[j].style =
                            "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;";
                    }
                }
            }
        }
    });
}