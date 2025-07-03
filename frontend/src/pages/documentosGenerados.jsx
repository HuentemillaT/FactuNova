import React, { useEffect, useState } from 'react';

const Documentos = () => {
  const [facturas, setFacturas] = useState([]);
  const [documentosSII, setDocumentosSII] = useState([]);

  useEffect(() => {
    // Llamadas a la API del backend (debes tener rutas que devuelvan estas listas)
    fetchFacturas();
    fetchDocumentosSII();
  }, []);

  const fetchFacturas = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/facturas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await res.json();
      setFacturas(data);
    } catch (err) {
      console.error('Error al obtener facturas:', err);
    }
  };

  const fetchDocumentosSII = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/docs/sii', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await res.json();
      setDocumentosSII(data);
    } catch (err) {
      console.error('Error al obtener documentos del SII:', err);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h2>📑 Documentos y Facturas</h2>

      <section style={{ marginTop: 30 }}>
        <h3>🧾 Facturas Emitidas</h3>
        {facturas.length === 0 ? (
          <p>No hay facturas disponibles.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th>ID</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.descripcion}</td>
                  <td>${f.monto}</td>
                  <td>{f.status}</td>
                  <td>
                    <a href={f.pdf_url || '#'} target="_blank" rel="noopener noreferrer">
                      Descargar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 50 }}>
        <h3>📂 Documentos del SII</h3>
        {documentosSII.length === 0 ? (
          <p>No hay documentos disponibles.</p>
        ) : (
          <ul>
            {documentosSII.map((doc, i) => (
              <li key={i}>
                <strong>{doc.nombre}</strong> -{' '}
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Documentos;
