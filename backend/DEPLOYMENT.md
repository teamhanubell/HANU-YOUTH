# HANU-YOUTH API Deployment Guide

This guide provides instructions for deploying the HANU-YOUTH lightweight APIs on free/low-cost platforms.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+ (for frontend)
- Git
- Free cloud platform account (Render, Railway, Vercel, etc.)

### Platform Options

| Platform | Backend | Frontend | Database | Cost | Features |
|----------|---------|----------|----------|------|----------|
| **Render** | ✅ | ✅ | ✅ | Free tier available | Easy deployment, auto-scaling |
| **Railway** | ✅ | ✅ | ✅ | Free tier available | Git-based deployment, preview environments |
| **Vercel** | ❌ | ✅ | ❌ | Free tier available | Best for Next.js frontend |
| **Netlify** | ❌ | ✅ | ❌ | Free tier available | Static site hosting, serverless functions |
| **Heroku** | ✅ | ✅ | ❌ | Free tier discontinued | Legacy option, not recommended |

## 🛠️ Deployment Setup

### Option 1: Render (Recommended)

#### Backend Deployment

1. **Create Render Account**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

2. **Prepare Backend**
   ```bash
   cd backend
   # Create requirements.txt with all dependencies
   pip freeze > requirements.txt
   ```

3. **Create `render.yaml`**
   ```yaml
   services:
     - type: web
       name: hanu-youth-api
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: DATABASE_URL
           value: sqlite:///./hanu_youth.db
         - key: SECRET_KEY
           generateValue: true
         - key: PYTHON_VERSION
           value: 3.9.0
   ```

4. **Deploy**
   - Push to GitHub
   - Create new Web Service on Render
   - Connect your repository
   - Render will auto-detect and deploy

#### Frontend Deployment

1. **Build Frontend**
   ```bash
   cd ..
   npm run build
   ```

2. **Create Static Site on Render**
   - Create new Static Site service
   - Point to `out` directory (for Next.js export)
   - Set environment variables if needed

### Option 2: Railway

#### Backend Deployment

