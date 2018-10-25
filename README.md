# JodelJS

Unofficial web app for [Jodel](https://jodel-app.com/). The app runs completely client-side in the user’s browser. Supports creating new accounts, reading posts and posting text/images.
The account information is stored in the browser’s localStorage.

<img src="https://github.com/AsamK/JodelJS/blob/master/screenshot.png" width="200" alt="DesktopJodel Screenshot">

Before building the app, create your own `settings.ts` file in `src/app/` by copying `settings.sample.ts`.

Build app:

    npm install
    npm run build

Copy the files in `dist/` to your webspace and open index.html in your browser.

## Develop
After first clone and after updating:

    npm install

Start watcher to compile ts and run dev webserver:

    npm start

## License

Copyright: AsamK 2016-2018

Licensed under the GPLv3: http://www.gnu.org/licenses/gpl-3.0.html
