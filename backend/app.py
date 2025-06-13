# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes.auth_routes import auth_bp
from routes.doc_routes import doc_routes
from routes.user_routes import user_routes

from flask_jwt_extended import JWTManager  

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:E13c17C12@localhost:5432/factunova'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Clave secreta para firmar los tokens JWT (cámbiala por una segura)
app.config['JWT_SECRET_KEY'] = '1709007a83fb1638c6a6da9c0af42e2b02532775c8259af763eb0c3b22daafd8'

# Inicializa JWTManager
jwt = JWTManager(app)

# CORS sólo para tu frontend React
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

# Inicializar db con la app
db.init_app(app)

# Registrar blueprints
app.register_blueprint(auth_bp,  url_prefix='/api/auth')
app.register_blueprint(doc_routes,  url_prefix='/api/docs')
app.register_blueprint(user_routes, url_prefix='/api/users')

# Crear tablas al iniciar app (idealmente en un script aparte, pero sirve para pruebas)
with app.app_context():
    db.create_all()
    print("Tablas creadas (si no existían)")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
