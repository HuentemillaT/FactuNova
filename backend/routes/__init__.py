import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import stripe

load_dotenv()

db = SQLAlchemy()

stripe_api_key = os.getenv('STRIPE_SECRET_KEY')
if not stripe_api_key:
    raise ValueError("La variable de entorno STRIPE_SECRET_KEY no está configurada")
stripe.api_key = stripe_api_key

def create_app():
    app = Flask(__name__)
    
    database_url = os.getenv('DATABASE_URL')
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    @app.route('/')
    def home():
        return jsonify({"message": "API de FactuNova funcionando"})

    @app.route('/ping')
    def ping():
        return jsonify({"status": "ok"})

    @app.route('/create-payment-intent', methods=['POST'])
    def create_payment_intent():
        data = request.json
        amount = data.get('amount')

        if amount is None:
            return jsonify({"error": "Falta el campo 'amount'"}), 400
        
        # Validar que amount sea entero positivo
        try:
            amount = int(amount)
            if amount <= 0:
                return jsonify({"error": "El monto debe ser un entero positivo"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "El monto debe ser un número entero válido"}), 400

        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='usd',
                payment_method_types=['card'],
            )
            return jsonify({'clientSecret': payment_intent['client_secret']})
        except Exception as e:
            return jsonify(error=str(e)), 500

    return app
