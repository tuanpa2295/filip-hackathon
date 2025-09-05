# Frontend App - Vite + React + TypeScript

This project is a modern React frontend bootstrapped with [Vite](https://vitejs.dev/) and TypeScript. It is managed with [Yarn](https://yarnpkg.com/) and targets Node.js 20+ environments.

## 📦 Requirements

- [Node.js](https://nodejs.org/en/) >= 20
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

## 🚀 Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/duongtq-fpt/reform-hackaithon
cd filip-webapp
```

### 2. Install dependencies

```bash
yarn install
```

## 💻 Development

To start the Vite development server:

```bash
yarn dev
```

This will launch the app at [http://localhost:5173](http://localhost:5173) by default.

## 🛠 Available Commands

| Task               | Command        |
| ------------------ | -------------- |
| Start dev server   | `yarn dev`     |
| Build for prod     | `yarn build`   |
| Preview prod build | `yarn preview` |
| Run linter         | `yarn lint`    |
| Run tests          | `yarn test`    |

> Customize or extend these commands in `package.json` as needed.

## 🗂 Project Structure

```
.
├── public/            # Static assets
├── src/               # Source code
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable UI components
│   ├── pages/         # App routes (if using routing)
│   ├── App.tsx        # Main component
│   └── main.tsx       # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🌐 Environment Variables

You can define environment-specific settings in a `.env` file at the root.

Example `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

> Environment variables must start with `VITE_` to be exposed to your app.

## 📦 Production Build

To create an optimized production build:

```bash
yarn build
```

To preview the production build locally:

```bash
yarn preview
```
