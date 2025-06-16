from functools import wraps
from flask import jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

def login_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Asignamos el usuario a request para que esté disponible en la función
        g.user = user
        
        return fn(*args, **kwargs)
    return wrapper

def roles_required(*roles):
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(g, 'user', None)
            if user and user.role in roles:
                return f(*args, **kwargs)
            return jsonify({'message': 'Acceso denegado'}), 403
        return decorated
    return wrapper
