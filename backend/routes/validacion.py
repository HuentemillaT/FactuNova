# backend/routes/validacion.py
import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.factura import Factura
from models.verification_code import VerificationCode
from utils.email_utils import enviar_codigo_verificacion  # asegúrate de tener este archivo

validacion_bp = Blueprint('validacion', __name__)

@validacion_bp.route('/solicitar-codigo/<int:factura_id>', methods=['POST'])
@jwt_required()
def solicitar_codigo(factura_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    codigo = str(random.randint(100000, 999999))

    nuevo_codigo = VerificationCode(
        user_id=user_id,
        codigo=codigo,
        factura_id=factura_id
    )
    db.session.add(nuevo_codigo)
    db.session.commit()

    enviar_codigo_verificacion(user.email, codigo)

    return jsonify({"msg": "Código enviado al correo"})


@validacion_bp.route('/verificar-codigo', methods=['POST'])
@jwt_required()
def verificar_codigo():
    # 1. Obtener los datos JSON enviados por el cliente
    data = request.get_json()

    # 2. Obtener el user_id desde el token JWT (identidad)
    user_id_raw = get_jwt_identity()

    # 3. Convertir user_id a entero para evitar errores en comparación
    try:
        user_id = int(user_id_raw)
    except (ValueError, TypeError):
        return jsonify({"msg": "user_id inválido en token"}), 400

    # 4. Extraer factura_id y código de los datos recibidos
    factura_id_raw = data.get("factura_id")
    codigo = data.get("codigo")

    # 5. Convertir factura_id a entero y validar
    try:
        factura_id = int(factura_id_raw)
    except (ValueError, TypeError):
        return jsonify({"msg": "factura_id inválido"}), 400

    # 6. Logging para depurar (opcional, útil durante desarrollo)
    print(f"user_id token: {user_id}")
    print(f"factura_id recibido: {factura_id} (tipo: {type(factura_id)})")
    print(f"codigo recibido: {codigo}")

    # 7. Buscar la factura en la base de datos
    factura = Factura.query.get(factura_id)
    print(f"Factura encontrada: {factura}")

    # 8. Validar que la factura exista y que pertenezca al usuario
    if not factura or factura.user_id != user_id:
        print("❌ Factura inválida o no pertenece al usuario")
        return jsonify({"msg": "Factura no válida"}), 404

    # 9. Buscar el código de verificación correspondiente
    verif = VerificationCode.query.filter_by(
        user_id=user_id,
        codigo=codigo,
        factura_id=factura_id
    ).first()
    print(f"Código verif encontrado: {verif}")

    # 10. Validar que el código exista y que no esté expirado
    if not verif or verif.expira_en < datetime.utcnow():
        print("❌ Código inválido o expirado")
        return jsonify({"msg": "Código inválido o expirado"}), 400

    # 11. Actualizar estado de la factura a "enviada"
    factura.status = "enviada"
    db.session.commit()

    # 12. Eliminar el código de verificación usado
    db.session.delete(verif)
    db.session.commit()

    print("✅ Factura validada y estado actualizado")
    return jsonify({"msg": "Factura validada y enviada con éxito"})