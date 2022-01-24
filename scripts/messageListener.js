function createCanvas(canvasWidth, canvasHeight) {
    let canvas = document.createElement("canvas");

    // size of canvas in pixels
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    return canvas;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.name === "stream" && request.streamId) {
        let track, canvas
        navigator.mediaDevices.getUserMedia({
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: request.streamId
                },
            }
        }).then((stream) => {
            track = stream.getVideoTracks()[0]
            const imageCapture = new ImageCapture(track)
            return imageCapture.grabFrame()
        }).then((bitmap) => {
            track.stop()
            canvas = document.createElement('canvas');
            canvas.width = bitmap.width; //if not set, the width will default to 200px
            canvas.height = bitmap.height;//if not set, the height will default to 200px
            let context = canvas.getContext('2d');
            context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)
            return canvas.toDataURL();
        }).then((url) => {
            chrome.storage.sync.get(["currentURL", "profileInfo"], function (result) {
                let profileInfo = JSON.parse(result.profileInfo)
                let canvas = createCanvas(request.coords.width, request.coords.height);
                let context = canvas.getContext('2d');
                let croppedImage = new Image();
                croppedImage.onload = function () {
                    // cropping
                    // parameter 1: source image (screenshot)
                    // parameter 2: source image x coordinate
                    // parameter 3: source image y coordinate
                    // parameter 4: source image width
                    // parameter 5: source image height
                    // parameter 6: destination x coordinate
                    // parameter 7: destination y coordinate
                    // parameter 8: destination width
                    // parameter 9: destination height
                    context.drawImage(croppedImage, request.coords.x, request.coords.y, request.coords.width, request.coords.height, 0, 0, request.coords.width, request.coords.height);

                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        body: "/pages/crops/" + profileInfo.username,
                        content: { widgetType: request.widgetType, imageUrl: canvas.toDataURL(), widgetId: request.widgetId, textContent: request.textContent, selectIndex: request.selectIndex },
                        method: "post"
                    }, () => console.log("AAAAAA"))
                };
                croppedImage.src = url; // screenshot (full image)
            })

        })
    }
})