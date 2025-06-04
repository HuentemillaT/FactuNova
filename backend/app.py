# app.py
from flask import Flask, request, jsonify
from models import db, User
import random
import string

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://factunova:E13c17C12@localhost:5432/usuarios'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)  

def generate_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    role = data.get('role')

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email ya registrado'}), 400

    user = User(email=email, phone=phone, role=role)
    user.set_password(password)
    user.verification_code = generate_code()

    db.session.add(user)
    db.session.commit()

    print(f"Código de verificación para {email}: {user.verification_code}")

    return jsonify({'message': 'Usuario creado. Por favor verifica tu cuenta con el código enviado.'})

@app.route('/verify', methods=['POST'])
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

with app.app_context():
    db.create_all()
    print("Tablas creadas (si no existían)")

if __name__ == '__main__':
    app.run(debug=True)
