# HANU-YOUTH Backend

FastAPI backend for the HANU-YOUTH platform - Advanced AI platform empowering global youth through knowledge, innovation, and community unification.

## Features

### 🎮 Advanced Gamification
- **XP & Leveling System**: Users earn XP and level up with progress tracking
- **Daily Streaks**: Consistency rewards with increasing bonuses
- **Achievement System**: Unlockable badges with different rarities
- **Virtual Economy**: Coins and gems for in-app purchases
- **Power-ups**: Temporary boosts and advantages
- **Daily Challenges**: Fresh challenges every day with rewards

### 📚 Quiz & Learning System
- **AI-Generated Quizzes**: Dynamic quiz creation from any topic
- **Adaptive Learning**: Personalized learning paths
- **Multiple Question Types**: MCQ, True/False, Short Answer, Code
- **Progress Tracking**: Detailed analytics and progress reports
- **Learning Modules**: Structured content with different formats

### 👥 Teams & Competitions
- **Team Creation**: Form teams with friends or join existing ones
- **Competitions**: Hackathons, quizzes, and innovation challenges
- **Leaderboards**: Global and country-specific rankings
- **Team Achievements**: Collaborative goals and rewards

### 🔍 Knowledge & Search
- **AI-Powered Search**: Semantic search across knowledge bases
- **Research Hub**: Upload, summarize, and analyze research papers
- **Event Discovery**: UN events, MUNs, hackathons, and conferences
- **Content Recommendations**: Personalized content suggestions

### 🤖 AI Services
- **Quiz Generation**: Create quizzes from any topic
- **Answer Evaluation**: AI-powered answer checking
- **Translation**: Multilingual support
- **Fact Checking**: Verify information credibility
- **Idea Generation**: Innovation suggestions from materials
- **Voice Services**: Text-to-speech and speech-to-text

## Technology Stack

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **AI Services**: HANU AI SDK, OpenAI, HuggingFace
- **Cache**: Redis
- **File Storage**: Local filesystem (configurable for cloud storage)

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- PostgreSQL 12+
- Redis 6+
- Node.js 16+ (for frontend)

### 2. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd hanu-youth/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Install PostgreSQL and create database
createdb hanu_youth_db

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/hanu_youth_db
```

### 4. Run Migrations
```bash
# Create database tables
python -c "from app.core.database import create_tables; create_tables()"
```

### 5. Start Redis
```bash
# Start Redis server
redis-server
```

### 6. Run the Backend
```bash
# Start the FastAPI server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using the provided script
python main.py
```

### 7. Access API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user info

### Gamification
- `POST /api/v1/gamification/add-xp` - Add XP to user
- `GET /api/v1/gamification/achievements` - Get user achievements
- `GET /api/v1/gamification/power-ups` - Get available power-ups
- `POST /api/v1/gamification/use-power-up/{id}` - Use a power-up
- `GET /api/v1/gamification/daily-challenges` - Get daily challenges
- `POST /api/v1/gamification/update-daily-streak` - Update daily streak

### Quiz & Learning
- `GET /api/v1/quiz/quizzes` - Get available quizzes
- `POST /api/v1/quiz/{id}/start` - Start a quiz
- `POST /api/v1/quiz/{attempt_id}/submit-answer` - Submit quiz answer
- `POST /api/v1/quiz/{attempt_id}/complete` - Complete quiz
- `GET /api/v1/quiz/learning-paths` - Get learning paths

### Teams & Competitions
- `POST /api/v1/teams` - Create a team
- `GET /api/v1/teams` - Get available teams
- `POST /api/v1/teams/{id}/join` - Join a team
- `GET /api/v1/competitions` - Get competitions
- `POST /api/v1/competitions/{id}/register` - Register for competition
- `GET /api/v1/leaderboards` - Get leaderboards

### Search & Knowledge
- `POST /api/v1/search/search` - Search knowledge base
- `POST /api/v1/search/research/summarize` - Summarize research
- `POST /api/v1/search/research/upload` - Upload research paper
- `GET /api/v1/search/events/upcoming` - Get upcoming events

### AI Services
- `POST /api/v1/ai/generate-quiz` - Generate quiz
- `POST /api/v1/ai/evaluate-quiz` - Evaluate quiz answers
- `POST /api/v1/ai/translate` - Translate text
- `POST /api/v1/ai/fact-check` - Fact check text
- `POST /api/v1/ai/generate-idea` - Generate innovation ideas

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `achievements` - Achievement definitions
- `user_achievements` - User's unlocked achievements
- `levels` - Level definitions and rewards
- `power_ups` - Power-up definitions
- `user_power_ups` - User's power-up usage tracking
- `daily_challenges` - Daily challenge definitions
- `user_daily_challenges` - User's challenge progress

### Quiz & Learning
- `quizzes` - Quiz definitions
- `questions` - Quiz questions
- `quiz_attempts` - User quiz attempts
- `user_answers` - User's quiz answers
- `learning_paths` - Learning path definitions
- `learning_modules` - Learning module content
- `user_path_progress` - User's learning path progress
- `user_module_progress` - User's module progress

### Teams & Competitions
- `teams` - Team definitions
- `team_members` - Team memberships
- `competitions` - Competition definitions
- `competition_participants` - Individual participants
- `team_competitions` - Team competition entries
- `team_achievements` - Team achievements
- `leaderboards` - Leaderboard definitions
- `leaderboard_entries` - Leaderboard rankings

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest tests/
```

### Code Quality
```bash
# Install linting tools
pip install black flake8 mypy

# Format code
black app/

# Lint code
flake8 app/

# Type check
mypy app/
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `True` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT secret key | Required |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `HUGGINGFACE_API_KEY` | HuggingFace API key | Optional |

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting (to be implemented)
- Input validation
- SQL injection prevention

## Performance Features

- Database connection pooling
- Redis caching
- Async request handling
- Optimized database queries
- Pagination support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**HANU-YOUTH** - Empowering Global Youth by uniting knowledge, innovation, and communities into one hub.