# Rutas de documentos
import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models.document import Document, db
from utils.auth import login_required
from config import UPLOAD_FOLDER

doc_routes = Blueprint('doc_routes', __name__)

@doc_routes.route('/upload', methods=['POST'])
@login_required
def upload_doc():
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
        user_id=request.user.id
    )
    db.session.add(document)
    db.session.commit()

    return jsonify({'message': 'Documento subido con éxito'})
