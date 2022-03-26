/**
 * Script launched when a page is loaded/visited
 * Draws the overlays on interacted elements/all elements or the background signaling a reported issue, depending on the current mode
 */
chrome.storage.sync.get(["overlayMode", "interactionMode"], (result) => {
    if (result.interactionMode === "interact") {
        if (result.overlayMode === "interacted") {
            drawBorderOnInteracted()
        } else if (result.overlayMode === "all") {
            drawBorderOnAll()
        }
    } else if (result.interactionMode === "signal") {
        drawBackground()
    }

})