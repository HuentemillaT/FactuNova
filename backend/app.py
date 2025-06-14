from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes.auth_routes import auth_bp
from routes.doc_routes import doc_routes
from routes.user_routes import user_routes
from routes.resumen_routes import resumen_routes
from flask_jwt_extended import JWTManager  

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:E13c17C12@localhost:5432/factunova'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '1709007a83fb1638c6a6da9c0af42e2b02532775c8259af763eb0c3b22daafd8'

# ✅ CORS global para el frontend en React (localhost:5173)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Inicializa JWT
jwt = JWTManager(app)

# Inicializa DB
db.init_app(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(doc_routes, url_prefix='/api/docs')
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(resumen_routes, url_prefix='/api')  # <- correcto así

# Crear tablas (solo para pruebas)
with app.app_context():
    db.create_all()
    print("Tablas creadas (si no existían)")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
