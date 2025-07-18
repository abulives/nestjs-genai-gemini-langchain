
# 🚀 Build a simple LLM application using NestJS, Langchain and gemini

This is a Dockerized Node.js application built using the [NestJS](https://nestjs.com/) framework.

## 📁 Folder Structure

```
/app
│
├── src/              # Application source code
│   ├── app.module.ts # Main app module
│   ├── main.ts       # Entry point
│   └── modules/      # Feature modules (routes, services, controllers)
│
├── dist/             # Compiled output (after build)
├── node_modules/     # Node.js dependencies
│
├── .dockerignore     # Files to ignore in Docker builds
├── .env              # Environment variables (do not commit)
├── Dockerfile        # Dockerfile for containerization
├── package.json      # NPM dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── README.md         # Project documentation
└── nest-cli.json     # Nest CLI configuration
```

---

## ⚙️ Features

- NestJS modular web framework (TypeScript)
- Docker support for easy deployment
- Environment variable support via `.env`
- Scalable controller & service layers
- Structured code with dependency injection

---

## 🧪 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Create `.env` File

```env
PORT=3000
GOOGLE_API_KEY=your-gemini-api-key
```

### 3. Run Locally (Development Mode)

```bash
npm run start:dev
```

Or build and run:

```bash
npm run build
node dist/main.js
```

---

## 🐳 Docker Instructions

### ✅ Build Docker Image

```bash
docker build -t my-nest-app .
```

### ▶️ Run Docker Container

```bash
docker run -p 3000:3000 --env-file .env my-nest-app
```

---

## 🪪 License

This project is licensed under the MIT License.
