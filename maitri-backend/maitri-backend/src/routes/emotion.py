from flask import Blueprint, request, jsonify
from src.models.emotion import db, EmotionLog, EmergencyAlert, UserSession
import json
import random
import numpy as np
from datetime import datetime, timedelta
import uuid

emotion_bp = Blueprint('emotion', __name__)

# Placeholder AI emotion detection
def analyze_emotion(video_data=None, audio_data=None):
    """
    Placeholder AI emotion detection function.
    In a real implementation, this would use ML models like PyTorch/ONNX.
    """
    emotions = ['happy', 'sad', 'neutral', 'stressed', 'fatigued']
    
    # Simulate emotion detection with some logic
    base_scores = {
        'happy': random.uniform(60, 95),
        'sad': random.uniform(30, 70),
        'neutral': random.uniform(50, 85),
        'stressed': random.uniform(25, 65),
        'fatigued': random.uniform(20, 60)
    }
    
    # Add some randomness but keep it realistic
    selected_emotion = random.choices(
        emotions, 
        weights=[0.3, 0.15, 0.35, 0.15, 0.05]  # Weighted towards neutral/happy
    )[0]
    
    wellbeing_score = int(base_scores[selected_emotion] + random.uniform(-10, 10))
    wellbeing_score = max(0, min(100, wellbeing_score))  # Clamp to 0-100
    
    confidence = random.uniform(0.7, 0.95)
    
    return {
        'emotion_label': selected_emotion,
        'wellbeing_score': wellbeing_score,
        'confidence': confidence,
        'timestamp': datetime.utcnow().isoformat(),
        'processing_time': random.uniform(0.1, 0.5)
    }

