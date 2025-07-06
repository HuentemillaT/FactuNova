# backend/services/stripe-services.py
import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def crear_pago(monto, descripcion, email_cliente):
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(monto * 100),  # En centavos CLP
            currency='clp',
            description=descripcion,
            receipt_email=email_cliente,
        )
        return intent
    except Exception as e:
        raise Exception(f"Stripe error: {str(e)}")
