/**
 * Script that adds the star-shaped easter egg when a user visits a page for the first time
 */
chrome.storage.sync.get(["currentURL", "profileInfo"], (result) => {
    let profileInfo = JSON.parse(result.profileInfo)
    chrome.runtime.sendMessage({
        //Fetches information about actions performed by the user on the current page
        mess: "fetch",
        method: "get",
        body: "/pages/actions/" + profileInfo.username,
        content: { url: result.currentURL }
    }, (response) => {
        let pageInfo = response.data
        //A page is considered new if no actions have been performed on it yet
        if (pageInfo.length === 0) {
            let found = document.getElementById("gamificationExtensionNewPageStar");
            if (found === null) {
                //Adds the star element to the page's HTML document, in case it hasn't already been added before (i.e. changing tab and then returning to the original page)
                let div = document.createElement("img");
                document.body.appendChild(div);
                div.id = "gamificationExtensionNewPageStar";
                div.width = 30;
                div.height = 20;
                div.src = chrome.runtime.getURL("img/star.png");
                div.style = "position: fixed; bottom: 10%;  right: 0;width: 30px;border: 3px solid #FFD700;";
            }
        }
    })
});