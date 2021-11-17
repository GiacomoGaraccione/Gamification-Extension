var recordFileButton = document.getElementById("recordFileButton");
var profileFileButton = document.getElementById("profileFileButton");
var profileButton = document.getElementById("profileButton")
var pageURL = document.getElementById("pageURL");
var pageURLButton = document.getElementById("pageURLButton");
var resetButton = document.getElementById("resetButton");
var confirmProfileButton = document.getElementById("confirmProfileButton")
var usernameField = document.getElementById("usernameField")
var greenAvatar = document.getElementById("greenAvatar")
var redAvatar = document.getElementById("redAvatar")
var blueAvatar = document.getElementById("blueAvatar")
var logoutButton = document.getElementById("logoutButton")

var url = "";
var username = ""
var selectedAvatar = ""

chrome.storage.sync.get(["profileInfo"], function (result) {
  var profileInfo = result.profileInfo
  if (profileInfo !== undefined && profileInfo !== "[]") {
    var profileInfoObj = JSON.parse(profileInfo)
    var firstWrapper = document.getElementById("firstWrapper")
    var secondWrapper = document.getElementById("secondWrapper")
    var newProfileDiv = document.getElementById("newProfileDiv")
    var uploadProfileDiv = document.getElementById("uploadProfileDiv")
    var uploadSessionDiv = document.getElementById("uploadSessionDiv")
    var resetSessionDiv = document.getElementById("resetSessionDiv")
    var urlDiv = document.getElementById("urlDiv")
    var logoutDiv = document.getElementById("logoutDiv")
    var title = document.getElementById("title")
    title.textContent = "Main Page - Welcome " + profileInfoObj.username + "!"
    secondWrapper.style.display = "none"
    firstWrapper.style.display = "flex"
    newProfileDiv.style.display = "none"
    uploadProfileDiv.style.display = "none"
    uploadSessionDiv.style.display = "flex"
    resetSessionDiv.style.display = "flex"
    urlDiv.style.display = "flex"
    logoutDiv.style.display = "flex"
  }
  recordFileButton.addEventListener("click", function () {
    var input = recordFileButton.parentElement.getElementsByTagName("input");
    input[0].addEventListener("change", function () {
      var fr = new FileReader();

      fr.onload = function () {
        chrome.storage.sync.set({ pageActions: fr.result });
      };
      fr.readAsText(this.files[0]);
    });
    $($(this).parent().find("input")).click();
  });

  pageURLButton.addEventListener("click", async () => {
    var url = document.getElementById("pageURL").value;
    var [tab] = await chrome.tabs.query({ url: url });
    var domain = new URL(url);
    var empty = [];

    chrome.storage.sync.set({ startingURL: domain.hostname });
    chrome.storage.sync.set({ visitedPages: [] });
    chrome.storage.sync.set({ pageStats: JSON.stringify(empty) });
    chrome.storage.sync.set({ newPages: [] });
    if (tab === undefined) {
      chrome.runtime.sendMessage({
        mess: "openNew",
        url: url,
      });
    } else {
      chrome.tabs.update(tab.id, { highlighted: true });
    }
  });

  resetButton.addEventListener("click", function () {
    chrome.storage.sync.set({ pageActions: JSON.stringify([]) });
  });

  profileButton.addEventListener("click", function () {
    var firstWrapper = document.getElementById("firstWrapper")
    var secondWrapper = document.getElementById("secondWrapper")
    firstWrapper.style.display = "none"
    secondWrapper.style.display = "flex"
  })

  confirmProfileButton.addEventListener("click", function () {
    if (username === "" || selectedAvatar === "") {
      alert("Error: choose a username and an avatar")
    } else {
      var profileInfo = { username: username, selectedAvatar: selectedAvatar }
      var blob = new Blob([JSON.stringify(profileInfo)], {
        type: "text/plain;charset=UTF-8",
      });
      var url = window.URL.createObjectURL(blob);
      var obj = {
        url: url,
        filename: "gamification-extension-profile-" + username + ".txt",
      };
      chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) })
      chrome.runtime.sendMessage({ obj: obj, mess: "download" });
      var firstWrapper = document.getElementById("firstWrapper")
      var secondWrapper = document.getElementById("secondWrapper")
      var newProfileDiv = document.getElementById("newProfileDiv")
      var uploadProfileDiv = document.getElementById("uploadProfileDiv")
      var uploadSessionDiv = document.getElementById("uploadSessionDiv")
      var resetSessionDiv = document.getElementById("resetSessionDiv")
      var urlDiv = document.getElementById("urlDiv")
      var logoutDiv = document.getElementById("logoutDiv")
      var title = document.getElementById("title")
      title.textContent = "Main Page - Welcome " + username + "!"
      secondWrapper.style.display = "none"
      firstWrapper.style.display = "flex"
      newProfileDiv.style.display = "none"
      uploadProfileDiv.style.display = "none"
      uploadSessionDiv.style.display = "flex"
      resetSessionDiv.style.display = "flex"
      urlDiv.style.display = "flex"
      logoutDiv.style.display = "flex"
    }

  })

  function displayConfirmButton() {
    if (username !== "" && selectedAvatar !== "") {
      var confirmButtonWrapper = document.getElementById("confirmButtonWrapper")
      confirmButtonWrapper.style.display = "flex"
    }
  }

  usernameField.addEventListener("change", function (event) {
    username = event.target.value
    displayConfirmButton()
  })

  greenAvatar.addEventListener("click", function () {
    var greenAvatarContainer = document.getElementById("greenAvatarContainer")
    greenAvatarContainer.style = "border:3px; border-style:solid; border-color:#00FF00; padding: 1em;"
    var redAvatarContainer = document.getElementById("redAvatarContainer")
    redAvatarContainer.style = "border:0; border-style:solid;"
    var blueAvatarContainer = document.getElementById("blueAvatarContainer")
    blueAvatarContainer.style = "border:0; border-style:solid;"
    selectedAvatar = "green"
    displayConfirmButton()
  })

  redAvatar.addEventListener("click", function () {
    var redAvatarContainer = document.getElementById("redAvatarContainer")
    redAvatarContainer.style = "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;"
    var greenAvatarContainer = document.getElementById("greenAvatarContainer")
    greenAvatarContainer.style = "border:0; border-style:solid;"
    var blueAvatarContainer = document.getElementById("blueAvatarContainer")
    blueAvatarContainer.style = "border:0; border-style:solid;"
    selectedAvatar = "red"
    displayConfirmButton()
  })

  blueAvatar.addEventListener("click", function () {
    var blueAvatarContainer = document.getElementById("blueAvatarContainer")
    blueAvatarContainer.style = "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;"
    var greenAvatarContainer = document.getElementById("greenAvatarContainer")
    greenAvatarContainer.style = "border:0; border-style:solid;"
    var redAvatarContainer = document.getElementById("redAvatarContainer")
    redAvatarContainer.style = "border:0; border-style:solid;"
    selectedAvatar = "blue"
    displayConfirmButton()
  })

  logoutButton.addEventListener("click", function () {
    chrome.storage.sync.set({ profileInfo: "[]" })
    var newProfileDiv = document.getElementById("newProfileDiv")
    var uploadProfileDiv = document.getElementById("uploadProfileDiv")
    var uploadSessionDiv = document.getElementById("uploadSessionDiv")
    var resetSessionDiv = document.getElementById("resetSessionDiv")
    var urlDiv = document.getElementById("urlDiv")
    var logoutDiv = document.getElementById("logoutDiv")
    var title = document.getElementById("title")
    title.textContent = "Main Page"
    newProfileDiv.style.display = "flex"
    uploadProfileDiv.style.display = "flex"
    uploadSessionDiv.style.display = "none"
    resetSessionDiv.style.display = "none"
    urlDiv.style.display = "none"
    logoutDiv.style.display = "none"
  })
})

