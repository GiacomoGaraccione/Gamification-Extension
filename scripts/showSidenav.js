var div = document.createElement("div");
var button = document.createElement("button");
var found = document.getElementById("gamificationExtensionSidenav");
if (found === null) {
    document.body.appendChild(button);
    button.id = "gamificationExtensionSidenavButton";
    button.style = "position: absolute; top: 50%; right: 0; width: 100;";
    button.textContent = "Open Menu";
    button.onclick = function () {
        document.getElementById("gamificationExtensionSidenav").style.width = "250px";
    };
    document.body.appendChild(div);
    div.id = "gamificationExtensionSidenav";
    div.style = "height: 100%; width: 0; position: fixed; z-index: 1; top: 0; right: 0; background-color: rgb(211 245 230); overflow-x: hidden; padding-top: 60px; transition: 0.5s;";
    var closeButton = document.createElement("button");
    div.appendChild(closeButton);
    closeButton.id = "gamificationExtensionSidenavCloseButton";
    closeButton.textContent = "Close Menu";
    closeButton.onclick = function () {
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
    };
    var endButton = document.createElement("button");
    div.appendChild(endButton);
    endButton.id = "gamificationExtensionEndSessionButton";
    endButton.textContent = "End Session";
    endButton.style = "bottom: 10%; right: 50%;";
    endButton.onclick = function () {
        downloadFile();
        //chiusura della sidenav
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
        button.parentElement.removeChild(button);
        div.parentElement.removeChild(div);
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
        //l'url di partenza viene cancellato per evitare di mostrare di nuovo tutte le aggiunte alla pagina

        //mostrare modal di riepilogo
        chrome.storage.sync.get(
            ["visitedPages", "newPages", "pageStats"],
            function (result) {
                var visitedPages = result.visitedPages;
                var newPages = result.newPages;
                var modalContainer = document.createElement("div");
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
                var pageStats = JSON.parse(result.pageStats);
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
            }
        );
        chrome.storage.sync.set({
            startingURL: "",
            pageStats: JSON.stringify([]),
        });
    };
    var toggleClickedElementsButton = document.createElement("button");
    div.appendChild(toggleClickedElementsButton);
    toggleClickedElementsButton.id = "gamificationExtensionToggleClickedElementsButton";
    toggleClickedElementsButton.textContent = "Show Interacted Elements";
    toggleClickedElementsButton.onclick = function () {
        removeBorders()
        drawBorderOnInteracted()
        chrome.storage.sync.set({ overlayMode: "interacted" })
    };
    var removeOverlaysButton = document.createElement("button");
    div.appendChild(removeOverlaysButton);
    removeOverlaysButton.id = "gamificationExtensionRemoveOverlaysButton";
    removeOverlaysButton.textContent = "Remove Overlays";
    removeOverlaysButton.onclick = function () {
        removeBorders()
        chrome.storage.sync.set({ overlayMode: "none" })
    };
    var toggleAllElementsButton = document.createElement("button");
    div.appendChild(toggleAllElementsButton);
    toggleAllElementsButton.id = "gamificationExtensionToggleAllElementsButton";
    toggleAllElementsButton.textContent = "Show All Elements";
    toggleAllElementsButton.onclick = function () {
        drawBorderOnAll()
        chrome.storage.sync.set({ overlayMode: "all" })
    };
    chrome.storage.sync.get(["pageActions", "pageStats", "currentURL", "visitedPages", "startingURL", "newPages",], function (result) {
        var pageActions = JSON.parse(result.pageActions);
        var pageStats = JSON.parse(result.pageStats);
        var visitedPages = result.visitedPages;
        var startingURL = result.startingURL;
        var newPages = result.newPages;
        function filterURL(event) {
            return event.url === result.currentURL;
        }
        var stats = pageStats.filter(filterURL)[0];
        var actions = pageActions.filter(filterURL)[0];
        var noStats = stats === undefined;
        var noActions = actions === undefined;
        var noNewPages = newPages === undefined;
        var noVisitedPages = visitedPages === undefined;

        var table = document.createElement("table");
        var linksRow = table.insertRow();
        for (var i = 0; i < 4; i++) {
            var cell = linksRow.insertCell();
            var text = "";
            switch (i) {
                case 0:
                    text = "Links";
                    break;
                case 1:
                    text = noStats
                        ? 0
                        : stats.interactedLinks.filter(onlyUnique).length;
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

        var totalPages = [];
        var currentPresent = false;
        for (var i = 0; i < pageActions.length; i++) {
            if (pageActions[i].url.indexOf(startingURL) >= 0 && startingURL != "") {
                totalPages.push(pageActions[i].url);
            }
            if (pageActions[i].url === result.currentURL) {
                currentPresent = true;
            }
        }

        var pagesRow = table.insertRow();
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

        var tableHead = table.createTHead();
        var headRow = tableHead.insertRow();
        var th1 = document.createElement("th");
        var text1 = document.createTextNode("");
        th1.appendChild(text1);
        var th2 = document.createElement("th");
        var text2 = document.createTextNode("Current Session");
        th2.appendChild(text2);
        var th3 = document.createElement("th");
        var text3 = document.createTextNode("New");
        th3.appendChild(text3);
        var th4 = document.createElement("th");
        var text4 = document.createTextNode("Total");
        th4.appendChild(text4);
        headRow.appendChild(th1);
        headRow.appendChild(th2);
        headRow.appendChild(th3);
        headRow.appendChild(th4);

        div.appendChild(table);

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
        div.appendChild(linksProgressTop);
        linksProgressTop.id = "gamificationExtensionLinksProgress";
        linksProgressTop.style =
            "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
        var linksProgress = document.createElement("div");
        linksProgress.style =
            `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
            linksPerc +
            `%; white-space:nowrap`;
        linksProgressTop.appendChild(linksProgress);
        linksProgress.textContent = "Links Progress: " + linksPerc + "%";
        var inputsProgressTop = document.createElement("div");
        div.appendChild(inputsProgressTop);
        inputsProgressTop.id = "gamificationExtensionInputsProgress";
        inputsProgressTop.style =
            "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
        var inputsProgress = document.createElement("div");
        inputsProgress.style =
            `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
            inputsPerc +
            `%; white-space:nowrap`;
        inputsProgressTop.appendChild(inputsProgress);
        inputsProgress.textContent = "Forms Progress: " + inputsPerc + "%";
        var buttonsProgressTop = document.createElement("div");
        div.appendChild(buttonsProgressTop);
        buttonsProgressTop.style =
            "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
        var buttonsProgress = document.createElement("div");
        buttonsProgressTop.appendChild(buttonsProgress);
        buttonsProgress.style =
            `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` +
            buttonsPerc +
            `%; white-space:nowrap`;
        buttonsProgressTop.id = "gamificationExtensionButtonsProgress";
        buttonsProgress.textContent = "Buttons Progress: " + buttonsPerc + "%";
    }
    );
}