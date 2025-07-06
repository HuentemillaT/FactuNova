# /backend/routes/facturas.py
import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.factura import Factura
from models.user import User
from services.stripeservices import crear_pago
from services.pdf_generator import generar_pdf_factura
from sqlalchemy import func

facturas_bp = Blueprint('facturas', __name__)

@facturas_bp.route('/facturas', methods=['POST'])
@jwt_required()
def crear_factura():
    data = request.get_json()
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    try:
        # Generar número de factura automático
        año_actual = datetime.utcnow().year
        prefijo = f"FAC-{año_actual}-"

        ultima_factura = Factura.query.filter(Factura.numero_factura.like(f"{prefijo}%")) \
                                      .order_by(Factura.numero_factura.desc()).first()

        if ultima_factura:
            ultimo_num = int(ultima_factura.numero_factura.replace(prefijo, ""))
            nuevo_num = ultimo_num + 1
        else:
            nuevo_num = 1

        nuevo_numero_factura = f"{prefijo}{nuevo_num:04d}"  # e.g. FAC-2025-0001

        # Parsear fecha de emisión
        fecha_emision_str = data.get("fecha_emision")
        if fecha_emision_str:
            try:
                fecha_emision = datetime.fromisoformat(fecha_emision_str)
            except ValueError:
                fecha_emision = datetime.strptime(fecha_emision_str, "%d-%m-%Y")
        else:
            fecha_emision = datetime.utcnow()

        emisor = data.get("emisor")
        receptor = data.get("receptor")
        items = data.get("items", [])
        timbre = data.get("timbre")

        neto = sum(item['cantidad'] * item['precioUnitario'] for item in items)
        iva = neto * 0.19
        total = neto + iva

        descripcion = f"Factura {nuevo_numero_factura} de {emisor.get('razonSocial', '')} a {receptor.get('razonSocial', '')}"

        nueva_factura = Factura(
            user_id=user_id,
            descripcion=descripcion,
            monto=total,
            numero_factura=nuevo_numero_factura,
            timbre=timbre,
            fecha_emision=fecha_emision,
            status='pendiente'
        )

        db.session.add(nueva_factura)
        db.session.commit()

        # Generar PDF
        carpeta_facturas = os.path.join(os.getcwd(), 'uploads', 'facturas')
        os.makedirs(carpeta_facturas, exist_ok=True)
        ruta_pdf = os.path.join(carpeta_facturas, f'factura_{nuevo_numero_factura}.pdf')

        factura_data = {
            "numero_factura": nuevo_numero_factura,
            "fecha_emision": fecha_emision_str,
            "emisor": emisor,
            "receptor": receptor,
            "items": items,
            "neto": neto,
            "iva": iva,
            "total": total,
            "timbre": timbre
        }

        generar_pdf_factura(ruta_pdf, factura_data)

        return jsonify({
            "msg": "Factura creada y guardada correctamente",
            "numero_factura": nuevo_numero_factura,
            "pdf_url": f"/uploads/facturas/factura_{nuevo_numero_factura}.pdf"
        })

    except Exception as e:
        print("❌ Error al crear factura:", e)
        import traceback; traceback.print_exc()
        return jsonify({"msg": "Error al crear factura", "error": str(e)}), 500


@facturas_bp.route('/facturas', methods=['GET'])
@jwt_required()
def listar_facturas():
    user_id = get_jwt_identity()
    facturas = Factura.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": f.id,
            "descripcion": f.descripcion,
            "monto": f.monto,
            "status": f.status,
            "numero_factura": f.numero_factura,
            "timbre": f.timbre,
            "fecha_emision": f.fecha_emision.isoformat() if f.fecha_emision else None,
            "pdf_url": f"/uploads/facturas/factura_{f.numero_factura}.pdf"
        }
        for f in facturas
    ])
