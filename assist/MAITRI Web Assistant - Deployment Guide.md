# MAITRI Web Assistant - Deployment Guide

## Overview

The MAITRI Web Assistant is a production-ready web application designed to monitor astronauts' emotional and mental well-being using real-time webcam and microphone data. This guide provides comprehensive instructions for deploying and running the application.

## System Requirements

### Minimum Requirements
- **Operating System**: Ubuntu 20.04+ or similar Linux distribution
- **Python**: 3.11 or higher
- **Node.js**: 18.0 or higher
- **Memory**: 2GB RAM minimum, 4GB recommended
- **Storage**: 1GB free space
- **Network**: Internet connection for initial setup

### Browser Requirements
- **Chrome**: Version 90+ (recommended)
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

**Note**: WebRTC features require HTTPS in production environments.

## Project Structure

```
maitri-web-assistant/
├── maitri-backend/           # Flask backend application
│   ├── src/
│   │   ├── main.py          # Main Flask application
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── static/          # Built frontend files
│   │   └── database/        # SQLite database
│   ├── venv/                # Python virtual environment
│   └── requirements.txt     # Python dependencies
├── maitri-web-assistant/     # React frontend (development)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── App.jsx         # Main application
│   ├── dist/               # Built frontend files
│   └── package.json        # Node.js dependencies
└── docs/                   # Documentation
```

## Quick Start (Local Development)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd maitri-backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python src/main.py
```

The backend will be available at `http://localhost:5000`

### 2. Frontend Setup (Development Mode)

```bash
# Navigate to frontend directory
cd maitri-web-assistant

# Install dependencies
pnpm install

# Start development server
pnpm run dev --host
```

The frontend will be available at `http://localhost:5173`

## Production Deployment

### Option 1: Integrated Deployment (Recommended)

The Flask backend serves the built React frontend as static files.

```bash
# 1. Build the frontend
cd maitri-web-assistant
pnpm run build

# 2. Copy built files to Flask static directory
cp -r dist/* ../maitri-backend/src/static/

# 3. Start the Flask server
cd ../maitri-backend
source venv/bin/activate
python src/main.py
```

Access the application at `http://localhost:5000`

### Option 2: Docker Deployment

Create a `Dockerfile` in the project root:

```dockerfile
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Build frontend
WORKDIR /app/maitri-web-assistant
RUN pnpm install
RUN pnpm run build

# Copy built files to backend
RUN cp -r dist/* ../maitri-backend/src/static/

# Setup backend
WORKDIR /app/maitri-backend
RUN pip install -r requirements.txt

# Expose port
EXPOSE 5000

# Start application
CMD ["python", "src/main.py"]
```

Build and run:

```bash
docker build -t maitri-web-assistant .
docker run -p 5000:5000 maitri-web-assistant
```

### Option 3: Cloud Deployment

The application can be deployed to various cloud platforms:

#### Heroku
1. Create a `Procfile`:
   ```
   web: cd maitri-backend && python src/main.py
   ```

2. Deploy:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku create your-app-name
   git push heroku main
   ```

#### AWS/GCP/Azure
Use the Docker deployment option with your preferred cloud container service.

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# Database Configuration
DATABASE_URL=sqlite:///database/app.db

# CORS Configuration
CORS_ORIGINS=*

# Security
HTTPS_ONLY=true
```

### Database Configuration

The application uses SQLite by default. For production, consider PostgreSQL:

```python
# In src/main.py
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/maitri'
```

## API Documentation

### Emotion Analysis Endpoints

#### POST /api/analyze
Analyze emotion from video/audio data.

**Request:**
```json
{
  "session_id": "string",
  "video_data": "base64_encoded_image",
  "audio_data": {
    "duration": 2.0,
    "sampleRate": 44100,
    "features": "processed_audio_features"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "emotion_label": "happy",
    "wellbeing_score": 85,
    "confidence": 0.92,
    "timestamp": "2025-09-24T19:00:00Z",
    "processing_time": 0.3
  },
  "session_id": "session_123"
}
```

