# Slay & Spill Media

One landing page that sends people to Book Slayers, Spill The Book, book tours and reviewer sign-ups.

## Run it on your computer

Open a terminal in this folder, then run:

    npm start

Open http://localhost:3000 in your browser. Press Ctrl+C in the terminal to stop it.

No `npm install` is needed. If you would rather not use Node, this works too:

    python3 -m http.server 8000

Then open http://localhost:8000.

You can also just double-click `index.html`. The page works that way, but running a server is closer to how it will behave once it is online.

## What is in here

- `index.html`: the whole page (styles are inside it)
- `assets/`: the pictures the page uses (copied from the two sites and resized)
  - `slay-and-spill-logo-wide.jpg`: the main logo (cropped wider)
  - `book-slayers-podcast-wide.jpg`: the picture link to Book Slayers (cropped wider)
  - `spill-the-book-black.jpg`: the picture link to Spill The Book
  - Every other image in this folder is left over from earlier versions. The page does not use them, so they are safe to delete.
- `server.js` and `package.json`: the local server (not needed when the site goes online)

## Putting it online

Upload `index.html` and the `assets` folder to your host (GitHub Pages, Netlify or Vercel). `server.js`, `package.json` and this README do not need to be uploaded.
