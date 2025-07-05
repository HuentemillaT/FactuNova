import React, { useEffect, useState } from 'react';

const Documentos = () => {
  const [facturas, setFacturas] = useState([]);
  const [documentosSII, setDocumentosSII] = useState([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errorFacturas, setErrorFacturas] = useState(null);
  const [errorDocs, setErrorDocs] = useState(null);

  // Filtros de facturas
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  useEffect(() => {
    fetchFacturas();
    fetchDocumentosSII();
  }, []);

  const fetchFacturas = async () => {
    setLoadingFacturas(true);
    setErrorFacturas(null);
    try {
      const res = await fetch('http://localhost:5000/api/facturas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setFacturas(data);
    } catch (err) {
      setErrorFacturas('No se pudieron cargar las facturas.');
      console.error(err);
    } finally {
      setLoadingFacturas(false);
    }
  };

  const fetchDocumentosSII = async () => {
    setLoadingDocs(true);
    setErrorDocs(null);
    try {
      const res = await fetch('http://localhost:5000/api/docs/sii', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setDocumentosSII(data);
    } catch (err) {
      setErrorDocs('No se pudieron cargar los documentos del SII.');
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Filtrar facturas segun filtros
  const facturasFiltradas = facturas.filter(f => {
    const cumpleEstado = filtroEstado === 'todos' || f.status.toLowerCase() === filtroEstado;
    const fechaFactura = new Date(f.fecha_emision);
    const cumpleDesde = filtroFechaDesde ? fechaFactura >= new Date(filtroFechaDesde) : true;
    const cumpleHasta = filtroFechaHasta ? fechaFactura <= new Date(filtroFechaHasta) : true;
    return cumpleEstado && cumpleDesde && cumpleHasta;
  });

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h2>📑 Documentos y Facturas</h2>

      <section style={{ marginTop: 30 }}>
        <h3>🧾 Facturas Emitidas</h3>

        {/* Filtros */}
        <div style={{ marginBottom: 15 }}>
          <label>
            Estado:&nbsp;
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </label>
          &nbsp;&nbsp;
          <label>
            Desde:&nbsp;
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={e => setFiltroFechaDesde(e.target.value)}
            />
          </label>
          &nbsp;&nbsp;
          <label>
            Hasta:&nbsp;
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={e => setFiltroFechaHasta(e.target.value)}
            />
          </label>
        </div>

        {loadingFacturas ? (
          <p>Cargando facturas...</p>
        ) : errorFacturas ? (
          <p style={{ color: 'red' }}>{errorFacturas}</p>
        ) : facturasFiltradas.length === 0 ? (
          <p>No hay facturas disponibles con esos filtros.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th>ID</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha Emisión</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.map(f => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.descripcion}</td>
                  <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(f.monto)}</td>
                  <td>{f.status}</td>
                  <td>{new Date(f.fecha_emision).toLocaleDateString('es-CL')}</td>
                  <td>
                    {f.pdf_url ? (
                      <a href={f.pdf_url} target="_blank" rel="noopener noreferrer">
                        Descargar
                      </a>
                    ) : (
                      'No disponible'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 50 }}>
        <h3>📂 Documentos del SII</h3>
        {loadingDocs ? (
          <p>Cargando documentos...</p>
        ) : errorDocs ? (
          <p style={{ color: 'red' }}>{errorDocs}</p>
        ) : documentosSII.length === 0 ? (
          <p>No hay documentos disponibles.</p>
        ) : (
          <ul>
            {documentosSII.map((doc, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
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