#### GET /api/logs
Retrieve emotion logs with optional filtering.

**Parameters:**
- `session_id` (optional): Filter by session
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset (default: 0)

#### GET /api/logs/summary
Get emotion analysis summary and statistics.

**Parameters:**
- `session_id` (optional): Filter by session
- `hours` (optional): Time range in hours (default: 24)

### Emergency Alert Endpoints

#### POST /api/emergency
Create an emergency alert.

**Request:**
```json
{
  "alert_type": "medical",
  "alert_label": "Medical Emergency",
  "description": "Health-related urgent situation",
  "severity": "critical",
  "session_id": "session_123"
}
```

#### GET /api/emergency
Retrieve emergency alerts.

#### POST /api/emergency/{id}/acknowledge
Acknowledge an emergency alert.

### Session Management

#### POST /api/session
Create a new user session.

#### POST /api/session/{id}/end
End a user session.

### Health Check

#### GET /api/health
Check backend service health.

## Security Considerations

### HTTPS Configuration

For production deployment, always use HTTPS:

```python
# In src/main.py
if app.config.get('HTTPS_ONLY'):
    from flask_talisman import Talisman
    Talisman(app, force_https=True)
```

### Camera Permissions

WebRTC requires explicit user permission for camera and microphone access. The application handles permission requests gracefully and provides fallback functionality.

### Data Privacy

- Raw video/audio data is never stored permanently
- Only processed emotional analysis results are saved
- All data is anonymized with session IDs
- Configurable data retention periods

## Monitoring and Logging

### Application Logs

The Flask application logs to stdout by default. For production:

```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/maitri.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### Database Monitoring

Monitor SQLite database size and performance:

```bash
# Check database size
ls -lh maitri-backend/src/database/app.db

# Vacuum database (optimize)
sqlite3 maitri-backend/src/database/app.db "VACUUM;"
```

## Troubleshooting

### Common Issues

#### 1. Camera Access Denied
**Problem**: Browser blocks camera access
**Solution**: 
- Ensure HTTPS in production
- Check browser permissions
- Use localhost for development

#### 2. Backend Connection Failed
**Problem**: Frontend cannot connect to backend
**Solution**:
- Verify backend is running on correct port
- Check CORS configuration
- Ensure firewall allows connections

#### 3. Database Errors
**Problem**: SQLite database issues
**Solution**:
- Check file permissions
- Verify database directory exists
- Run database migrations

#### 4. Build Failures
**Problem**: Frontend build fails
**Solution**:
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

### Performance Optimization

#### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement service worker for caching

#### Backend Optimization
- Use connection pooling for database
- Implement Redis for session storage
- Add rate limiting for API endpoints

#### Database Optimization
- Add indexes for frequently queried fields
- Implement data archiving for old records
- Use database connection pooling

## Maintenance

### Regular Tasks

#### Daily
- Monitor application logs
- Check system resources
- Verify backup integrity

#### Weekly
- Update dependencies
- Review security logs
- Optimize database

#### Monthly
- Security updates
- Performance analysis
- Capacity planning

### Backup Strategy

```bash
# Backup database
cp maitri-backend/src/database/app.db backups/app_$(date +%Y%m%d).db

# Backup configuration
tar -czf backups/config_$(date +%Y%m%d).tar.gz maitri-backend/src/
```

## Support and Documentation

### Additional Resources
- [React Documentation](https://reactjs.org/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [WebRTC API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Getting Help
For technical support or questions:
1. Check the troubleshooting section
2. Review application logs
3. Consult the API documentation
4. Contact the development team

## License and Credits

MAITRI Web Assistant - Astronaut Well-being Monitor
Built with React, Flask, TailwindCSS, and modern web technologies.

---

**Note**: This application is designed for demonstration and development purposes. For production use in actual space missions, additional security, reliability, and regulatory compliance measures would be required.

