# Decoradores de autenticación
from functools import wraps
from flask import request, jsonify
import jwt
from config import SECRET_KEY
from models.user import User, db

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            bearer = request.headers['Authorization']
            token = bearer.split()[1] if ' ' in bearer else bearer

        if not token:
            return jsonify({'message': 'Token requerido'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(data['id'])
            if not user:
                return jsonify({'message': 'Usuario no encontrado'}), 401
            request.user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 401
        except Exception:
            return jsonify({'message': 'Token inválido'}), 401

        return f(*args, **kwargs)
    return decorated

def roles_required(*roles):
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(request, 'user', None)
            if user and user.role in roles:
                return f(*args, **kwargs)
            return jsonify({'message': 'Acceso denegado'}), 403
        return decorated
    return wrapper
