# AI Project Generator

An AI-powered full-stack web application that automatically generates comprehensive project blueprints, structured templates, and scaffolding using **Google Gemini AI**.

---

## 🚀 Features

- **AI-Powered Generation**: Simply type a project idea (e.g., "Fitness Tracker", "AI Chatbot", "E-Commerce App"), and the AI will generate a complete blueprint in seconds.
- **Detailed Project Blueprints**: Outputs include a breakdown of difficulty, estimated time, categorized features (Must Have, Should Have, Nice to Have), and an optimal tech stack.
- **GitHub Scaffold & Code**: Provides a ready-to-use GitHub folder/file structure, a generated `README.md`, and sample starting code that you can copy with one click.
- **Your Personal Library**: Save and favorite generated projects. Browse your history natively in the app, and delete projects you no longer need.
- **Modern Architecture**: Clean separation of concerns with an MVC backend and a Service-pattern frontend.

---

## 🛠️ Tech Stack

### Frontend (React)
- **React 18** (Create React App)
- **Routing**: `react-router-dom`
- **Styling**: Vanilla CSS with modern, responsive, glassmorphism UI principles
- **Icons**: `lucide-react`
- **Network**: `axios` interacting through a dedicated API service layer

### Backend (Node.js & Express)
- **Framework**: Express.js with a modular MVC architecture (Controllers, Routes, Config)
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gen AI SDK (`@google/generative-ai`)
- **Security & Utils**: `cors`, `express-rate-limit`, `dotenv`

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js `>= 18.x`
- MongoDB (local instance or MongoDB Atlas cluster)
- A **Google Gemini API Key** (Get one from Google AI Studio)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/ai-project-generator.git
cd ai-project-generator
```

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai-project-generator
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API server will run at `http://localhost:5000`.*

### 4. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Start the frontend React server:
   ```bash
   npm start
   ```
   *The app will automatically open in your browser at `http://localhost:3000`.*

---

## 🗂️ Project Structure

```
AI-PROJECT-GENERATOR/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Business logic (Gemini, Projects)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express API endpoints
│   ├── .env              # Backend environment variables
│   └── server.js         # Entry point (rate limiting, middleware setup)
│
├── frontend/
│   ├── public/           # Static assets (Favicons, index.html)
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Navbar, ProjectResult)
│   │   ├── pages/        # Route components (Home, History, ProjectDetail)
│   │   ├── services/     # API Axios abstraction
│   │   ├── App.jsx       # Root router
│   │   └── index.css     # Global theme & glassmorphism variables
│   └── .env              # Frontend environment variables
│
└── README.md             # Project documentation
```

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add an amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License.
