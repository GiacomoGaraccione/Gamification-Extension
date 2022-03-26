/**
 * Script that adds the progress bar to the page's HTML document
 */
chrome.storage.sync.get(["currentURL", "profileInfo"], (result) => {
    let profileInfo = JSON.parse(result.profileInfo)

    function filterURL(event) {
        return event.url === result.currentURL
    }
    chrome.runtime.sendMessage({
        //Fetching records about the current page
        mess: "fetch",
        method: "get",
        body: "/pages/records/" + profileInfo.username,
        content: { url: result.currentURL }
    }, (response) => {
        let progress = response.data.filter(filterURL).length > 0 ? response.data.filter(filterURL)[0].coverage : 0
        chrome.runtime.sendMessage({
            //Fetching info about the current page to know whether there are widgets or not in the page
            mess: "fetch",
            method: "get",
            body: "/pages",
            content: { url: result.currentURL }
        }, (response2) => {
            //Total count of widgets in the page
            //In case there are no widgets in the page a message is shown
            let denom = (response2.data[0].totalLinkObjects + response2.data[0].totalInputObjects + response2.data[0].totalButtonObjects + response2.data[0].totalSelectObjects) !== 0
            let topnav = document.createElement("div");
            topnav.id = "gamificationExtensionTopnav";
            let found = document.getElementById("gamificationExtensionTopnav");
            if (found === null) {
                document.body.appendChild(topnav);
                topnav.style = "background-color: transparent;position: fixed;bottom: 10;width: 100%;";
                let outerDiv = document.createElement("div");
                outerDiv.id = "gamificationExtensionTopnavOuter";
                outerDiv.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                topnav.appendChild(outerDiv);
                let innerDiv = document.createElement("div");
                innerDiv.id = "gamificationExtensionTopnavInner";
                innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                innerDiv.textContent = denom ? "Progress: " + progress.toFixed(2) + "%" : "There are no widgets in this page";
                outerDiv.appendChild(innerDiv);
            }
        })
    })
});