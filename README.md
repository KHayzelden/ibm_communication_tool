# Node.js Hello World Sample

This application demonstrates a simple, reusable Node.js web application based on the Express framework.

## Run the app locally

1. [Install Node.js][]
1. cd into this project's root directory
1. Run `npm install` to install the app's dependencies
1. Run `npm start` to start the app
1. Access the running app in a browser at <http://localhost:6001>

[Install Node.js]: https://nodejs.org/en/download/

# Progressive Web Application 
## Useful Links and Notes
- [Convert your current website into a PWA](https://www.youtube.com/watch?v=gcx-3qi7t7c)
- [Web App Manifest Generator](https://app-manifest.firebaseapp.com/) Useful for creating the manifest.json and image directories from a single uploaded image.
- Inspect the localhost:6002 and look at the *Application* tab -> Manifest to check whether the Manifest has been configured successfully
- Digital Color Meter: Press *shift + cmd + c* to extract the hexadecimal value of a colour
- Place the manifest.json in the public directory
- Place the icons directory (with multiple images of varying sizes in the public/images directory)
- Create an empty views/sw.js file in the views directory (the same directory as the index.ejs)
- Define paths for static assets within both Service Worker files (especially the one in the public/sw.js directory) 