@emotion_bp.route('/analyze', methods=['POST'])
def analyze_emotion_endpoint():
    """
    Analyze emotion from video/audio data
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        session_id = data.get('session_id', str(uuid.uuid4()))
        video_data = data.get('video_data')  # Base64 encoded or processed features
        audio_data = data.get('audio_data')  # Audio features
        
        # Perform emotion analysis
        result = analyze_emotion(video_data, audio_data)
        
        # Store in database
        emotion_log = EmotionLog(
            session_id=session_id,
            emotion_label=result['emotion_label'],
            wellbeing_score=result['wellbeing_score'],
            confidence=result['confidence'],
            additional_data=json.dumps({
                'processing_time': result['processing_time'],
                'has_video': video_data is not None,
                'has_audio': audio_data is not None
            })
        )
        
        db.session.add(emotion_log)
        
        # Update session statistics
        session = UserSession.query.filter_by(session_id=session_id).first()
        if not session:
            session = UserSession(session_id=session_id)
            db.session.add(session)
        
        # Update session stats
        session.total_emotions += 1
        
        # Calculate average wellbeing
        all_logs = EmotionLog.query.filter_by(session_id=session_id).all()
        if all_logs:
            avg_wellbeing = sum(log.wellbeing_score for log in all_logs) / len(all_logs)
            session.avg_wellbeing = avg_wellbeing
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'result': result,
            'session_id': session_id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@emotion_bp.route('/logs', methods=['GET'])
def get_emotion_logs():
    """
    Get emotion logs with optional filtering
    """
    try:
        session_id = request.args.get('session_id')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        query = EmotionLog.query
        
        if session_id:
            query = query.filter_by(session_id=session_id)
        
        # Get recent logs
        logs = query.order_by(EmotionLog.timestamp.desc()).offset(offset).limit(limit).all()
        
        return jsonify({
            'success': True,
            'logs': [log.to_dict() for log in logs],
            'total': query.count()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emotion_bp.route('/logs/summary', methods=['GET'])
def get_emotion_summary():
    """
    Get emotion analysis summary
    """
    try:
        session_id = request.args.get('session_id')
        hours = int(request.args.get('hours', 24))
        
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        query = EmotionLog.query.filter(EmotionLog.timestamp >= start_time)
        
        if session_id:
            query = query.filter_by(session_id=session_id)
        
        logs = query.all()
        
        if not logs:
            return jsonify({
                'success': True,
                'summary': {
                    'total_readings': 0,
                    'avg_wellbeing': 0,
                    'emotion_distribution': {},
                    'wellbeing_trend': []
                }
            })
        
        # Calculate statistics
        total_readings = len(logs)
        avg_wellbeing = sum(log.wellbeing_score for log in logs) / total_readings
        
        # Emotion distribution
        emotion_counts = {}
        for log in logs:
            emotion_counts[log.emotion_label] = emotion_counts.get(log.emotion_label, 0) + 1
        
        # Wellbeing trend (hourly averages)
        trend_data = []
        for i in range(hours):
            hour_start = start_time + timedelta(hours=i)
            hour_end = hour_start + timedelta(hours=1)
            
            hour_logs = [log for log in logs if hour_start <= log.timestamp < hour_end]
            if hour_logs:
                hour_avg = sum(log.wellbeing_score for log in hour_logs) / len(hour_logs)
                trend_data.append({
                    'hour': hour_start.isoformat(),
                    'avg_wellbeing': round(hour_avg, 2),
                    'count': len(hour_logs)
                })
        
        return jsonify({
            'success': True,
            'summary': {
                'total_readings': total_readings,
                'avg_wellbeing': round(avg_wellbeing, 2),
                'emotion_distribution': emotion_counts,
                'wellbeing_trend': trend_data,
                'time_range': {
                    'start': start_time.isoformat(),
                    'end': end_time.isoformat()
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emotion_bp.route('/emergency', methods=['POST'])
def create_emergency_alert():
    """
    Create an emergency alert
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['alert_type', 'alert_label', 'session_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create emergency alert
        alert = EmergencyAlert(
            alert_type=data['alert_type'],
            alert_label=data['alert_label'],
            description=data.get('description', ''),
            severity=data.get('severity', 'medium'),
            session_id=data['session_id']
        )
        
        db.session.add(alert)
        db.session.commit()
        
        # Simulate ground response (in real implementation, this would trigger actual alerts)
        response_delay = random.uniform(1, 5)  # 1-5 seconds
        
        return jsonify({
            'success': True,
            'alert': alert.to_dict(),
            'estimated_response_time': response_delay,
            'message': 'Emergency alert sent to ground control'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@emotion_bp.route('/emergency/<int:alert_id>/acknowledge', methods=['POST'])
def acknowledge_emergency_alert(alert_id):
    """
    Acknowledge an emergency alert
    """
    try:
        alert = EmergencyAlert.query.get_or_404(alert_id)
        
        alert.status = 'acknowledged'
        alert.response_time = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'alert': alert.to_dict(),
            'message': 'Emergency alert acknowledged'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@emotion_bp.route('/emergency', methods=['GET'])
def get_emergency_alerts():
    """
    Get emergency alerts
    """
    try:
        session_id = request.args.get('session_id')
        status = request.args.get('status')
        limit = int(request.args.get('limit', 20))
        
        query = EmergencyAlert.query
        
        if session_id:
            query = query.filter_by(session_id=session_id)
        
        if status:
            query = query.filter_by(status=status)
        
        alerts = query.order_by(EmergencyAlert.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'alerts': [alert.to_dict() for alert in alerts]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emotion_bp.route('/session', methods=['POST'])
def create_session():
    """
    Create a new user session
    """
    try:
        data = request.get_json() or {}
        
        session_id = str(uuid.uuid4())
        user_identifier = data.get('user_identifier')
        
        session = UserSession(
            session_id=session_id,
            user_identifier=user_identifier
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'session': session.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@emotion_bp.route('/session/<session_id>/end', methods=['POST'])
def end_session(session_id):
    """
    End a user session
    """
    try:
        session = UserSession.query.filter_by(session_id=session_id).first_or_404()
        
        session.end_time = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'session': session.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@emotion_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    try:
        # Check database connection
        db.session.execute('SELECT 1')
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500

