chrome.storage.sync.get(["currentURL", "pageActions", "pageStats", "overlayMode", "profileInfo", "registeredUsers", "signaledIssues"], function (result) {
    let currentURL = result.currentURL;
    let overlayMode = result.overlayMode
    let profileInfo = JSON.parse(result.profileInfo)

    function filterURL(event) {
        return event.url === currentURL
    }

    function filterUser(event) {
        return event.username === profileInfo.username
    }

    function filterCoverage(event) {
        return event.coverage >= 50
    }
    function filterLink(event) {
        return event.objectType === "link"
    }
    function filterInput(event) {
        return event.objectType === "input"
    }
    function filterButton(event) {
        return event.objectType === "button"
    }
    function filterSelect(event) {
        return event.objectType === "select"
    }


    /**
     * Count of all widgets (links, forms, buttons) present in the page
     * Forms are filtered so that hidden forms aren't included in the count
     * Buttons are filtered so that buttons added by the extension aren't included in the count
     */
    let linkObjects = document.body.getElementsByTagName("a");
    let totalLinkObjects = linkObjects.length;
    let inputs = document.body.getElementsByTagName("input");
    let inputObjects = []
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].type !== "hidden") {
            inputObjects.push(inputs[i])
        }
    }
    let totalInputObjects = inputObjects.length;
    let buttonObjects = document.body.getElementsByTagName("button");
    let totalButtonObjects = 0;
    for (let i = 0; i < buttonObjects.length; i++) {
        if (!isButtonOfExtension(buttonObjects[i])) {
            totalButtonObjects++;
        }
    }
    let formObjects = document.body.getElementsByTagName("form")
    let selectObjects = document.body.getElementsByTagName("select")
    let totalSelectObjects = selectObjects.length

    //Gestione di pageStats lasciata con chrome.storage, essendo relativa alla singola sessione e non all'insieme totale
    let psObj = { url: currentURL, interactedLinks: [], interactedInputs: [], interactedButtons: [], interactedSelects: [], newLinks: [], newInputs: [], newButtons: [], newSelects: [] };
    let pageStatsObj = JSON.parse(result.pageStats);
    if (pageStatsObj.filter(filterURL).length === 0) {
        pageStatsObj.push(psObj)
    }
    chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj) });
    /**
     * API Calls
     */
    chrome.runtime.sendMessage({
        mess: "fetch",
        body: "/pages",
        method: "post",
        content: { url: currentURL, totalLinkObjects: totalLinkObjects, totalInputObjects: totalInputObjects, totalButtonObjects: totalButtonObjects, totalSelectObjects: totalSelectObjects }
    }, (response) => {
        let pageInfo = response.data
        chrome.runtime.sendMessage({
            mess: "fetch",
            body: "/pages/records",
            method: "post",
            content: { url: currentURL, username: profileInfo.username },
            firstTime: true
        }, (response2) => {
            for (let i = 0; i < linkObjects.length; i++) {
                linkObjects[i].addEventListener("click", (event) => {
                    event.preventDefault()
                    const goTo = event.target.href
                    let found = false;
                    let els = document.body.getElementsByTagName("a");
                    for (let j = 0; j < els.length && !found; j++) {
                        function filterID(event) {
                            return event.objectId === (j - 1) && event.objectType === "link"
                        }
                        if (els[j].href === goTo) {
                            found = true
                            chrome.storage.sync.get(["pageStats", "interactionMode", "pageSession", "previousSession", "sessionPosition"], (result) => {
                                if (result.interactionMode === "interact") {
                                    //Ottenimento coordinate dell'oggetto cliccato, usate per fare il resize dello screenshot
                                    let coords = { x: els[j].getBoundingClientRect().x, y: els[j].getBoundingClientRect().y, height: els[j].getBoundingClientRect().height, width: els[j].getBoundingClientRect().width }
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/actions/" + profileInfo.username,
                                        method: "get",
                                        content: { url: currentURL }
                                    }, (response3) => {
                                        alert("Select Scheda Chrome to have the crop taken correctly")
                                        els[j].attributeStyleMap.clear()
                                        //Funzione che si occupa di fare lo screenshot e poi andare alla pagina indicata dal link
                                        chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "link", widgetId: j, textContent: null, selectIndex: null }, mess: "capture" }, () => {
                                            /*setTimeout(function () {
                                                window.location = goTo;
                                            }, 3000);*/
                                            let pageStatsObj = JSON.parse(result.pageStats);
                                            let psObj = pageStatsObj.filter(filterURL)[0]
                                            let intLinkIds = psObj.interactedLinks
                                            let intLinkPos = intLinkIds.indexOf(j);
                                            if (intLinkPos < 0) {
                                                intLinkIds.push(j);
                                                psObj.interactedLinks = intLinkIds;
                                            }
                                            let pageActions = response3.data
                                            let newLink = pageActions.filter(filterID).length === 0
                                            if (newLink) {
                                                let newlinkIds = psObj.newLinks;
                                                let newLinkPos = newlinkIds.indexOf(j);
                                                if (newLinkPos < 0) {
                                                    newlinkIds.push(j);
                                                    psObj.newLinks = newlinkIds;
                                                }
                                            }
                                            let pageSession = JSON.parse(result.pageSession)
                                            //salvataggio delle informazioni sull'oggetto interagito per il replay della sessione
                                            let pageSessionObj = { url: currentURL, id: j, type: "link" }
                                            pageSession.push(pageSessionObj)
                                            chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj), pageSession: JSON.stringify(pageSession) }, () => {
                                                if (overlayMode === "interacted") {
                                                    drawBorderOnInteracted()
                                                } else if (overlayMode === "all") {
                                                    drawBorderOnAll()
                                                }
                                                if (newLink) {
                                                    chrome.runtime.sendMessage({
                                                        mess: "fetch",
                                                        body: "/pages/actions",
                                                        method: "post",
                                                        content: { url: currentURL, username: profileInfo.username, objectId: j - 1, objectType: "link" }
                                                    }, () => {
                                                        let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                                                        let interactedLinks = pageActions.filter(filterLink).length + 1
                                                        let interactedInputs = pageActions.filter(filterInput).length
                                                        let interactedButtons = pageActions.filter(filterButton).length
                                                        let progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects)
                                                        innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                                                        innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                                                        let sidenavProgress = document.getElementById("gamificationExtensionLinksProgress")
                                                        let widgetProgress = interactedLinks * 100 / pageInfo.totalLinkObjects
                                                        sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                                                        sidenavProgress.textContent = "Links Progress: " + widgetProgress.toFixed(2) + "%"
                                                        let table = document.getElementById("gamificationExtensionPageStatsTable")
                                                        let linksRow = table.rows[1]
                                                        let pageStat = pageStatsObj.filter(filterURL)[0]
                                                        linksRow.cells[1].innerHTML = pageStat.interactedLinks.length
                                                        linksRow.cells[2].innerHTML = pageStat.newLinks.length
                                                        linksRow.cells[3].innerHTML = pageActions.filter(filterLink).length + 1
                                                        pageCoverageAchievements(progress, widgetProgress)
                                                        chrome.runtime.sendMessage({
                                                            mess: "fetch",
                                                            body: "/pages/records/" + profileInfo.username,
                                                            method: "post",
                                                            content: { username: profileInfo.username, url: currentURL, coverage: progress, linksCoverage: widgetProgress },
                                                            firstTime: false
                                                        })
                                                    })

                                                }
                                            });
                                        })
                                        /*setTimeout(function () {
                                            window.location = goTo;
                                        }, 3000);*/
                                        //aggiornamento delle statistiche sulla singola sessione (link interagiti, nuovi link trovati)

                                    })
                                } else if (result.interactionMode === "signal") {
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/issues/" + profileInfo.username,
                                        method: "get",
                                        content: { url: currentURL }
                                    }, (response3) => {
                                        let pageIssues = response3.data
                                        if (pageIssues.filter(filterID).length === 0) {
                                            chrome.runtime.sendMessage({
                                                mess: "fetch",
                                                body: "/pages/issues",
                                                method: "post",
                                                content: { url: currentURL, username: profileInfo.username, objectId: j - 1, objectType: "link" }
                                            }, () => { drawBackground() })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }

            for (let i = 0; i < inputObjects.length; i++) {
                inputObjects[i].addEventListener("click", (event) => {
                    let els = document.body.getElementsByTagName("input");
                    let found = false;
                    for (let j = 0; j < els.length && !found; j++) {
                        function filterID(event) {
                            return event.objectId === (j - 1) && event.objectType === "input"
                        }
                        if (els[j].id === event.target.id) {
                            found = true
                            chrome.storage.sync.get(["pageStats", "interactionMode", "pageSession", "previousSession", "sessionPosition"], (result) => {
                                if (result.interactionMode === "interact") {
                                    let coords = { x: els[j].parentElement.getBoundingClientRect().x, y: els[j].parentElement.getBoundingClientRect().y, height: els[j].parentElement.getBoundingClientRect().height, width: els[j].parentElement.getBoundingClientRect().width }
                                    /*alert("Select Scheda Chrome to have the crop taken correctly")
                                    chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "input", widgetId: j }, mess: "capture" })*/
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/actions/" + profileInfo.username,
                                        method: "get",
                                        content: { url: currentURL }
                                    }, (response3) => {
                                        let pageStatsObj = JSON.parse(result.pageStats);
                                        let psObj = pageStatsObj.filter(filterURL)[0]
                                        let intInputIds = psObj.interactedInputs
                                        let intInputPos = intInputIds.indexOf(j);
                                        if (intInputPos < 0) {
                                            intInputIds.push(j);
                                            psObj.interactedInputs = intInputIds;
                                        }
                                        let pageActions = response3.data
                                        let newInput = pageActions.filter(filterID).length === 0
                                        if (newInput) {
                                            let newInputIds = psObj.newInputs;
                                            let newInputPos = newInputIds.indexOf(j);
                                            if (newInputPos < 0) {
                                                newInputIds.push(j);
                                                psObj.newInputs = newInputIds;
                                            }
                                        }
                                        let pageSession = JSON.parse(result.pageSession)
                                        //salvataggio delle informazioni sull'oggetto interagito per il replay della sessione
                                        let pageSessionObj = { url: currentURL, id: j, type: "input" }
                                        pageSession.push(pageSessionObj)
                                        pageCoverageAchievements(100, 100)
                                        chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj), pageSession: JSON.stringify(pageSession) }, () => {
                                            if (overlayMode === "interacted") {
                                                drawBorderOnInteracted()
                                            } else if (overlayMode === "all") {
                                                drawBorderOnAll()
                                            }
                                            if (newInput) {
                                                chrome.runtime.sendMessage({
                                                    mess: "fetch",
                                                    body: "/pages/actions",
                                                    method: "post",
                                                    content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "input" }
                                                }, () => {
                                                    let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                                                    let interactedLinks = pageActions.filter(filterLink).length
                                                    let interactedInputs = pageActions.filter(filterInput).length + 1
                                                    let interactedButtons = pageActions.filter(filterButton).length
                                                    let progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects)
                                                    innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                                                    innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                                                    let sidenavProgress = document.getElementById("gamificationExtensionInputsProgress")
                                                    let widgetProgress = interactedInputs * 100 / pageInfo.totalInputObjects
                                                    sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                                                    sidenavProgress.textContent = "Forms Progress: " + widgetProgress.toFixed(2) + "%"
                                                    let table = document.getElementById("gamificationExtensionPageStatsTable")
                                                    let inputsRow = table.rows[2]
                                                    let pageStat = pageStatsObj.filter(filterURL)[0]
                                                    inputsRow.cells[1].innerHTML = pageStat.interactedInputs.length
                                                    inputsRow.cells[2].innerHTML = pageStat.newInputs.length
                                                    inputsRow.cells[3].innerHTML = pageActions.filter(filterInput).length + 1
                                                    pageCoverageAchievements(progress, widgetProgress)
                                                    chrome.runtime.sendMessage({
                                                        mess: "fetch",
                                                        body: "/pages/records/" + profileInfo.username,
                                                        method: "post",
                                                        content: { username: profileInfo.username, url: currentURL, coverage: progress, inputsCoverage: widgetProgress },
                                                        firstTime: false
                                                    })
                                                })
                                            }
                                        })
                                    })
                                } else if (result.interactionMode === "signal") {
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/issues/" + profileInfo.username,
                                        method: "get",
                                        content: { url: currentURL }
                                    }, (response3) => {
                                        let pageIssues = response3.data
                                        if (pageIssues.filter(filterID).length === 0) {
                                            chrome.runtime.sendMessage({
                                                mess: "fetch",
                                                body: "/pages/issues",
                                                method: "post",
                                                content: { url: currentURL, username: profileInfo.username, objectId: j - 1, objectType: "input" }
                                            }, () => { drawBackground() })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }

            for (let i = 0; i < buttonObjects.length; i++) {
                if (!isButtonOfExtension(buttonObjects[i])) {
                    buttonObjects[i].addEventListener("click", (event) => {
                        let els = document.body.getElementsByTagName("button");
                        let found = false;
                        for (let j = 0; j < els.length && !found; j++) {
                            function filterID(event) {
                                return event.objectId === (j) && event.objectType === "input"
                            }
                            if (els[j].id === event.target.id) {
                                found = true
                                chrome.storage.sync.get(["pageStats", "interactionMode", "pageSession", "previousSession", "sessionPosition"], (result) => {
                                    if (result.interactionMode === "interact") {
                                        els[j].attributeStyleMap.clear()
                                        let coords = { x: els[j].getBoundingClientRect().x, y: els[j].getBoundingClientRect().y, height: els[j].getBoundingClientRect().height, width: els[j].getBoundingClientRect().width }
                                        alert("Select Scheda Chrome to have the crop taken correctly")
                                        chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "button", widgetId: j, textContent: null, selectIndex: null }, mess: "capture" }, () => {
                                            chrome.runtime.sendMessage({
                                                mess: "fetch",
                                                body: "/pages/actions/" + profileInfo.username,
                                                method: "get",
                                                content: { url: currentURL }
                                            }, (response3) => {
                                                let pageStatsObj = JSON.parse(result.pageStats);
                                                let psObj = pageStatsObj.filter(filterURL)[0]
                                                let intButtonIds = psObj.interactedButtons
                                                let intButtonPos = intButtonIds.indexOf(j);
                                                if (intButtonPos < 0) {
                                                    intButtonIds.push(j);
                                                    psObj.interactedButtons = intButtonIds;
                                                }
                                                let pageActions = response3.data
                                                let newButton = pageActions.filter(filterID).length === 0
                                                if (newButton) {
                                                    let newButtonIds = psObj.newButtons;
                                                    let newButtonPos = newButtonIds.indexOf(j);
                                                    if (newButtonPos < 0) {
                                                        newButtonIds.push(j);
                                                        psObj.newButtons = newButtonIds;
                                                    }
                                                }
                                                let pageSession = JSON.parse(result.pageSession)
                                                //salvataggio delle informazioni sull'oggetto interagito per il replay della sessione
                                                let pageSessionObj = { url: currentURL, id: j, type: "button" }
                                                pageSession.push(pageSessionObj)
                                                chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj), pageSession: JSON.stringify(pageSession) }, () => {
                                                    if (overlayMode === "interacted") {
                                                        drawBorderOnInteracted()
                                                    } else if (overlayMode === "all") {
                                                        drawBorderOnAll()
                                                    }
                                                    if (newButton) {
                                                        chrome.runtime.sendMessage({
                                                            mess: "fetch",
                                                            body: "/pages/actions",
                                                            method: "post",
                                                            content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "button" }
                                                        }, () => {
                                                            let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                                                            let interactedLinks = pageActions.filter(filterLink).length
                                                            let interactedInputs = pageActions.filter(filterInput).length
                                                            let interactedButtons = pageActions.filter(filterButton).length + 1
                                                            let progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects)
                                                            innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                                                            innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                                                            let sidenavProgress = document.getElementById("gamificationExtensionButtonsProgress")
                                                            let widgetProgress = interactedButtons * 100 / pageInfo.totalButtonObjects
                                                            sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                                                            sidenavProgress.textContent = "Buttons Progress: " + widgetProgress.toFixed(2) + "%"
                                                            let table = document.getElementById("gamificationExtensionPageStatsTable")
                                                            let buttonsRow = table.rows[3]
                                                            let pageStat = pageStatsObj.filter(filterURL)[0]
                                                            buttonsRow.cells[1].innerHTML = pageStat.interactedButtons.length
                                                            buttonsRow.cells[2].innerHTML = pageStat.newButtons.length
                                                            buttonsRow.cells[3].innerHTML = pageActions.filter(filterButton).length + 1
                                                            pageCoverageAchievements(progress, widgetProgress)
                                                            chrome.runtime.sendMessage({
                                                                mess: "fetch",
                                                                body: "/pages/records/" + profileInfo.username,
                                                                method: "post",
                                                                content: { username: profileInfo.username, url: currentURL, coverage: progress, buttonsCoverage: widgetProgress },
                                                                firstTime: false
                                                            })
                                                        })
                                                    }
                                                })
                                            })
                                        })
                                    } else if (result.interactionMode === "signal") {
                                        chrome.runtime.sendMessage({
                                            mess: "fetch",
                                            body: "/pages/issues/" + profileInfo.username,
                                            method: "get",
                                            content: { url: currentURL }
                                        }, (response3) => {
                                            let pageIssues = response3.data
                                            if (pageIssues.filter(filterID).length === 0) {
                                                chrome.runtime.sendMessage({
                                                    mess: "fetch",
                                                    body: "/pages/issues",
                                                    method: "post",
                                                    content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "button" }
                                                }, () => { drawBackground() })
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }

            for (let i = 0; i < selectObjects.length; i++) {
                selectObjects[i].addEventListener("change", (event) => {
                    let els = document.body.getElementsByTagName("select")
                    let found = false
                    for (let j = 0; j < els.length && !found; j++) {
                        function filterID(event) {
                            return event.objectId === (j) && event.objectType === "select"
                        }
                        if (event.target.id === els[j].id) {
                            found = true
                            chrome.storage.sync.get(["pageStats", "interactionMode", "pageSession", "previousSession", "sessionPosition"], (result) => {
                                if (result.interactionMode === "interact") {
                                    els[j].attributeStyleMap.clear()
                                    let coords = { x: els[j].getBoundingClientRect().x, y: els[j].getBoundingClientRect().y, height: els[j].getBoundingClientRect().height, width: els[j].getBoundingClientRect().width }
                                    /*alert("Select Scheda Chrome to have the crop taken correctly")
                                    chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "select", widgetId: j, textContent: null, selectIndex: els[j].options[els[j].selectedIndex].text }, mess: "capture" })*/
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/actions/" + profileInfo.username,
                                        method: "get",
                                        content: { url: currentURL }
                                    }, (response3) => {
                                        let pageStatsObj = JSON.parse(result.pageStats);
                                        let psObj = pageStatsObj.filter(filterURL)[0]
                                        let intSelectIds = psObj.interactedSelects
                                        let intSelectPos = intSelectIds.indexOf(j);
                                        if (intSelectPos < 0) {
                                            intSelectIds.push(j);
                                            psObj.interactedSelects = intSelectIds;
                                        }
                                        let pageActions = response3.data
                                        let newSelect = pageActions.filter(filterID).length === 0
                                        if (newSelect) {
                                            let newSelectIds = psObj.newSelects;
                                            let newSelectPos = newSelectIds.indexOf(j);
                                            if (newSelectPos < 0) {
                                                newSelectIds.push(j);
                                                psObj.newSelects = newSelectIds;
                                            }
                                        }
                                        let pageSession = JSON.parse(result.pageSession)
                                        //salvataggio delle informazioni sull'oggetto interagito per il replay della sessione
                                        let pageSessionObj = { url: currentURL, id: j, type: "select" }
                                        pageSession.push(pageSessionObj)
                                        chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj), pageSession: JSON.stringify(pageSession) }, () => {
                                            setTimeout(() => {
                                                if (overlayMode === "interacted") {
                                                    drawBorderOnInteracted()
                                                } else if (overlayMode === "all") {
                                                    drawBorderOnAll()
                                                }
                                            }, 3000);
                                            if (newSelect) {
                                                chrome.runtime.sendMessage({
                                                    mess: "fetch",
                                                    body: "/pages/actions",
                                                    method: "post",
                                                    content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "select" }
                                                }, () => {
                                                    let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                                                    let interactedLinks = pageActions.filter(filterLink).length
                                                    let interactedInputs = pageActions.filter(filterInput).length
                                                    let interactedButtons = pageActions.filter(filterButton).length
                                                    let interactedSelects = pageActions.filter(filterSelect).length + 1
                                                    let progress = ((interactedLinks + interactedInputs + interactedButtons + interactedSelects) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects + pageInfo.totalSelectObjects)
                                                    innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                                                    innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                                                    let sidenavProgress = document.getElementById("gamificationExtensionSelectsProgress")
                                                    let widgetProgress = interactedSelects * 100 / pageInfo.totalSelectObjects
                                                    sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                                                    sidenavProgress.textContent = "Dropdown Menus Progress: " + widgetProgress.toFixed(2) + "%"
                                                    let table = document.getElementById("gamificationExtensionPageStatsTable")
                                                    let buttonsRow = table.rows[4]
                                                    let pageStat = pageStatsObj.filter(filterURL)[0]
                                                    buttonsRow.cells[1].innerHTML = pageStat.interactedSelects.length
                                                    buttonsRow.cells[2].innerHTML = pageStat.newSelects.length
                                                    buttonsRow.cells[3].innerHTML = pageActions.filter(filterSelect).length + 1
                                                    pageCoverageAchievements(progress, widgetProgress)
                                                    chrome.runtime.sendMessage({
                                                        mess: "fetch",
                                                        body: "/pages/records/" + profileInfo.username,
                                                        method: "post",
                                                        content: { username: profileInfo.username, url: currentURL, coverage: progress, selectsCoverage: widgetProgress },
                                                        firstTime: false
                                                    })
                                                })
                                            }
                                        })
                                    })

                                }
                            })
                        }
                    }
                })
            }

            for (let i = 0; i < formObjects.length; i++) {
                formObjects[i].addEventListener("submit", (event) => {
                    event.preventDefault()
                    chrome.storage.sync.get(["profileInfo"], (result) => {
                        let profileInfo = JSON.parse(result.profileInfo)
                        //iterare tutti i figli del form con tipo input
                        //per ognuno farne il crop e passare il value
                        let inputs = formObjects[i].getElementsByTagName("input")
                        let allInputs = document.body.getElementsByTagName("input")
                        let j
                        for (j = 0; j < inputs.length; j++) {
                            if (inputs[j].type !== "hidden") {
                                inputs[j].style = "border:0; border-style:solid;"
                                let coords = inputs[j].getBoundingClientRect()
                                alert("Select Scheda Chrome to have the crop taken correctly")
                                let textContent = inputs[j].value
                                for (let k = 0; k < allInputs.length; k++) {
                                    if (inputs[j].id === allInputs[k].id) {
                                        chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "input", widgetId: k, textContent: textContent, selectIndex: null }, mess: "capture" })
                                    }
                                }
                            }
                        }
                        //registrare un'ultima azione: invio nell'ultimo input testuale o clic sul submitter
                        if (event.submitter === null) {
                            let lastId = 0
                            for (j = 0; j < inputs.length; j++) {
                                if (inputs[j].type !== "hidden") {
                                    lastId = j
                                }
                            }
                            for (let k = 0; k < allInputs.length; k++) {
                                if (inputs[lastId].id === allInputs[k].id) {
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/crops/" + profileInfo.username,
                                        method: "patch",
                                        content: { widgetId: k }
                                    })
                                }
                            }
                        } else {
                            //form submitted tramite button => bisogna trovare il button per submittare, screenarlo così che sikuli possa cliccarlo
                            console.log("BBBBBBBB")
                        }
                    })
                })
            }

        })
    })
    //achievement sul numero di pagine visitate
    /*if (pages.length === 5) {
        let ach = {
            text: "Visited 5 different pages!",
            obj: {
                title: "New Achievement!",
                message: "Visited 5 different pages!",
                path: "./img/achievement_bronze.png"
            }
        }
        unlockAchievement(ach, profileInfo.achievements)
        chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) })
    }
    //achievement sul numero di pagine con una certa coverage
    if (pages.filter(filterCoverage).length >= 5) {
        let ach = {
            text: "Obtained 50% coverage on 5 pages!",
            obj: {
                title: "New Achievement!",
                message: "Obtained 50% coverage on 5 pages!",
                path: "./img/achievement_silver.png"
            }
        }
        unlockAchievement(ach, profileInfo.achievements)
        chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) })
    }*/
});