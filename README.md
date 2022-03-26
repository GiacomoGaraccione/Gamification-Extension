# Gamification-Extension
 
A Google Chrome extension that aims to facilitate Graphical User Interface testing by employing gamification mechanics.

## Installation

1. Clone the repository inside a folder of your choice.
2. Follow the next two sections.

### Setting up the Server
1. If you don't have it already, install `Node.js` from https://nodejs.org/ .
2. In the folder `Gamification Extension`, run the following command from a shell: `cd server; npm install`.
3. After having completed the Node installation, run the command `node server.js`.
4. The Server is ready and already running.

### Loading the Extension on Google Chrome
1. In your Google Chrome browser, open `chrome://extensions` in a new tab.
2. Toggle `Developer Mode` on.
3. Click on `Load unpacked extension`.
4. Select the `Gamification Extension` folder.
5. A new block named `Gamification Plugin` should appear, meaning that the extension has been loaded correctly.
6. Click on the puzzle icon next to the browser bar.
7. Pin `Gamification Plugin`.
8. Click on the `G` button to open the extension homepage.

## Features
- Unlockable avatars and achievements after reaching specific milestones.
- Progress bars detailing your page coverage.
- Leaderboards showing your ranking in relation to other users.
- Highlighting of interacted elements.
- Reporting of issues and bugs found.
- The generation of scripts for the automated testing tools `SikuliX` and `Selenium`.