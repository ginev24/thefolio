# Chess Unlocked — React App

Migrated from vanilla HTML/CSS/JS to React (CRA multi-file structure)
following the CSAE 104 Migration Guide.

## Project Structure

```
chess-unlocked/
├── public/
│   └── index.html              ← The only HTML file. React mounts here.
├── src/
│   ├── index.js                ← Entry point. Connects React to index.html.
│   ├── index.css               ← Global stylesheet (Option A, Guide Step 5).
│   ├── App.js                  ← Root component. BrowserRouter + all Routes.
│   ├── components/
│   │   ├── Nav.js              ← Shared header/nav (Link, useLocation, theme).
│   │   ├── Footer.js           ← Shared footer.
│   │   └── ChessQuiz.js        ← Interactive quiz (useState, .map()).
│   ├── pages/
│   │   ├── SplashPage.js       ← Loading screen (useEffect, useNavigate).
│   │   ├── HomePage.js         ← Home (.map() for list).
│   │   ├── AboutPage.js        ← About + quiz (component composition).
│   │   ├── ContactPage.js      ← Contact form (useState, validation).
│   │   ├── RegisterPage.js     ← Register form (useState, complex validation).
│   │   └── NotFoundPage.js     ← 404 catch-all page.
│   └── data/
│       ├── quizData.js         ← 10 quiz questions.
│       └── resourcesData.js    ← Chess resources table data.
└── package.json
```

## Setup

```bash
npm install
npm start      # → http://localhost:3000
npm run build  # production build
```

## Adding Your Images

Place your `pics/` folder inside `public/`:
```
public/
  pics/
    hello.jpg
    hello1.jpg
    hello2.jpg   ... etc.
    hello9.jpg   (logo)
    hello10.jpg  (header background)
    he.jpg       (quiz background)
    hello8.jpg   (home card background)
    hello5.jpg   (form card background)
```

## React Concepts Used (per migration guide)

| Step | Concept | Where |
|------|---------|-------|
| 1 | CRA scaffold | package.json, src/index.js |
| 2 | JSX components | All files in src/pages/ |
| 3 | React Router — BrowserRouter, Routes, Link, useNavigate, useLocation | App.js, Nav.js, SplashPage.js |
| 4 | useState — controlled forms, validation, conditional rendering | ContactPage.js, RegisterPage.js, ChessQuiz.js |
| 5 | Global CSS (Option A) | index.css imported in index.js |
| 6 | .map() + data files + key prop | All pages, src/data/ |
| Bonus | 404 catch-all route | NotFoundPage.js, App.js |
