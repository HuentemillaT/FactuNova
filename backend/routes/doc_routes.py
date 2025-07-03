import os
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from models.document import Document, db
from utils.auth import login_required
from config import UPLOAD_FOLDER

doc_routes = Blueprint('doc_routes', __name__)

@doc_routes.route('/upload', methods=['POST', 'OPTIONS'])
@login_required
def upload_doc():
    if request.method == 'OPTIONS':
        # Responder preflight CORS
        return '', 204

    if 'file' not in request.files:
        return jsonify({'message': 'Archivo no encontrado'}), 400

    file = request.files['file']
    category = request.form.get('category')

    if not category:
        return jsonify({'message': 'Categoría requerida'}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    document = Document(
        filename=filename,
        originalname=file.filename,
        category=category,
        user_id=g.user.id
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
