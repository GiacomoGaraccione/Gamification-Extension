function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function filterHeartAvatar(event) {
    return event.name === "Heart Avatar"
}

function filterStarAvatar(event) {
    return event.name === "Star Avatar"
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
    chrome.storage.sync.get(["pastPages", "visitedPages", "pageActions"], function (result) {
        var pageActions = JSON.parse(result.pageActions);
        for (var i = 0; i < pageActions.length; i++) {
            var pages = pageActions[i].pages
            for (var j = 0; j < pages.length; j++) {
                var filteredLinkIds = pages[i].idsOfLinkObjects.filter(onlyUnique);
                pages[i].idsOfLinkObjects = filteredLinkIds;
                var filteredInputIds = pages[i].idsOfInputObjects.filter(onlyUnique);
                pages[i].idsOfInputObjects = filteredInputIds;
                var filteredButtonIds = pages[i].idsOfButtonObjects.filter(onlyUnique);
                pages[i].idsOfButtonObjects = filteredButtonIds;
            }
        }
        var blob = new Blob([JSON.stringify(pageActions)], {
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

function downloadUserProfile() {
    chrome.storage.sync.get(["profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        var blob = new Blob([result.profileInfo], {
            type: "text/plain;charset=UTF-8",
        })

        var url = window.URL.createObjectURL(blob);
        var obj = {
            url: url,
            filename: "gamification-extension-profile-" + profileInfo.username + ".txt",
        };
        chrome.runtime.sendMessage({ obj: obj, mess: "download" });
    })
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

    chrome.storage.sync.get(["pageActions", "currentURL", "profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        function filterUser(event) {
            return event.username === profileInfo.username
        }

        function filterURL(event) {
            return event.url === result.currentURL
        }
        var retrievedObj = JSON.parse(result.pageActions);
        var pageActions = retrievedObj.filter(filterUser)[0]
        var pageActionsUser = pageActions.pages.filter(filterURL)[0]
        var links = document.body.getElementsByTagName("a");
        var inputs = document.body.getElementsByTagName("input");
        var buttons = document.body.getElementsByTagName("button");
        var idsOfLinkObjects = pageActionsUser.idsOfLinkObjects
        for (var j = 0; j < links.length; j++) {
            if (idsOfLinkObjects.indexOf(j - 1) >= 0) {
                links[j - 1].style = "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
            }
        }
        var idsOfInputObjects = pageActionsUser.idsOfInputObjects;
        for (var j = 0; j < inputs.length; j++) {
            if (idsOfInputObjects.indexOf(j - 1) >= 0) {
                inputs[j - 1].style = "border:3px; border-style:solid; border-color:#00FF00; padding: 1em;";
            }
        }
        var idsOfButtonObjects = pageActionsUser.idsOfButtonObjects;
        for (var j = 0; j < idsOfButtonObjects.length; j++) {
            if (idsOfButtonObjects.indexOf(j) >= 0 && !isButtonOfExtension(buttons[j])) {
                buttons[j].style = "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;";
            }
        }
    });
}

function widgetsCoverageAchievements(progress) {
    chrome.storage.sync.get(["profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        console.log("wCA", profileInfo.achievements)
        //profileInfo.achievements = [] //debug
        if (progress >= 25) {
            var text = "Obtained 25% coverage for a type of widgets!"
            if (profileInfo.achievements.indexOf(text) === -1) {
                profileInfo.achievements.push(text)
                var obj = {
                    title: "New Achievement!",
                    message: text,
                    path: "./img/achievement_bronze.png"
                }
                chrome.runtime.sendMessage({ obj: obj, mess: "notification" });
            }
        }
        if (progress >= 50) {
            var text = "Obtained 50% coverage for a type of widgets!"
            if (profileInfo.achievements.indexOf(text) === -1) {
                profileInfo.achievements.push(text)
                var obj = {
                    title: "New Achievement!",
                    message: text,
                    path: "./img/achievement_silver.png"
                }
                chrome.runtime.sendMessage({ obj: obj, mess: "notification" });
            }
        }
        if (progress === 100) {
            var text = "Obtained 100% coverage for a type of widgets!"
            if (profileInfo.achievements.indexOf(text) === -1) {
                profileInfo.achievements.push(text)
                var obj = {
                    title: "New Achievement!",
                    message: text,
                    path: "./img/achievement_gold.png"
                }
                chrome.runtime.sendMessage({ obj: obj, mess: "notification" });
                if (profileInfo.achievements.length === 3) {
                    if (profileInfo.availableAvatars.filter(filterHeartAvatar).length === 0) {
                        var unlocked = {
                            name: "Heart Avatar",
                            url: "../img/heart_avatar.png"
                        }
                        var notification = {
                            title: "New Avatar Unlocked",
                            message: "Unlocked: Heart Avatar!",
                            path: "./img/heart_avatar.png"
                        }
                        profileInfo.availableAvatars.push(unlocked)
                        chrome.runtime.sendMessage({ obj: notification, mess: "notification" })
                    }
                }
                if (profileInfo.availableAvatars.filter(filterStarAvatar).length === 0) {
                    var unlocked = {
                        name: "Star Avatar",
                        url: "../img/star_avatar.png"
                    }
                    var notification = {
                        title: "New Avatar Unlocked",
                        message: "Unlocked: Star Avatar",
                        path: "./img/star_avatar.png"
                    }
                    profileInfo.availableAvatars.push(unlocked)
                    chrome.runtime.sendMessage({ obj: notification, mess: "notification" })
                }
            }
        }
        chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) })
    })
}

function pageCoverageAchievements(progress, widgetProgress) {
    chrome.storage.sync.get(["profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        console.log("pCA", profileInfo.achievements)
        if (progress >= 4) {
            var text = "Obtained 25% page coverage!"
            if (profileInfo.achievements.indexOf(text) === -1) {
                profileInfo.achievements.push(text)
                var obj = {
                    title: "New Achievement!",
                    message: text,
                    path: "./img/achievement_bronze.png"
                }
                chrome.runtime.sendMessage({ obj: obj, mess: "notification" });
            }
        }
        if (progress >= 50) {
            var text = "Obtained 50% page coverage!"
            if (profileInfo.achievements.indexOf(text) === -1) {
                profileInfo.achievements.push(text)
                var obj = {
                    title: "New Achievement!",
                    message: text,
                    path: "./img/achievement_silver.png"
                }
                chrome.runtime.sendMessage({ obj: obj, mess: "notification" });
            }
        }
        if (progress === 100) {
            var text = "Obtained 100% page coverage!"
            if (profileInfo.achievements.indexOf(text) === -1) {
                profileInfo.achievements.push(text)
                var obj = {
                    title: "New Achievement!",
                    message: text,
                    path: "./img/achievement_gold.png"
                }
                chrome.runtime.sendMessage({ obj: obj, mess: "notification" });
            }
        }
        chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) }, function () {
            widgetsCoverageAchievements(widgetProgress)
        })
    })
}