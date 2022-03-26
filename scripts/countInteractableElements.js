/**
 * Script that counts how many elements of the different relevant kinds are present in the current page
 * Inserts in the database information about the count of widgets and then launches the listeners that perform operations (action recording, issue reporting) after widget interaction
 */
chrome.storage.sync.get(["currentURL", "pageStats", "profileInfo"], (result) => {
    let currentURL = result.currentURL;
    let profileInfo = JSON.parse(result.profileInfo)

    function filterURL(event) {
        return event.url === currentURL
    }

    /**
     * Count of all widgets (links, forms, buttons, dropdown menus) present in the page
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

    /**
     * Creation of a new pageStats object, used for keeping track of information about the actions performed on a page during the current session (count of interacted elements and of newly found elements)
     */
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
        //Writes in the database information about the page (count of elements)
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
        }, () => {
            /**
             * Adds, the first time the page is loaded/visited, the event listener that performs actions after interacting with each element
             */
            for (let i = 0; i < linkObjects.length; i++) {
                if (!linkObjects[i].getAttribute("listener")) {
                    linkObjects[i].addEventListener("click", (event) => linkClickListener(event, i, pageInfo))
                    linkObjects[i].setAttribute("listener", true)
                }
            }
            for (let i = 0; i < inputObjects.length; i++) {
                if (!inputObjects[i].getAttribute("listener")) {
                    inputObjects[i].addEventListener("click", (event) => inputClickListener(event, pageInfo))
                    inputObjects[i].setAttribute("listener", true)
                }
            }
            for (let i = 0; i < buttonObjects.length; i++) {
                if (!isButtonOfExtension(buttonObjects[i])) { //Listener added only if the button isn't one added by the extension
                    if (!buttonObjects[i].getAttribute("listener")) {
                        buttonObjects[i].addEventListener("click", (event) => buttonClickListener(event, pageInfo))
                        buttonObjects[i].setAttribute("listener", true)
                    }
                }
            }
            for (let i = 0; i < selectObjects.length; i++) {
                if (!selectObjects[i].getAttribute("listener")) {
                    selectObjects[i].addEventListener("click", (event) => selectClickListener(event, pageInfo))
                    selectObjects[i].addEventListener("change", (event) => selectChangeListener(event))
                    selectObjects[i].setAttribute("listener", true)
                }
            }
            for (let i = 0; i < formObjects.length; i++) {
                if (!formObjects[i].getAttribute("listener")) {
                    formObjects[i].addEventListener("submit", (event) => formSubmitListener(event, i))
                    formObjects[i].setAttribute("listener", true)
                }
            }
            //Checks if achievements related to pages have been unlocked
            pageAchievements()
        })
    })
});