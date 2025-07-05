import os
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from models.document import Document, db
from utils.auth import login_required
from config import UPLOAD_FOLDER
from datetime import datetime

doc_routes = Blueprint('doc_routes', __name__)

@doc_routes.route('/upload', methods=['POST', 'OPTIONS'])
@login_required
def upload_doc():
    if request.method == 'OPTIONS':
        return '', 204

    if 'file' not in request.files:
        return jsonify({'message': 'Archivo no encontrado'}), 400

    file = request.files['file']
    category = request.form.get('category')
    descripcion = request.form.get('descripcion', '')
    monto = request.form.get('monto')
    status = request.form.get('status', 'pendiente')
    fecha_emision_str = request.form.get('fecha_emision')

    if not category:
        return jsonify({'message': 'Categoría requerida'}), 400

    try:
        fecha_emision = datetime.fromisoformat(fecha_emision_str) if fecha_emision_str else datetime.utcnow()
    except ValueError:
        fecha_emision = datetime.utcnow()

    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    # Convertir monto a float si existe
    monto_float = float(monto) if monto else None

    document = Document(
        filename=filename,
        originalname=file.filename,
        category=category,
        user_id=g.user.id,
        descripcion=descripcion,
        monto=monto_float,
        status=status,
        fecha_emision=fecha_emision
    )
    db.session.add(document)
    db.session.commit()

    return jsonify({'message': 'Documento subido con éxito'})

@doc_routes.route('/sii', methods=['GET'])
def listar_documentos_sii():
    documentos = [
        {
            "nombre": "Certificado Inicio de Actividades",
            "url": "http://localhost:5000/uploads/sii/certificado-inicio.pdf"
        },
        {
            "nombre": "Resolución SII 2024",
            "url": "http://localhost:5000/uploads/sii/resolucion.pdf"
        }
    ]
    return jsonify(documentos)

@doc_routes.route('/facturas', methods=['GET'])
@login_required
def listar_facturas():
    user_id = g.user.id
    facturas = Document.query.filter_by(user_id=user_id, category='factura').all()
    resultado = []
    for f in facturas:
        resultado.append({
            'id': f.id,
            'descripcion': f.descripcion or f.originalname,
            'monto': f.monto or 0,
            'status': f.status or 'pendiente',
            'fecha_emision': f.fecha_emision.isoformat() if f.fecha_emision else '',
            'pdf_url': f.get_url()
        })
    return jsonify(resultado)
