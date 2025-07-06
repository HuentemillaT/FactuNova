# backend/app.py
import os
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, send_from_directory
from flask_cors import CORS
from extensions import db
from flask_jwt_extended import JWTManager

from routes.auth_routes import auth_bp
from routes.doc_routes import doc_routes
from routes.user_routes import user_routes
from routes.resumen_routes import resumen_routes
from routes.facturas import facturas_bp  # mantener aquí
from routes.validacion import validacion_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:E13c17C12@localhost:5432/factunova'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '1709007a83fb1638c6a6da9c0af42e2b02532775c8259af763eb0c3b22daafd8'

# Carpeta base para subir archivos
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
jwt = JWTManager(app)
db.init_app(app)

# Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(doc_routes, url_prefix='/api/docs')
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(resumen_routes, url_prefix='/api')
app.register_blueprint(facturas_bp, url_prefix='/api')
app.register_blueprint(validacion_bp, url_prefix='/api')


# RUTA para servir documentos del SII (estáticos)
@app.route('/uploads/sii/<path:filename>')
def serve_sii_file(filename):
    return send_from_directory(os.path.join(UPLOAD_FOLDER, 'sii'), filename)
# RUTA para servir facturas
@app.route('/uploads/facturas/<path:filename>')
def serve_factura_pdf(filename):
    path = os.path.join(app.config['UPLOAD_FOLDER'], 'facturas')
    return send_from_directory(path, filename)

# Crear tablas al iniciar
with app.app_context():
    db.create_all()
    print("Tablas creadas (si no existían)")
    for rule in app.url_map.iter_rules():
        print(rule)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
