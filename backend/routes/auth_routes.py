# Rutas de autenticación
# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from models import db, User
import random
import string

auth_bp = Blueprint('auth', __name__)

def generate_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        name = data.get('name')
        rut = data.get('rut')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        # Validar campos obligatorios
        if not name or not email or not password or not role or not rut:
            return jsonify({'error': 'Todos los campos son obligatorios'}), 400

        # Validar si email existe
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email ya registrado'}), 400

        # Crear usuario y setear password
        user = User(name=name, rut=rut, email=email, role=role)
        user.set_password(password)
        user.verification_code = generate_code()

        # Agregar y guardar en BD
        db.session.add(user)
        db.session.commit()

        print(f"[DEBUG] Código de verificación para {email}: {user.verification_code}")

        return jsonify({'message': 'Usuario creado. Verifica tu cuenta con el código enviado.'}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()  # Imprime el error completo en consola
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify', methods=['POST'])
def verify():
    data = request.json
    email = data.get('email')
    code = data.get('code')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if user.is_verified:
        return jsonify({'message': 'Usuario ya verificado'})

    if user.verification_code == code:
        user.is_verified = True
        user.verification_code = None
        db.session.commit()
        return jsonify({'message': 'Usuario verificado correctamente'})
    else:
        return jsonify({'error': 'Código incorrecto'}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email y contraseña son obligatorios'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if not user.is_verified:
        return jsonify({'error': 'Cuenta no verificada'}), 403

    if user.check_password(password):
        return jsonify({
            'message': f'Login exitoso para {user.email}',
            'role': user.role,
            'user_id': user.id,
            'name': user.name
        }), 200
    else:
        return jsonify({'error': 'Contraseña incorrecta'}), 401
