#models/__init__.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User  # Importa aquí tus modelos para que estén disponibles al importar models
from .resumen import ResumenControlGastos
