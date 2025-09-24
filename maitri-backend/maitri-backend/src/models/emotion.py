from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class EmotionLog(db.Model):
    __tablename__ = 'emotion_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    emotion_label = db.Column(db.String(50), nullable=False)
    wellbeing_score = db.Column(db.Integer, nullable=False)
    confidence = db.Column(db.Float, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    additional_data = db.Column(db.Text, nullable=True)  # JSON string for additional data
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'emotion_label': self.emotion_label,
            'wellbeing_score': self.wellbeing_score,
            'confidence': self.confidence,
            'timestamp': self.timestamp.isoformat(),
            'additional_data': self.additional_data
        }

class EmergencyAlert(db.Model):
    __tablename__ = 'emergency_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(50), nullable=False)
    alert_label = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    status = db.Column(db.String(20), default='sent')  # sent, acknowledged, resolved
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    response_time = db.Column(db.DateTime, nullable=True)
    session_id = db.Column(db.String(100), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'alert_label': self.alert_label,
            'description': self.description,
            'severity': self.severity,
            'status': self.status,
            'timestamp': self.timestamp.isoformat(),
            'response_time': self.response_time.isoformat() if self.response_time else None,
            'session_id': self.session_id
        }

class UserSession(db.Model):
    __tablename__ = 'user_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False)
    user_identifier = db.Column(db.String(100), nullable=True)  # Optional user ID
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    total_emotions = db.Column(db.Integer, default=0)
    avg_wellbeing = db.Column(db.Float, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'user_identifier': self.user_identifier,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'total_emotions': self.total_emotions,
            'avg_wellbeing': self.avg_wellbeing
        }

