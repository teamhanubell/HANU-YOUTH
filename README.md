# 🎮 HANU-YOUTH Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13.4+-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A revolutionary gamified learning platform for global youth, powered by Human-AI for Nexus Unification. Empowering the next generation through AI-driven education, innovation, and collaboration.

## 🌟 Features

### 🎮 Advanced Gamification
- **Streak System** – Daily/weekly learning streaks with rewards and boosts
- **XP & Levels** – Progress tracking with unlockable features and themes
- **Mini-Games** – Interactive puzzles for CS, AI, and UN topics
- **Boss Battles** – Collaborative challenges for global problem-solving
- **Team Competitions** – Squad-based hackathons and innovation labs
- **Survival Mode** – Timed challenges with increasing difficulty
- **Treasure Hunts** – Knowledge-based riddles and hidden content
- **Achievement System** – Badges and titles for accomplishments
- **Virtual Economy** – Coins and gems for avatar customization
- **Power-Ups** – Performance boosts for quizzes and challenges
- **Global Missions** – Time-limited collaborative events
- **Story Mode** – Gamified learning journeys and skill paths
- **PvP Battles** – Real-time competitive quizzes
- **Daily Challenges** – Surprise tasks with bonus rewards
- **AI Rival** – Intelligent bot competitor for extra engagement

### 🧠 AI-Powered Learning
- **Quiz Generation** – Dynamic quiz creation from any topic
- **Answer Evaluation** – Automated assessment of responses
- **Adaptive Learning** – Difficulty adjustment based on performance
- **Research Summarization** – AI-powered document analysis
- **Semantic Search** – Intelligent content discovery
- **Voice Assistant** – Multilingual TTS and translation
- **Fact-Checking** – Misinformation detection and validation
- **Idea Generation** – Innovation assistance and feasibility checks

### 🌍 Global Collaboration
- **Knowledge Nexus** – Research papers, UN reports, and innovation resources
- **Global Awareness** – Real-time UN/MUN agendas and world events
- **Team Formation** – Squad creation for collaborative projects
- **Leaderboards** – Global and national ranking systems
- **UN Verification** – UNESCO-aligned certification system

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hanu-youth-platform.git
   cd hanu-youth-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Update the environment variables in .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.**

## 🛠 Development

- **Linting**: `npm run lint`
- **Type Checking**: `npm run type-check`
- **Build**: `npm run build`
- **Start Production Server**: `npm start`

## 🚀 Technology Stack

### 🎯 Core Framework
- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development
- **🐍 FastAPI** - Modern Python backend framework for AI services

### 🧠 AI & Machine Learning
- **🤖 HANU AI SDK** - Custom AI integration for educational content
- **🧠 OpenAI API** - Advanced language models for content generation
- **🔍 HuggingFace Transformers** - State-of-the-art NLP models
- **🎙️ Whisper** - Speech recognition and synthesis

### 🗄️ Database & Backend
- **🗄️ PostgreSQL** - Robust relational database
- **🔧 Prisma ORM** - Type-safe database operations
- **🔐 JWT Authentication** - Secure user authentication
- **🌐 RESTful APIs** - Clean and scalable API design

### 🎮 Gamification Engine
- **🏆 Achievement System** - Badge and reward tracking
- **📊 Leaderboards** - Global and competitive rankings
- **💰 Virtual Economy** - Coins, gems, and power-ups
- **🎯 Progress Tracking** - XP, levels, and skill development

### 🌍 Real-time Features
- **⚡ WebSocket** - Real-time multiplayer and live updates
- **🔔 Push Notifications** - Instant alerts and updates
- **💬 Live Chat** - Real-time communication and collaboration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev

# Start backend server (in another terminal)
cd backend && uvicorn main:app --reload

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the HANU-YOUTH platform running.

## 🎮 Platform Mission

HANU-YOUTH (Human-AI for Nexus Unification) is dedicated to empowering global youth through:

- **🌍 Global Citizenship** - Understanding UN frameworks and international cooperation
- **🧠 AI Literacy** - Developing skills for the AI-driven future
- **🔬 Innovation** - Fostering creativity and problem-solving abilities
- **🤝 Collaboration** - Building international connections and teamwork
- **📚 Lifelong Learning** - Cultivating curiosity and continuous growth

## 🏆 UNESCO Compliance

This platform is designed to be UNESCO Media and Information Literacy (MIL) compliant, promoting:

- Critical thinking and information evaluation
- Digital citizenship and online safety
- Intercultural understanding and dialogue
- Access to information and knowledge sharing
- Ethical use of technology and AI

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── gamification/      # Gamification features
│   ├── quiz/              # Quiz and learning features
│   └── teams/             # Team collaboration features
├── public/                # Static files
│   ├── images/           # Image assets
│   └── fonts/            # Custom fonts
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── GamificationDashboard.tsx
│   ├── QuizSystem.tsx
│   └── SearchResults.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── db.ts             # Database connection
│   ├── socket.ts         # WebSocket setup
│   └── utils.ts          # Utility functions
└── ...

backend/
├── app/
│   ├── api/v1/           # FastAPI endpoints
│   │   ├── endpoints/    # Feature-specific endpoints
│   │   ├── models/       # Database models
│   │   └── services/     # Business logic
│   └── core/             # Core configuration
└── main.py              # FastAPI application entry point
```

## 🎮 Available Features

### 🏆 Gamification System
- **User Profiles** - Customizable avatars and progress tracking
- **Achievement Badges** - Collectible rewards for accomplishments
- **Leaderboards** - Global and competitive rankings
- **Daily Challenges** - Fresh tasks with bonus rewards
- **Power-Ups** - Temporary performance boosts
- **Virtual Currency** - Coins and gems for customization

### 🧠 AI-Powered Learning
- **Dynamic Quiz Generation** - AI-created quizzes from any topic
- **Adaptive Difficulty** - Personalized learning paths
- **Voice Assistant** - Multilingual support and TTS
- **Research Analysis** - Document summarization and fact-checking
- **Idea Generation** - Innovation assistance and feasibility checks

### 🌍 Global Features
- **Knowledge Nexus** - Search research papers and UN reports
- **Global Events** - Real-time UN/MUN agendas
- **Team Collaboration** - Squad formation and projects
- **UN Verification** - UNESCO-aligned certifications
- **Real-time Communication** - Live chat and notifications

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Reporting Issues

Found a bug? Please [open an issue](https://github.com/your-username/hanu-youth-platform/issues) and include steps to reproduce it.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn how to style your app with Tailwind.
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - Modern Python web framework for building APIs.

---

Made with ❤️ by HANU Team for the global youth community. Empowered by HANU-YOUTH 🌍🎮
