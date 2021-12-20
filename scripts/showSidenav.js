let sideDiv = document.createElement("div");
sideDiv.style.overflowY = "scroll"
let button = document.createElement("button");
let found = document.getElementById("gamificationExtensionSidenav");
if (found === null) {
    document.body.appendChild(button);
    button.id = "gamificationExtensionSidenavButton";
    button.style = "position: absolute; top: 50%; right: 0; width: 100;";
    button.textContent = "Open Menu";
    button.onclick = function () {
        document.getElementById("gamificationExtensionSidenav").style.width = "50%";
    };
    document.body.appendChild(sideDiv);
    sideDiv.id = "gamificationExtensionSidenav";
    sideDiv.style = "height: 100%; width: 0; position: fixed; z-index: 1; top: 0; right: 0; background-color: rgb(211 245 230); overflow-x: hidden; padding-top: 10px; transition: 0.5s; overflow-y: scroll";
    let closeButton = document.createElement("button");
    sideDiv.appendChild(closeButton);
    closeButton.id = "gamificationExtensionSidenavCloseButton";
    closeButton.textContent = "Close Menu";
    closeButton.onclick = function () {
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
    };
    let endButton = document.createElement("button");
    sideDiv.appendChild(endButton);
    endButton.id = "gamificationExtensionEndSessionButton";
    endButton.textContent = "End Session";
    endButton.style = "bottom: 10%; right: 50%;";
    endButton.onclick = function () {
        //chiusura della sidenav
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
        document.getElementById("gamificationExtensionSidenav").remove()
        document.getElementById("gamificationExtensionSidenavButton").remove()

        //rimozione della stella se la pagina è una vista per la prima volta
        let star = document.getElementById("gamificationExtensionNewPageStar");
        if (star != null) {
            document.body.removeChild(star);
        }
        removeBorders();
        removeBackground()
        let topnav = document.getElementById("gamificationExtensionTopnav");
        if (topnav != null) {
            document.body.removeChild(topnav);
        }

        //mostrare modal di riepilogo
        chrome.storage.sync.get(
            ["visitedPages", "newPages", "pageStats", "currentURL", "profileInfo", "pageSession"],
            function (result) {
                let profileInfo = JSON.parse(result.profileInfo)
                let visitedPages = result.visitedPages;
                let newPages = result.newPages;
                let modalContainer = document.createElement("div");
                let pageStats = JSON.parse(result.pageStats);
                chrome.runtime.sendMessage({
                    mess: "fetch",
                    body: "/pages/records/" + profileInfo.username,
                    method: "get"
                }, (response) => {
                    let records = response.data
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        method: "get",
                        body: "/users/" + profileInfo.username + "/records"
                    }, (response2) => {
                        let userRecords = response2.data
                        let highestNewWidgets = userRecords.highestNewWidgets
                        let highestCoverage = userRecords.highestCoverage
                        let highestNewVisitedPages = userRecords.highestNewVisitedPages
                        for (let page of pageStats) {
                            function filterURL(event) {
                                return event.url === page.url
                            }
                            let pageRecords = records.filter(filterURL)[0]
                            let highestLinks = page.newLinks.length > pageRecords.highestLinks ? page.newLinks.length : undefined
                            let highestInputs = page.newInputs.length > pageRecords.highestInputs ? page.newInputs.length : undefined
                            let highestButtons = page.newButtons.length > pageRecords.highestButtons ? page.newButtons.length : undefined
                            let highestWidgets = ((page.newLinks.length + page.newInputs.length + page.newButtons.length) >= pageRecords.highestWidgets) ? page.newLinks.length + page.newInputs.length + page.newButtons.length : undefined
                            if (highestWidgets && highestWidgets > highestNewWidgets) {
                                highestNewWidgets = highestWidgets
                            }
                            if (pageRecords.coverage > highestCoverage) {
                                highestCoverage = pageRecords.coverage
                            }
                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                body: "/pages/records/" + profileInfo.username,
                                method: "post",
                                content: { username: profileInfo.username, url: page.url, highestLinks: highestLinks, highestInputs: highestInputs, highestButtons: highestButtons, highestWidgets: highestWidgets },
                                firstTime: false
                            })
                        }
                        if (newPages.length > highestNewVisitedPages) {
                            highestNewVisitedPages = newPages.length
                        }
                        chrome.runtime.sendMessage({
                            mess: "fetch",
                            method: "post",
                            body: "/users/" + profileInfo.username + "/records",
                            content: { username: profileInfo.username, highestNewVisitedPages: highestNewVisitedPages, highestNewWidgets: highestNewWidgets, highestCoverage: highestCoverage }
                        }, () => {
                            //downloadUserProfile()
                            modalContainer.id = "gamificationExtensionModalContainer";
                            modalContainer.style = " display: block; position: fixed;  z-index: 1;  left: 0; top: 0;width: 100%;  height: 100%;  overflow: auto; background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4); ";
                            let innerModal = document.createElement("div");
                            innerModal.id = "gamificationExtensionInnerModal";
                            innerModal.style = "background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; ";
                            modalContainer.appendChild(innerModal);
                            let modalSpan = document.createElement("span");
                            modalSpan.id = "gamificationExtensionModalSpan";
                            modalSpan.style = "color: #aaa; float: right; font-size: 28px; font-weight: bold;";
                            modalSpan.textContent = "X";
                            innerModal.appendChild(modalSpan);
                            let modalContent = document.createElement("p");
                            modalContent.id = "gamificationExtensionModalContent";

                            let totalLinks = totalInputs = totalButtons = newLinks = newInputs = newButtons = 0;
                            for (let i = 0; i < pageStats.length; i++) {
                                totalLinks += pageStats[i].interactedLinks.length;
                                totalInputs += pageStats[i].interactedInputs.length;
                                totalButtons += pageStats[i].interactedButtons.length;
                                newLinks += pageStats[i].newLinks.length;
                                newInputs += pageStats[i].newInputs.length;
                                newButtons += pageStats[i].newButtons.length;
                            }
                            modalContent.innerText = "Pages visited in this session: " + visitedPages.length + "\nPages encountered for the first time: " + newPages.length +
                                "\nLinks clicked in this session: " + totalLinks + "\nLinks clicked for the first time: " + newLinks +
                                "\nForms interacted with in this session: " + totalInputs + "\nForms interacted with for the first time: " + newInputs +
                                "\nButtons clicked in this session: " + totalButtons + "\nButtons clicked for the first time: " + newButtons;
                            innerModal.appendChild(modalContent);
                            modalSpan.onclick = function () { modalContainer.style.display = "none"; };
                            window.onclick = function (event) {
                                if (event.target === modalContainer) {
                                    modalContainer.style.display = "none";
                                }
                            };
                            document.body.appendChild(modalContainer);
                            //downloadFile();
                            //downloadSignaledIssues()
                            //downloadSessionImage()
                            chrome.storage.sync.set({ previousSession: result.pageSession })
                        })
                    })
                })
            }
        );
        chrome.storage.sync.set({ startingURL: "", pageStats: JSON.stringify([]) });
    };
    let toggleClickedElementsButton = document.createElement("button");
    sideDiv.appendChild(toggleClickedElementsButton);
    toggleClickedElementsButton.id = "gamificationExtensionToggleClickedElementsButton";
    toggleClickedElementsButton.textContent = "Show Interacted Elements";
    toggleClickedElementsButton.onclick = function () {
        removeBorders()
        drawBorderOnInteracted()
        chrome.storage.sync.set({ overlayMode: "interacted" })
    };
    let removeOverlaysButton = document.createElement("button");
    sideDiv.appendChild(removeOverlaysButton);
    removeOverlaysButton.id = "gamificationExtensionRemoveOverlaysButton";
    removeOverlaysButton.textContent = "Remove Overlays";
    removeOverlaysButton.onclick = function () {
        removeBorders()
        chrome.storage.sync.set({ overlayMode: "none" })
    };
    let toggleAllElementsButton = document.createElement("button");
    sideDiv.appendChild(toggleAllElementsButton);
    toggleAllElementsButton.id = "gamificationExtensionToggleAllElementsButton";
    toggleAllElementsButton.textContent = "Show All Elements";
    toggleAllElementsButton.onclick = function () {
        drawBorderOnAll()
        chrome.storage.sync.set({ overlayMode: "all" })
    };
    chrome.storage.sync.get(["pageActions", "pageStats", "currentURL", "visitedPages", "startingURL", "newPages", "profileInfo"], function (result) {
        let profileInfo = JSON.parse(result.profileInfo)

        function filterURL(event) {
            return event.url === result.currentURL;
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
        chrome.runtime.sendMessage({
            mess: "fetch",
            body: "/pages/actions/" + profileInfo.username,
            method: "get",
            content: { url: result.currentURL }
        }, (response) => {
            let pageActions = response.data
            let pageStats = JSON.parse(result.pageStats).filter(filterURL)[0];
            let visitedPages = result.visitedPages;
            let newPages = result.newPages;
            let noStats = pageStats === undefined;
            let noNewPages = newPages === undefined;
            let noVisitedPages = visitedPages === undefined;

            let table = document.createElement("table");
            table.id = "gamificationExtensionPageStatsTable"
            let linksRow = table.insertRow();
            for (let i = 0; i < 4; i++) {
                let cell = linksRow.insertCell();
                let text = "";
                switch (i) {
                    case 0:
                        text = "Links";
                        break;
                    case 1:
                        text = noStats ? 0 : pageStats.interactedLinks.filter(onlyUnique).length;
                        break;
                    case 2:
                        text = noStats ? 0 : pageStats.newLinks.filter(onlyUnique).length;
                        break;
                    case 3:
                        text = pageActions.filter(filterLink).length;
                        break;
                }
                cell.appendChild(document.createTextNode(text));
            }
            let inputsRow = table.insertRow();
            for (let i = 0; i < 4; i++) {
                let cell = inputsRow.insertCell();
                let text = "";
                switch (i) {
                    case 0:
                        text = "Forms";
                        break;
                    case 1:
                        text = noStats ? 0 : pageStats.interactedInputs.filter(onlyUnique).length;
                        break;
                    case 2:
                        text = noStats ? 0 : pageStats.newInputs.filter(onlyUnique).length;
                        break;
                    case 3:
                        text = pageActions.filter(filterInput).length;
                        break;
                }
                cell.appendChild(document.createTextNode(text));
            }
            let buttonsRow = table.insertRow();
            for (let i = 0; i < 4; i++) {
                let cell = buttonsRow.insertCell();
                let text = "";
                switch (i) {
                    case 0:
                        text = "Buttons";
                        break;
                    case 1:
                        text = noStats ? 0 : pageStats.interactedButtons.filter(onlyUnique).length;
                        break;
                    case 2:
                        text = noStats ? 0 : pageStats.newButtons.filter(onlyUnique).length;
                        break;
                    case 3:
                        text = pageActions.filter(filterButton).length;
                        break;
                }
                cell.appendChild(document.createTextNode(text));
            }
            let tableHead = table.createTHead();
            let headRow = tableHead.insertRow();
            let th1 = document.createElement("th");
            th1.appendChild(document.createTextNode("Page Widgets"));
            let th2 = document.createElement("th");
            th2.appendChild(document.createTextNode("Current Session"));
            let th3 = document.createElement("th");
            th3.appendChild(document.createTextNode("New"));
            let th4 = document.createElement("th");
            th4.appendChild(document.createTextNode("Total"));
            headRow.appendChild(th1);
            headRow.appendChild(th2);
            headRow.appendChild(th3);
            headRow.appendChild(th4);
            sideDiv.appendChild(table);

            chrome.runtime.sendMessage({
                mess: "fetch",
                method: "get",
                body: "/pages/records/" + profileInfo.username,
                content: { url: result.currentURL }
            }, (response2) => {
                let records = response2.data
                let pageRecords = records.filter(filterURL)[0]
                let tablePages = document.createElement("table");
                tablePages.id = "gamificationExtensionPagesTable"
                let pagesRow = tablePages.insertRow();
                for (let i = 0; i < 4; i++) {
                    let cell = pagesRow.insertCell();
                    let text = "";
                    switch (i) {
                        case 0:
                            text = "Pages";
                            break;
                        case 1:
                            text = noVisitedPages ? 1 : visitedPages.length;
                            break;
                        case 2:
                            text = noNewPages ? 1 : newPages.length;
                            break;
                        case 3:
                            text = records.length;
                            break;
                    }
                    cell.appendChild(document.createTextNode(text));
                }
                let tHead = tablePages.createTHead();
                let hRow = tHead.insertRow();
                let t1 = document.createElement("th");
                t1.appendChild(document.createTextNode("Pages Visited"));
                let t2 = document.createElement("th");
                t2.appendChild(document.createTextNode("Current Session"));
                let t3 = document.createElement("th");
                t3.appendChild(document.createTextNode("New"));
                let t4 = document.createElement("th");
                t4.appendChild(document.createTextNode("Total"));
                hRow.appendChild(t1);
                hRow.appendChild(t2);
                hRow.appendChild(t3);
                hRow.appendChild(t4);
                sideDiv.appendChild(tablePages);

                let linksProgressTop = document.createElement("div");
                sideDiv.appendChild(linksProgressTop);
                linksProgressTop.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                let linksProgress = document.createElement("div");
                linksProgress.id = "gamificationExtensionLinksProgress";
                linksProgress.style =
                    `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + pageRecords.linksCoverage + `%; white-space:nowrap`;
                linksProgressTop.appendChild(linksProgress);
                linksProgress.textContent = pageRecords.linksCoverage !== -1 ? "Links Progress: " + pageRecords.linksCoverage + "%" : "There are no links in this page";
                let inputsProgressTop = document.createElement("div");
                sideDiv.appendChild(inputsProgressTop);
                inputsProgressTop.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                let inputsProgress = document.createElement("div");
                inputsProgress.id = "gamificationExtensionInputsProgress";
                inputsProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + pageRecords.inputsCoverage + `%; white-space:nowrap`;
                inputsProgressTop.appendChild(inputsProgress);
                inputsProgress.textContent = pageRecords.inputsCoverage !== -1 ? "Forms Progress: " + pageRecords.inputsCoverage + "%" : "There are no forms in this page";
                let buttonsProgressTop = document.createElement("div");
                sideDiv.appendChild(buttonsProgressTop);
                buttonsProgressTop.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                let buttonsProgress = document.createElement("div");
                buttonsProgressTop.appendChild(buttonsProgress);
                buttonsProgress.id = "gamificationExtensionButtonsProgress"
                buttonsProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + pageRecords.buttonsCoverage + `%; white-space:nowrap`;
                buttonsProgress.textContent = pageRecords.buttonsCoverage !== -1 ? "Buttons Progress: " + pageRecords.buttonsCoverage + "%" : "There are no buttons in this page";

                chrome.runtime.sendMessage({
                    mess: "fetch",
                    method: "get",
                    body: "/users/" + profileInfo.username + "/records"
                }, (response3) => {
                    let userRecords = response3.data
                    let recordsTitle = document.createElement("h2")
                    recordsTitle.textContent = "Records"
                    sideDiv.appendChild(recordsTitle)
                    let coverageRecord = document.createElement("h4")
                    coverageRecord.style.textTransform = "Inherit"
                    coverageRecord.textContent = "Highest Page Coverage: " + userRecords.highestCoverage
                    sideDiv.appendChild(coverageRecord)
                    let pagesRecord = document.createElement("h4")
                    pagesRecord.style.textTransform = "Inherit"
                    pagesRecord.textContent = "Highest Number of New Pages Found in a Session: " + userRecords.highestNewVisitedPages
                    sideDiv.appendChild(pagesRecord)
                    let widgetsRecord = document.createElement("h4")
                    widgetsRecord.style.textTransform = "Inherit"
                    widgetsRecord.textContent = "Highest Number of New Widgets Found in a Session - Global: " + userRecords.highestNewWidgets
                    sideDiv.appendChild(widgetsRecord)
                    let pageWidgetsRecord = document.createElement("h4")
                    pageWidgetsRecord.style.textTransform = "Inherit"
                    pageWidgetsRecord.textContent = "Highest Number of New Widgets Found in a Session - This Page: " + pageRecords.highestWidgets
                    sideDiv.appendChild(pageWidgetsRecord)
                })
            })
        })
    }
    );
    chrome.storage.sync.get(["interactionMode", "previousSession"], function (result) {
        let interactionMode = result.interactionMode
        let previousSession = JSON.parse(result.previousSession)
        let currentModeText = document.createElement("h3")
        let currentText = interactionMode === "interact" ? "Current Mode: Page Interaction" : interactionMode === "signal" ? "Current Mode: Signal Issues" : "Current Mode: Replay Session"
        currentModeText.textContent = currentText
        sideDiv.appendChild(currentModeText)
        let enterSignalModeButton = document.createElement("button")
        enterSignalModeButton.id = "GamificationExtensionSignalModeButton"
        sideDiv.appendChild(enterSignalModeButton)
        enterSignalModeButton.textContent = "Signal Issues"
        enterSignalModeButton.style.display = interactionMode !== "signal" ? "flex" : "none"
        let enterInteractModeButton = document.createElement("button")
        enterInteractModeButton.id = "GamificationExtensionInteractModeButton"
        sideDiv.appendChild(enterInteractModeButton)
        enterInteractModeButton.textContent = "Interact with Page"
        enterInteractModeButton.style.display = interactionMode !== "interact" ? "flex" : "none"
        let enterSessionModeButton = document.createElement("button")
        enterSessionModeButton.id = "GamificationExtensionSessionModeButton"
        sideDiv.appendChild(enterSessionModeButton)
        enterSessionModeButton.textContent = "Replay Past Session"
        enterSessionModeButton.style.display = interactionMode !== "session" ? "flex" : "none"
        enterSignalModeButton.onclick = function () {
            chrome.storage.sync.set({ interactionMode: "signal" })
            enterSignalModeButton.style.display = "none"
            enterInteractModeButton.style.display = "flex"
            enterSessionModeButton.style.display = "flex"
            currentModeText.textContent = "Current Mode: Signal Issues"
            document.getElementById("gamificationExtensionToggleClickedElementsButton").style.display = "none"
            document.getElementById("gamificationExtensionRemoveOverlaysButton").style.display = "none"
            document.getElementById("gamificationExtensionToggleAllElementsButton").style.display = "none"
            removeBorders()
            drawBackground()
        }
        enterInteractModeButton.onclick = function () {
            chrome.storage.sync.set({ interactionMode: "interact" })
            enterSignalModeButton.style.display = "flex"
            enterInteractModeButton.style.display = "none"
            enterSessionModeButton.style.display = "flex"
            currentModeText.textContent = "Current Mode: Page Interaction"
            document.getElementById("gamificationExtensionToggleClickedElementsButton").style.display = "flex"
            document.getElementById("gamificationExtensionRemoveOverlaysButton").style.display = "flex"
            document.getElementById("gamificationExtensionToggleAllElementsButton").style.display = "flex"
            removeBackground()
            drawBorders()
        }
        enterSessionModeButton.onclick = function () {
            chrome.storage.sync.get(["sessionPosition"], function (result) {
                if (result.sessionPosition >= previousSession.length) {
                    chrome.storage.sync.set({ sessionPosition: 0 })
                }
                chrome.storage.sync.set({ interactionMode: "session" })
                enterSessionModeButton.style.display = "none"
                enterSignalModeButton.style.display = "flex"
                enterInteractModeButton.style.display = "flex"
                currentModeText.textContent = "Current Mode: Replay Session"
                document.getElementById("gamificationExtensionToggleClickedElementsButton").style.display = "none"
                document.getElementById("gamificationExtensionRemoveOverlaysButton").style.display = "none"
                document.getElementById("gamificationExtensionToggleAllElementsButton").style.display = "none"
                removeBackground()
                removeBorders()
                drawNextSessionElement()
            })
        }
        if (interactionMode === "signal" || interactionMode === "session") {
            document.getElementById("gamificationExtensionToggleClickedElementsButton").style.display = "none"
            document.getElementById("gamificationExtensionRemoveOverlaysButton").style.display = "none"
            document.getElementById("gamificationExtensionToggleAllElementsButton").style.display = "none"
        }
    })
}