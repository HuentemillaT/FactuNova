# backend/routes/facturas.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.factura import Factura
from models.user import User
from services.stripeservices import crear_pago
import uuid

facturas_bp = Blueprint('facturas', __name__)

@facturas_bp.route('/facturas', methods=['POST'])
@jwt_required()
def crear_factura():
    data = request.get_json()
    descripcion = data.get('descripcion')
    monto = data.get('monto')
    user_id = get_jwt_identity()

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    try:
        intent = crear_pago(monto, descripcion, user.email)

        # Calcular el número consecutivo para la factura
        max_numero = db.session.query(db.func.max(Factura.numero_factura)).scalar()
        nuevo_numero = (max_numero or 0) + 1

        # Generar UUID para el timbre
        codigo_timbre = str(uuid.uuid4())

        nueva_factura = Factura(
            user_id=user.id,
            descripcion=descripcion,
            monto=monto,
            stripe_invoice_id=intent.id,
            status='pendiente',
            numero_factura=nuevo_numero,
            timbre=codigo_timbre
        )
        db.session.add(nueva_factura)
        db.session.commit()

        return jsonify({
            "msg": "Factura creada exitosamente",
            "client_secret": intent.client_secret,
            "numero_factura": nuevo_numero,
            "timbre": codigo_timbre
        }), 201
    except Exception as e:
        return jsonify({"msg": str(e)}), 500
