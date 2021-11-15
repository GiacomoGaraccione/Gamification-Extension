chrome.storage.sync.get(["overlayMode", "pageActions", "currentURL"], function (result) {
    var overlayMode = result.overlayMode
    if (overlayMode === "interacted") {
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
    } else if (overlayMode === "all") {
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
})