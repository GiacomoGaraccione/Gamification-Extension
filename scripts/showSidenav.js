var sideDiv = document.createElement("div");
sideDiv.style.overflowY = "scroll"
var button = document.createElement("button");
var found = document.getElementById("gamificationExtensionSidenav");
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
    sideDiv.style = "height: 100%; width: 0; position: fixed; z-index: 1; top: 0; right: 0; background-color: rgb(211 245 230); overflow-x: hidden; padding-top: 10px; transition: 0.5s;";
    var closeButton = document.createElement("button");
    sideDiv.appendChild(closeButton);
    closeButton.id = "gamificationExtensionSidenavCloseButton";
    closeButton.textContent = "Close Menu";
    closeButton.onclick = function () {
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
    };
    var endButton = document.createElement("button");
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
        var star = document.getElementById("gamificationExtensionNewPageStar");
        if (star != null) {
            document.body.removeChild(star);
        }
        removeBorders();
        var topnav = document.getElementById("gamificationExtensionTopnav");
        if (topnav != null) {
            document.body.removeChild(topnav);
        }

        //mostrare modal di riepilogo
        chrome.storage.sync.get(
            ["visitedPages", "newPages", "pageStats", "pageActions", "currentURL", "profileInfo", "registeredUsers"],
            function (result) {
                var profileInfo = JSON.parse(result.profileInfo)
                function filterUser(event) {
                    return event.username === profileInfo.username
                }
                var visitedPages = result.visitedPages;
                var newPages = result.newPages;
                var modalContainer = document.createElement("div");
                var pageStats = JSON.parse(result.pageStats);
                var pageActions = JSON.parse(result.pageActions)
                var userPages = pageActions.filter(filterUser)[0]
                for (var page of userPages.pages) {
                    function filterPageURL(event) {
                        return event.url === page.url
                    }
                    var stats = pageStats.filter(filterPageURL)[0]
                    var newWidgets = stats ? stats.newButtons.length + stats.newLinks.length + stats.newInputs.length : 0
                    var oldRecord = page.highestWidgets
                    if (newWidgets > oldRecord) {
                        page.highestWidgets = newWidgets
                    }
                }
                if (userPages.highestPages < newPages.length) {
                    userPages.highestPages = newPages.length
                }
                var highestCoverage = Math.max.apply(Math, userPages.pages.map((u) => { return u.coverage }))
                var highestWidgets = Math.max.apply(Math, userPages.pages.map((u => { return u.highestWidgets })))
                if (highestCoverage > userPages.highestCoverage) {
                    userPages.highestCoverage = highestCoverage
                }
                if (highestWidgets > userPages.highestWidgets) {
                    userPages.highestWidgets = highestWidgets
                }
                var registeredUsers = JSON.parse(result.registeredUsers)
                var userRankings = registeredUsers.filter(filterUser)[0]
                if (userPages.highestPages > userRankings.highestNewVisitedPages) {
                    userRankings.highestNewVisitedPages = userPages.highestPages
                }
                if (userPages.highestCoverage > userRankings.highestCoverage) {
                    userRankings.highestCoverage = userPages.highestCoverage
                }
                if (userPages.highestWidgets > userRankings.highestNewWidgets) {
                    userRankings.highestNewWidgets = userPages.highestWidgets
                }
                //TODO: aggiornare profilo
                downloadUserProfile()
                chrome.storage.sync.set({ pageActions: JSON.stringify(pageActions), registeredUsers: JSON.stringify(registeredUsers) })

                modalContainer.id = "gamificationExtensionModalContainer";
                modalContainer.style =
                    " display: block; position: fixed;  z-index: 1;  left: 0; top: 0;width: 100%;  height: 100%;  overflow: auto; background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4); ";
                var innerModal = document.createElement("div");
                innerModal.id = "gamificationExtensionInnerModal";
                innerModal.style =
                    "background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; ";
                modalContainer.appendChild(innerModal);
                var modalSpan = document.createElement("span");
                modalSpan.id = "gamificationExtensionModalSpan";
                modalSpan.style =
                    "color: #aaa; float: right; font-size: 28px; font-weight: bold;";
                modalSpan.textContent = "X";
                innerModal.appendChild(modalSpan);
                var modalContent = document.createElement("p");
                modalContent.id = "gamificationExtensionModalContent";

                var totalLinks = 0;
                var totalInputs = 0;
                var totalButtons = 0;
                var newLinks = 0;
                var newInputs = 0;
                var newButtons = 0;
                for (var i = 0; i < pageStats.length; i++) {
                    totalLinks += pageStats[i].interactedLinks.length;
                    totalInputs += pageStats[i].interactedInputs.length;
                    totalButtons += pageStats[i].interactedButtons.length;
                    newLinks += pageStats[i].newLinks.length;
                    newInputs += pageStats[i].newInputs.length;
                    newButtons += pageStats[i].newButtons.length;
                }
                modalContent.innerText = "Pages visited in this session: " + visitedPages.length + "\nPages encountered for the first time: " +
                    newPages.length + "\nLinks clicked in this session: " + totalLinks +
                    "\nForms interacted with in this session: " + totalInputs + "\nButtons clicked in this session: " + totalButtons + "\nLinks clicked for the first time: " +
                    newLinks + "\nForms interacted with for the first time: " + newInputs + "\nButtons clicked for the first time: " + newButtons;
                innerModal.appendChild(modalContent);
                modalSpan.onclick = function () {
                    modalContainer.style.display = "none";
                };
                window.onclick = function (event) {
                    if (event.target === modalContainer) {
                        modalContainer.style.display = "none";
                    }
                };
                document.body.appendChild(modalContainer);
                downloadFile();
            }
        );
        chrome.storage.sync.set({ startingURL: "", pageStats: JSON.stringify([]) });
    };
    var toggleClickedElementsButton = document.createElement("button");
    sideDiv.appendChild(toggleClickedElementsButton);
    toggleClickedElementsButton.id = "gamificationExtensionToggleClickedElementsButton";
    toggleClickedElementsButton.textContent = "Show Interacted Elements";
    toggleClickedElementsButton.onclick = function () {
        removeBorders()
        drawBorderOnInteracted()
        chrome.storage.sync.set({ overlayMode: "interacted" })
    };
    var removeOverlaysButton = document.createElement("button");
    sideDiv.appendChild(removeOverlaysButton);
    removeOverlaysButton.id = "gamificationExtensionRemoveOverlaysButton";
    removeOverlaysButton.textContent = "Remove Overlays";
    removeOverlaysButton.onclick = function () {
        removeBorders()
        chrome.storage.sync.set({ overlayMode: "none" })
    };
    var toggleAllElementsButton = document.createElement("button");
    sideDiv.appendChild(toggleAllElementsButton);
    toggleAllElementsButton.id = "gamificationExtensionToggleAllElementsButton";
    toggleAllElementsButton.textContent = "Show All Elements";
    toggleAllElementsButton.onclick = function () {
        drawBorderOnAll()
        chrome.storage.sync.set({ overlayMode: "all" })
    };
    chrome.storage.sync.get(["pageActions", "pageStats", "currentURL", "visitedPages", "startingURL", "newPages", "profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        function filterUser(event) {
            return event.username === profileInfo.username
        }

        function filterURL(event) {
            return event.url === result.currentURL;
        }

        var pageActions = JSON.parse(result.pageActions);
        var userActions = pageActions.filter(filterUser)[0]
        var pageStats = JSON.parse(result.pageStats);
        var userPageActions = userActions ? userActions.pages : []
        var visitedPages = result.visitedPages;
        var startingURL = result.startingURL;
        var newPages = result.newPages;

        var stats = pageStats.filter(filterURL)[0];
        var actions = userActions ? userActions.pages.filter(filterURL)[0] : undefined;
        var noStats = stats === undefined;
        var noActions = actions === undefined;
        var noNewPages = newPages === undefined;
        var noVisitedPages = visitedPages === undefined;

        var table = document.createElement("table");
        table.id = "gamificationExtensionPageStatsTable"
        var linksRow = table.insertRow();
        for (var i = 0; i < 4; i++) {
            var cell = linksRow.insertCell();
            var text = "";
            switch (i) {
                case 0:
                    text = "Links";
                    break;
                case 1:
                    text = noStats ? 0 : stats.interactedLinks.filter(onlyUnique).length;
                    break;
                case 2:
                    text = noStats ? 0 : stats.newLinks.filter(onlyUnique).length;
                    break;
                case 3:
                    text = noActions ? 0 : actions.idsOfLinkObjects.filter(onlyUnique).length;
                    break;
            }
            cell.appendChild(document.createTextNode(text));
        }
        var inputsRow = table.insertRow();
        for (var i = 0; i < 4; i++) {
            var cell = inputsRow.insertCell();
            var text = "";
            switch (i) {
                case 0:
                    text = "Forms";
                    break;
                case 1:
                    text = noStats ? 0 : stats.interactedInputs.filter(onlyUnique).length;
                    break;
                case 2:
                    text = noStats ? 0 : stats.newInputs.filter(onlyUnique).length;
                    break;
                case 3:
                    text = noActions ? 0 : actions.idsOfInputObjects.filter(onlyUnique).length;
                    break;
            }
            cell.appendChild(document.createTextNode(text));
        }
        var buttonsRow = table.insertRow();
        for (var i = 0; i < 4; i++) {
            var cell = buttonsRow.insertCell();
            var text = "";
            switch (i) {
                case 0:
                    text = "Buttons";
                    break;
                case 1:
                    text = noStats ? 0 : stats.interactedButtons.filter(onlyUnique).length;
                    break;
                case 2:
                    text = noStats ? 0 : stats.newButtons.filter(onlyUnique).length;
                    break;
                case 3:
                    text = noActions ? 0 : actions.idsOfButtonObjects.filter(onlyUnique).length;
                    break;
            }
            cell.appendChild(document.createTextNode(text));
        }
        var tableHead = table.createTHead();
        var headRow = tableHead.insertRow();
        var th1 = document.createElement("th");
        th1.appendChild(document.createTextNode("Page Widgets"));
        var th2 = document.createElement("th");
        th2.appendChild(document.createTextNode("Current Session"));
        var th3 = document.createElement("th");
        th3.appendChild(document.createTextNode("New"));
        var th4 = document.createElement("th");
        th4.appendChild(document.createTextNode("Total"));
        headRow.appendChild(th1);
        headRow.appendChild(th2);
        headRow.appendChild(th3);
        headRow.appendChild(th4);

        sideDiv.appendChild(table);

        var tablePages = document.createElement("table");
        tablePages.id = "gamificationExtensionPagesTable"
        var totalPages = [];
        var currentPresent = false;
        for (var i = 0; i < userPageActions.length; i++) {
            if (userPageActions[i].url.indexOf(startingURL) >= 0 && startingURL != "") {
                totalPages.push(userPageActions[i].url);
            }
            if (userPageActions[i].url === result.currentURL) {
                currentPresent = true;
            }
        }

        var pagesRow = tablePages.insertRow();
        var totalNumPages = noNewPages ? 1 : totalPages.length;
        if (!currentPresent) {
            totalNumPages++;
        }
        for (var i = 0; i < 4; i++) {
            var cell = pagesRow.insertCell();
            var text = "";
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
                    text = totalNumPages;
                    break;
            }
            cell.appendChild(document.createTextNode(text));
        }
        var tHead = tablePages.createTHead();
        var hRow = tHead.insertRow();
        var t1 = document.createElement("th");
        t1.appendChild(document.createTextNode("Pages Visited"));
        var t2 = document.createElement("th");
        t2.appendChild(document.createTextNode("Current Session"));
        var t3 = document.createElement("th");
        t3.appendChild(document.createTextNode("New"));
        var t4 = document.createElement("th");
        t4.appendChild(document.createTextNode("Total"));
        hRow.appendChild(t1);
        hRow.appendChild(t2);
        hRow.appendChild(t3);
        hRow.appendChild(t4);
        sideDiv.appendChild(tablePages);

        var totalLinks = document.getElementsByTagName("a").length;
        var totalInputs = document.getElementsByTagName("input").length;

        var totalButtons = document.getElementsByTagName("button");
        var buttonsCount = 0;
        for (var i = 0; i < totalButtons.length; i++) {
            if (!isButtonOfExtension(totalButtons[i])) {
                buttonsCount++;
            }
        }
        var linkObjects = noActions ? 0 : actions.idsOfLinkObjects.length;
        var inputObjects = noActions ? 0 : actions.idsOfInputObjects.length;
        var buttonObjects = noActions ? 0 : actions.idsOfButtonObjects.length;
        var linksPerc = (linkObjects * 100) / totalLinks;
        var inputsPerc = (inputObjects * 100) / totalInputs;
        var buttonsPerc = (buttonObjects * 100) / buttonsCount;

        var linksProgressTop = document.createElement("div");
        sideDiv.appendChild(linksProgressTop);
        linksProgressTop.style =
            "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
        var linksProgress = document.createElement("div");
        linksProgress.id = "gamificationExtensionLinksProgress";
        linksProgress.style =
            `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
            linksPerc +
            `%; white-space:nowrap`;
        linksProgressTop.appendChild(linksProgress);
        linksProgress.textContent = "Links Progress: " + linksPerc + "%";
        var inputsProgressTop = document.createElement("div");
        sideDiv.appendChild(inputsProgressTop);
        inputsProgressTop.style =
            "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
        var inputsProgress = document.createElement("div");
        inputsProgress.id = "gamificationExtensionInputsProgress";
        inputsProgress.style =
            `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
            inputsPerc +
            `%; white-space:nowrap`;
        inputsProgressTop.appendChild(inputsProgress);
        inputsProgress.textContent = "Forms Progress: " + inputsPerc + "%";
        var buttonsProgressTop = document.createElement("div");
        sideDiv.appendChild(buttonsProgressTop);
        buttonsProgressTop.style =
            "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
        var buttonsProgress = document.createElement("div");
        buttonsProgressTop.appendChild(buttonsProgress);
        buttonsProgress.id = "gamificationExtensionButtonsProgress"
        buttonsProgress.style =
            `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
            buttonsPerc +
            `%; white-space:nowrap`;
        buttonsProgress.textContent = "Buttons Progress: " + buttonsPerc + "%";

        var recordsTitle = document.createElement("h2")
        recordsTitle.textContent = "Records"
        sideDiv.appendChild(recordsTitle)
        var coverageRecord = document.createElement("h4")
        coverageRecord.style.textTransform = "Inherit"
        coverageRecord.textContent = "Highest Page Coverage: " + userActions.highestCoverage
        sideDiv.appendChild(coverageRecord)
        var pagesRecord = document.createElement("h4")
        pagesRecord.style.textTransform = "Inherit"
        pagesRecord.textContent = "Highest Number of New Pages Found in a Session: " + userActions.highestPages
        sideDiv.appendChild(pagesRecord)
        var widgetsRecord = document.createElement("h4")
        widgetsRecord.style.textTransform = "Inherit"
        widgetsRecord.textContent = "Highest Number of New Widgets Found in a Session - Global: " + userActions.highestWidgets
        sideDiv.appendChild(widgetsRecord)
        var pageWidgetsRecord = document.createElement("h4")
        pageWidgetsRecord.style.textTransform = "Inherit"
        pageWidgetsRecord.textContent = "Highest Number of New Widgets Found in a Session - This Page: " + actions.highestWidgets
        sideDiv.appendChild(pageWidgetsRecord)
    }
    );
}