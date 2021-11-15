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

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

chrome.storage.sync.get(["currentURL", "pageActions", "pageStats"], function (result) {
    var currentURL = result.currentURL;

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
    var retrievedObj = JSON.parse(result.pageActions);
    var newPage = true;
    for (var i = 0; i < retrievedObj.length && newPage; i++) {
        //magari in futuro aggiungere controlli sulla differenza del numero di oggetti interagibili
        if (retrievedObj[i].url === currentURL) {
            newPage = false;
        }
    }
    if (newPage) {
        retrievedObj.push(obj);
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
    newPage = true;
    for (var i = 0; i < pageStatsObj.length && newPage; i++) {
        if (pageStatsObj[i].url === currentURL) {
            newPage = false;
        }
    }
    if (newPage) {
        pageStatsObj.push(psObj);
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
                        for (var k = 0; k < retrievedObj.length; k++) {
                            if (retrievedObj[k].url === currentURL) {
                                var ids = retrievedObj[k].idsOfLinkObjects;
                                var pos = ids.indexOf(j - 1);
                                if (pos < 0) {
                                    ids.push(j - 1);
                                    retrievedObj.idsOfLinkObjects = ids;
                                    newLink = true;
                                }
                            }
                        }
                        var pageActions = JSON.stringify(retrievedObj);

                        var pageStatsObj = JSON.parse(result.pageStats);
                        for (var m = 0; m < pageStatsObj.length; m++) {
                            if (pageStatsObj[m].url === currentURL) {
                                var ids = pageStatsObj[m].interactedLinks;
                                var pos = ids.indexOf(j - 1);
                                if (pos < 0) {
                                    ids.push(j - 1);
                                    pageStatsObj[m].interactedLinks = ids;
                                }
                                if (newLink) {
                                    var ids = pageStatsObj[m].newLinks;
                                    var pos = ids.indexOf(j - 1);
                                    if (pos < 0) {
                                        ids.push(j - 1);
                                        pageStatsObj[m].newLinks = ids;
                                    }
                                }
                            }
                        }
                        chrome.storage.sync.set({
                            pageActions: pageActions,
                            pageStats: JSON.stringify(pageStatsObj),
                        });
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
                        for (var k = 0; k < retrievedObj.length; k++) {
                            if (retrievedObj[k].url === currentURL) {
                                var ids = retrievedObj[k].idsOfInputObjects;
                                var pos = ids.indexOf(j - 1);
                                if (pos < 0) {
                                    ids.push(j - 1);
                                    retrievedObj.idsOfInputObjects = ids;
                                    newInput = true;
                                }
                                var pageActions = JSON.stringify(retrievedObj);
                                var pageStatsObj = JSON.parse(result.pageStats);
                                for (var m = 0; m < pageStatsObj.length; m++) {
                                    if (pageStatsObj[m].url === currentURL) {
                                        var ids = pageStatsObj[m].interactedInputs;
                                        var pos = ids.indexOf(j - 1);
                                        if (pos < 0) {
                                            ids.push(j - 1);
                                            pageStatsObj[m].interactedInputs = ids;
                                        }
                                        if (newInput === true) {
                                            var ids = pageStatsObj[m].newInputs;
                                            var pos = ids.indexOf(j - 1);
                                            if (pos < 0) {
                                                ids.push(j - 1);
                                                pageStatsObj[m].newInputs = ids;
                                            }
                                        }
                                    }
                                }
                                chrome.storage.sync.set({
                                    pageActions: pageActions,
                                    pageStats: JSON.stringify(pageStatsObj),
                                });
                                var innerDiv = document.getElementById(
                                    "gamificationExtensionTopnavInner"
                                );
                                var totalLinkObjects = retrievedObj[k].totalLinkObjects;
                                var totalInputObjects = retrievedObj[k].totalInputObjects;
                                var totalButtonObjects = retrievedObj[k].totalButtonObjects;
                                var interactedLinks = retrievedObj[k].idsOfLinkObjects.filter(onlyUnique).length;
                                var interactedInputs = retrievedObj[k].idsOfInputObjects.filter(onlyUnique).length;
                                var interactedButtons = retrievedObj[k].idsOfButtonObjects.filter(onlyUnique).length;
                                var progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (totalLinkObjects + totalInputObjects + totalButtonObjects);
                                innerDiv.style =
                                    `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
                                    progress +
                                    `%; white-space:nowrap`;
                                innerDiv.textContent = "Progress: " + progress + "%";
                            }
                        }
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
                            for (var k = 0; k < retrievedObj.length; k++) {
                                if (retrievedObj[k].url === currentURL) {
                                    var ids = retrievedObj[k].idsOfButtonObjects;
                                    var pos = ids.indexOf(j - 1);
                                    if (pos < 0) {
                                        ids.push(j - 1);
                                        retrievedObj.idsOfButtonObjects = ids;
                                        newButton = true;
                                    }
                                    var pageStatsObj = JSON.parse(result.pageStats);
                                    for (var m = 0; m < pageStatsObj.length; m++) {
                                        if (pageStatsObj[m].url === currentURL) {
                                            var ids = pageStatsObj[m].interactedButtons;
                                            var pos = ids.indexOf(j - 1);
                                            if (pos < 0) {
                                                ids.push(j - 1);
                                                pageStatsObj[m].interactedButtons = ids;
                                            }
                                            if (newButton) {
                                                var ids = pageStatsObj[m].newButtons;
                                                var pos = ids.indexOf(j - 1);
                                                if (pos < 0) {
                                                    ids.push(j - 1);
                                                    pageStatsObj[m].newButtons = ids;
                                                }
                                            }
                                        }
                                    }
                                    var innerDiv = document.getElementById(
                                        "gamificationExtensionTopnavInner"
                                    );
                                    var totalLinkObjects = retrievedObj[k].totalLinkObjects;
                                    var totalInputObjects = retrievedObj[k].totalInputObjects;
                                    var totalButtonObjects = retrievedObj[k].totalButtonObjects;
                                    var interactedLinks = retrievedObj[k].idsOfLinkObjects.filter(onlyUnique).length;
                                    var interactedInputs = retrievedObj[k].idsOfInputObjects.filter(onlyUnique).length;
                                    var interactedButtons = retrievedObj[k].idsOfButtonObjects.filter(onlyUnique).length;
                                    var progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (totalLinkObjects + totalInputObjects + totalButtonObjects);
                                    innerDiv.style =
                                        `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
                                        progress +
                                        `%; white-space:nowrap`;
                                    innerDiv.textContent = "Progress: " + progress + "%";
                                }
                            }
                            var pageActions = JSON.stringify(retrievedObj);

                            chrome.storage.sync.set({
                                pageActions: pageActions,
                                pageStats: JSON.stringify(pageStatsObj),
                            });
                        }
                        );
                    }
                }
            });
        }
    }
}
);