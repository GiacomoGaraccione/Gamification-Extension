chrome.storage.sync.get(["currentURL", "pageActions", "pageStats", "overlayMode", "profileInfo", "registeredUsers"], function (result) {
    var currentURL = result.currentURL;
    var overlayMode = result.overlayMode
    var profileInfo = JSON.parse(result.profileInfo)

    function filterURL(event) {
        return event.url === currentURL
    }

    function filterUser(event) {
        return event.username === profileInfo.username
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    //ottiene tutti gli elementi di tipo 'a' (link ad altre pagine)
    var linkObjects = document.body.getElementsByTagName("a");
    var totalLinkObjects = linkObjects.length;

    //ottiene tutti i campi di input della pagina
    var inputObjects = document.body.getElementsByTagName("input");
    var totalInputObjects = inputObjects.length;

    //ottiene tutti i buttons presenti nella pagina
    var buttonObjects = document.body.getElementsByTagName("button");
    var totalButtonObjects = 0;
    for (var i = 0; i < buttonObjects.length; i++) {
        if (!isButtonOfExtension(buttonObjects[i])) {
            totalButtonObjects++;
        }
    }

    var obj = {
        url: currentURL,
        idsOfLinkObjects: [],
        totalLinkObjects: totalLinkObjects,
        idsOfInputObjects: [],
        totalInputObjects: totalInputObjects,
        idsOfButtonObjects: [],
        totalButtonObjects: totalButtonObjects,
    };
    var wrap = { username: "", pages: [] }
    var pages = []
    var retrievedObj = JSON.parse(result.pageActions);
    if (retrievedObj.filter(filterUser).length === 0) {
        wrap.username = profileInfo.username
        wrap.pages.push(obj)
        retrievedObj.push(wrap)
    } else {
        pages = retrievedObj.filter(filterUser)[0].pages
        if (pages.filter(filterURL).length === 0) {
            pages.push(obj)
            retrievedObj.filter(filterUser)[0].pages = pages
        }
    }
    var pageActions = JSON.stringify(retrievedObj);
    chrome.storage.sync.set({ pageActions: pageActions });

    var psObj = {
        url: currentURL,
        interactedLinks: [],
        interactedInputs: [],
        interactedButtons: [],
        newLinks: [],
        newInputs: [],
        newButtons: [],
    };
    var pageStatsObj = JSON.parse(result.pageStats);
    if (pageStatsObj.filter(filterURL).length === 0) {
        pageStatsObj.push(psObj)
    }

    chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj) });

    for (var i = 0; i < linkObjects.length; i++) {
        //funzione chiamata ogni volta che un link viene cliccato
        linkObjects[i].addEventListener("click", function (event) {
            var found = false;
            var els = document.body.getElementsByTagName("a");
            for (var j = 0; j < els.length && !found; j++) {
                if (els[j].href === event.target.href) {
                    found = true;
                    chrome.storage.sync.get(["pageActions", "pageStats"], function (result) {
                        var retrievedObj = JSON.parse(result.pageActions);
                        var newLink = false;
                        var userObj = retrievedObj.filter(filterUser)[0]
                        var userObjPageActions = userObj.pages.filter(filterURL)[0]
                        var ids = userObjPageActions.idsOfLinkObjects
                        var pos = ids.indexOf(j - 1);
                        if (pos < 0) {
                            ids.push(j - 1);
                            userObjPageActions.idsOfLinkObjects = ids;
                            newLink = true;
                        }
                        var pageActions = JSON.stringify(retrievedObj);

                        var pageStatsObj = JSON.parse(result.pageStats);
                        var psObj = pageStatsObj.filter(filterURL)[0]
                        var ids = psObj.interactedLinks
                        var pos = ids.indexOf(j - 1);
                        if (pos < 0) {
                            ids.push(j - 1);
                            psObj.interactedLinks = ids;
                        }
                        if (newLink) {
                            var ids = psObj.newLinks;
                            var pos = ids.indexOf(j - 1);
                            if (pos < 0) {
                                ids.push(j - 1);
                                psObj.newLinks = ids;
                            }
                        }
                        chrome.storage.sync.set({ pageActions: pageActions, pageStats: JSON.stringify(pageStatsObj) });
                    }
                    );
                }
            }
        });
    }

    for (var i = 0; i < inputObjects.length; i++) {
        inputObjects[i].addEventListener("click", function (event) {
            event.preventDefault();
            var els = document.body.getElementsByTagName("input");
            var found = false;
            for (var j = 0; j < els.length && !found; j++) {
                if (els[j].id === event.target.id) {
                    found = true;
                    chrome.storage.sync.get(["pageActions", "pageStats"], function (result) {
                        var retrievedObj = JSON.parse(result.pageActions);
                        var newInput = false;
                        var userObj = retrievedObj.filter(filterUser)[0]
                        var userObjPageActions = userObj.pages.filter(filterURL)[0]
                        var ids = userObjPageActions.idsOfInputObjects;
                        var pos = ids.indexOf(j - 1);
                        if (pos < 0) {
                            ids.push(j - 1);
                            userObjPageActions.idsOfInputObjects = ids;
                            newInput = true;
                        }
                        var pageActions = JSON.stringify(retrievedObj);
                        var pageStatsObj = JSON.parse(result.pageStats);
                        var psObj = pageStatsObj.filter(filterURL)[0]
                        var ids = psObj.interactedInputs;
                        var pos = ids.indexOf(j - 1);
                        if (pos < 0) {
                            ids.push(j - 1);
                            psObj.interactedInputs = ids;
                        }
                        if (newInput === true) {
                            var ids = psObj.newInputs;
                            var pos = ids.indexOf(j - 1);
                            if (pos < 0) {
                                ids.push(j - 1);
                                psObj.newInputs = ids;
                            }
                        }
                        chrome.storage.sync.set({ pageActions: pageActions, pageStats: JSON.stringify(pageStatsObj) });
                        var innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                        var totalLinkObjects = userObjPageActions.totalLinkObjects;
                        var totalInputObjects = userObjPageActions.totalInputObjects;
                        var totalButtonObjects = userObjPageActions.totalButtonObjects;
                        var interactedLinks = userObjPageActions.idsOfLinkObjects.filter(onlyUnique).length;
                        var interactedInputs = userObjPageActions.idsOfInputObjects.filter(onlyUnique).length;
                        var interactedButtons = userObjPageActions.idsOfButtonObjects.filter(onlyUnique).length;
                        var progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (totalLinkObjects + totalInputObjects + totalButtonObjects);
                        innerDiv.style =
                            `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
                            progress +
                            `%; white-space:nowrap`;
                        innerDiv.textContent = "Progress: " + progress + "%";
                        if (overlayMode === "interacted") {
                            drawBorderOnInteracted()
                        }
                        var sidenavProgress = document.getElementById("gamificationExtensionInputsProgress")
                        progress = interactedInputs * 100 / totalInputObjects
                        sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
                            progress +
                            `%; white-space:nowrap`;
                        sidenavProgress.textContent = "Buttons Progress: " + progress + "%"
                        var table = document.getElementById("gamificationExtensionPageStatsTable")
                        var inputsRow = table.rows[2]
                        var pageStat = pageStatsObj.filter(filterURL)[0]
                        inputsRow.cells[1].innerHTML = pageStat.interactedInputs.length
                        inputsRow.cells[2].innerHTML = pageStat.interactedInputs.length
                        inputsRow.cells[3].innerHTML = userObjPageActions.idsOfInputObjects.length
                    }
                    );
                }
            }
        });
    }

    for (var i = 0; i < buttonObjects.length; i++) {
        if (!isButtonOfExtension(buttonObjects[i])) {
            buttonObjects[i].addEventListener("click", function (event) {
                var els = document.body.getElementsByTagName("button");
                var found = false;
                for (var j = 0; j < els.length && !found; j++) {
                    if (els[j].id === event.target.id) {
                        found = true;
                        chrome.storage.sync.get(["pageActions", "pageStats"], function (result) {
                            var retrievedObj = JSON.parse(result.pageActions);
                            var newButton = false;
                            var userObj = retrievedObj.filter(filterUser)[0]
                            var userObjPageActions = userObj.pages.filter(filterURL)[0]
                            var ids = userObjPageActions.idsOfButtonObjects;
                            var pos = ids.indexOf(j - 1);
                            if (pos < 0) {
                                ids.push(j - 1);
                                userObjPageActions.idsOfButtonObjects = ids;
                                newButton = true;
                            }
                            var pageActions = JSON.stringify(retrievedObj);

                            var pageStatsObj = JSON.parse(result.pageStats);
                            var psObj = pageStatsObj.filter(filterURL)[0]
                            var ids = psObj.interactedButtons;
                            var pos = ids.indexOf(j - 1);
                            if (pos < 0) {
                                ids.push(j - 1);
                                psObj.interactedButtons = ids;
                            }
                            if (newButton) {
                                var ids = psObj.newButtons;
                                var pos = ids.indexOf(j - 1);
                                if (pos < 0) {
                                    ids.push(j - 1);
                                    psObj.newButtons = ids;
                                }
                            }
                            var innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                            var totalLinkObjects = userObjPageActions.totalLinkObjects;
                            var totalInputObjects = userObjPageActions.totalInputObjects;
                            var totalButtonObjects = userObjPageActions.totalButtonObjects;
                            var interactedLinks = userObjPageActions.idsOfLinkObjects.filter(onlyUnique).length;
                            var interactedInputs = userObjPageActions.idsOfInputObjects.filter(onlyUnique).length;
                            var interactedButtons = userObjPageActions.idsOfButtonObjects.filter(onlyUnique).length;
                            var progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (totalLinkObjects + totalInputObjects + totalButtonObjects);
                            innerDiv.style =
                                `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
                                progress +
                                `%; white-space:nowrap`;
                            innerDiv.textContent = "Progress: " + progress + "%";
                            if (overlayMode === "interacted") {
                                drawBorderOnInteracted()
                            }
                            var sidenavProgress = document.getElementById("gamificationExtensionButtonsProgress")
                            progress = interactedButtons * 100 / totalButtonObjects
                            sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
                                progress +
                                `%; white-space:nowrap`;
                            sidenavProgress.textContent = "Buttons Progress: " + progress + "%"
                            var table = document.getElementById("gamificationExtensionPageStatsTable")
                            var buttonsRow = table.rows[3]
                            var pageStat = pageStatsObj.filter(filterURL)[0]
                            buttonsRow.cells[1].innerHTML = pageStat.interactedButtons.length
                            buttonsRow.cells[2].innerHTML = pageStat.newButtons.length
                            buttonsRow.cells[3].innerHTML = userObjPageActions.idsOfButtonObjects.length
                            chrome.storage.sync.set({ pageActions: pageActions, pageStats: JSON.stringify(pageStatsObj) });
                        }
                        );
                    }
                }
            });
        }
    }
}
);