1. **Create Railway Account**
   - Sign up at [railway.app](https://railway.app)
   - Install Railway CLI: `npm install -g @railway/cli`

2. **Initialize Project**
   ```bash
   cd backend
   railway login
   railway init
   ```

3. **Configure Environment**
   ```bash
   railway variables
   # Set:
   # DATABASE_URL=sqlite:///./hanu_youth.db
   # SECRET_KEY=your-secret-key-here
   # PYTHON_VERSION=3.9.0
   ```

4. **Deploy**
   ```bash
   railway up
   ```

#### Frontend Deployment

1. **Create Separate Project**
   ```bash
   cd ..
   railway init --name hanu-youth-frontend
   ```

2. **Configure Build**
   ```bash
   railway variables
   # Set:
   # NODE_VERSION=18
   # BUILD_COMMAND=npm run build
   # PUBLISH_DIR=out
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Option 3: Vercel (Frontend Only)

1. **Create Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`

2. **Deploy Frontend**
   ```bash
   vercel
   # Follow prompts
   # Set environment variables in Vercel dashboard
   ```

3. **Backend on Render/Railway**
   - Deploy backend separately on Render or Railway
   - Update API endpoints in frontend to point to backend URL

## 📋 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./hanu_youth.db` |
| `SECRET_KEY` | JWT secret key | `your-super-secret-key` |
| `PYTHON_VERSION` | Python version | `3.9.0` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Debug mode | `True` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token expiry | `30` |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | JWT refresh token expiry | `10080` |
| `MAX_FILE_SIZE` | Max upload size | `10485760` |
| `OPENAI_API_KEY` | OpenAI API key | `None` |
| `HUGGINGFACE_API_KEY` | HuggingFace API key | `None` |

## 🔧 Configuration Files

### `requirements.txt` (Backend)
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.2
aiosqlite==0.19.0
```

### `Dockerfile` (Optional)
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `.env.example`
```env
# Database
DATABASE_URL=sqlite:///./hanu_youth.db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080

# Debug
DEBUG=True

# AI Services (Optional)
OPENAI_API_KEY=your-openai-key
HUGGINGFACE_API_KEY=your-huggingface-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - Logout user

### Chatbot
- `POST /api/v1/chatbot/chat` - Send message to chatbot
- `GET /api/v1/chatbot/conversations` - Get conversation history
- `GET /api/v1/chatbot/conversations/{id}` - Get specific conversation
- `DELETE /api/v1/chatbot/conversations/{id}` - Delete conversation
- `POST /api/v1/chatbot/voice` - Voice-based chat

### Voice Services
- `POST /api/v1/voice/speech-to-text` - Convert speech to text
- `POST /api/v1/voice/text-to-speech` - Convert text to speech
- `POST /api/v1/voice/modulate-voice` - Apply voice effects
- `GET /api/v1/voice/voices` - Get available voices
- `GET /api/v1/voice/audio/{file_id}` - Serve audio files

### Database Services
- `GET /api/v1/database/user-data/profile` - Get user profile
- `PUT /api/v1/database/user-data/profile` - Update user profile
- `GET /api/v1/database/user-data/stats` - Get user statistics
- `GET /api/v1/database/leaderboard` - Get leaderboard
- `GET /api/v1/database/research` - Get research items
- `GET /api/v1/database/research/{id}` - Get specific research
- `POST /api/v1/database/research/{id}/bookmark` - Bookmark research
- `GET /api/v1/database/user-data/research-activity` - Get research activity

## 📊 Monitoring & Logging

### Health Check
- `GET /health` - Basic health check
- `GET /api/v1/health` - Detailed health check

### Logging Setup
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Monitoring Services
- **Render**: Built-in metrics and logs
- **Railway**: Built-in metrics and logs
- **External**: Consider Sentry for error tracking

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to version control
   - Use platform-specific secret management
   - Rotate keys periodically

2. **CORS Configuration**
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-domain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Rate Limiting**
   ```python
   from slowapi import Limiter
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   
   @app.get("/api/v1/chatbot/chat")
   @limiter.limit("100/minute")
   async def chat_endpoint():
       pass
   ```

4. **Input Validation**
   - Use Pydantic models for all input
   - Validate file types and sizes
   - Sanitize user inputs

## 🚀 Performance Optimization

1. **Database Optimization**
   - Use connection pooling
   - Add proper indexes
   - Consider Redis for caching

2. **API Optimization**
   - Implement pagination
   - Use async/await
   - Add response caching

3. **File Upload Optimization**
   - Use cloud storage (AWS S3, Cloudinary)
   - Implement file compression
   - Add virus scanning

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database URL format
   # SQLite: sqlite:///./database.db
   # PostgreSQL: postgresql://user:pass@host:port/db
   ```

2. **JWT Token Issues**
   - Verify SECRET_KEY is set
   - Check token expiration
   - Ensure proper token type (access vs refresh)

3. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure proper MIME type handling

4. **CORS Issues**
   - Verify frontend URL in CORS settings
   - Check for proper headers
   - Ensure HTTPS in production

### Debug Commands

```bash
# Check logs
railway logs
render logs

# Check environment variables
railway variables
render env

# Restart service
railway restart
render restart
```

## 📈 Scaling

### Vertical Scaling
- Upgrade to paid plans for more resources
- Add more CPU/RAM as needed

### Horizontal Scaling
- Use load balancers
- Deploy multiple instances
- Use container orchestration

### Database Scaling
- Migrate from SQLite to PostgreSQL
- Add read replicas
- Implement database sharding

## 🔄 Updates & Maintenance

### Automated Updates
- Set up GitHub Actions for CI/CD
- Use webhooks for automatic deployments
- Implement health checks for zero-downtime deployments

### Backup Strategy
- Regular database backups
- File storage backups
- Configuration backups

### Monitoring Setup
- Set up alerting for errors
- Monitor performance metrics
- Track user activity and API usage

---

## 📞 Support

For deployment issues:
1. Check platform documentation
2. Review logs and error messages
3. Test locally first
4. Contact platform support if needed

For API issues:
1. Review API documentation
2. Check authentication headers
3. Verify request format
4. Test with curl or Postman