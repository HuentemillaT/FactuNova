# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes.auth_routes import auth_bp
from routes.doc_routes import doc_routes
from routes.user_routes import user_routes

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:E13c17C12@localhost:5432/factunova'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS sólo para tu frontend React
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Inicializar db con la app
db.init_app(app)

# Registrar blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(doc_routes)
app.register_blueprint(user_routes, url_prefix='/api/users')

# Crear tablas al iniciar app (idealmente en un script aparte, pero sirve para pruebas)
with app.app_context():
    db.create_all()
    print("Tablas creadas (si no existían)")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
