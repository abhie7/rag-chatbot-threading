# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

```
npm install axios react-router-dom  @radix-ui @radix-ui/react-slot lucide-react react-markdown react-avatar
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -P
npx shadcn@latest init
npx shadcn@latest add button input avatar select dropdown-menu tooltip
```

```
so please understand my usecase and provide me with a proper database structure and further code. i want to use mongodb compass for this

First create a login/register page, each user will have a different session, create a users.collection for this (give appropriate name)

Statement: the user will select or upload a file:

1. upload:
- if the user wants to upload a file, they can upload a docx, doc, pdf or txt file.
- will extract that text and send it to the backend server (flask)
- backend server will divide the processes into 2 main threads:
- the thread 1 will convert the text into vector embeddings and store them in a vectorDB which will be identified using a hash, so every uploaded file will have a different hash and a vectorDB.
- the thread 2 will take the embedding array from the RAM from the thread 1 and will start performing RAG (retrieval augmented generation) and will summarize the embeddings based on my prompts. till then show a loading sign.
- i want everything to be dynamic and want to save everything inside a mongo database - collection for users.collection consisting of their login info, etc. each user will have a uuid - user_uuid, and in the users.collection, each user will have a vectorDB_uuid which will link to their very own vectorDB_uuid.collection where each object will consist of their files' data - filename, vectorDB_hash, user_uuid, summary, past_summaries, chat_history, etc.

2. select:
- the user can select already uploaded files and get the data instantly from mongo db collection.

can you please suggest what am i missing? also please optimize my approach and improve my pipelines.
```

```
before providing me with the flask backend implementation, please provide me with these things first:

- please load the login form first, write the entire code, just comment out the mongo interactions for now since i dont have a database yet. so if i type anything, it should login.

- please add A sidebar that collapses to icons from shadcn with  my current features and also the complete features that are required in a saas and in my use case, like the user profile, logout, select files, etc. you know what to do, right?

- also know that i dont want a separate vector_stores_uuid.collection since i will be using faiss for that and those stores will be stored in the backend.
```
---

please understand my usecase and provide me with a proper database structure and further code. i want to use mongodb compass for this project.  i am using shadcn/ui, react jsx vite. 
First please fix my login/register page, each user will have a different session, add proper authentication and close the connection every single time. also add a random avatar image for every user from shad cn. here is my file structure and i will be providing you with some of my code:

```
.
├── components.json
├── eslint.config.js
├── index.html
├── jsconfig.json
├── MONGO_STRUCTURE.md
├── package.json
├── package-lock.json
├── postcss.config.js
├── public
│   └── vite.svg
├── README.md
├── src
│   ├── App.jsx
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── auth
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── ChatView.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Instructions.jsx
│   │   ├── ModeToggle.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SummarizeView.jsx
│   │   ├── ThemeProvider.jsx
│   │   └── ui
│   │       ├── alert.jsx
│   │       ├── avatar.jsx
│   │       ├── button.jsx
│   │       ├── dropdown-menu.jsx
│   │       ├── input.jsx
│   │       ├── select.jsx
│   │       ├── separator.jsx
│   │       ├── sheet.jsx
│   │       ├── sidebar.jsx
│   │       ├── skeleton.jsx
│   │       └── tooltip.jsx
│   ├── hooks
│   │   └── use-mobile.jsx
│   ├── index.css
│   ├── lib
│   │   ├── db.js
│   │   └── utils.js
│   ├── main.jsx
│   └── models
│       ├── Document.js
│       └── User.js
├── tailwind.config.js
└── vite.config.js

10 directories, 41 files
```