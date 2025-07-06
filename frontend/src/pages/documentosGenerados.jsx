import React, { useEffect, useState } from 'react';
import '../App.css';

const Documentos = () => {
  const [facturas, setFacturas] = useState([]);
  const [documentosSII, setDocumentosSII] = useState([]);
  const [resumenes, setResumenes] = useState([]); // ahora es array
  const [gastos, setGastos] = useState([]);

  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);

  const [errorFacturas, setErrorFacturas] = useState(null);
  const [errorDocs, setErrorDocs] = useState(null);
  const [errorResumen, setErrorResumen] = useState(null);

  // Filtros de facturas
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    fetchFacturas();
    fetchDocumentosSII();
    fetchResumenYGastos();
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

  const fetchResumenYGastos = async () => {
    setLoadingResumen(true);
    setErrorResumen(null);
    try {
      const res = await fetch('http://localhost:5000/api/resumen', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setResumenes(data.resumenes || []); // array de resúmenes
      setGastos(data.gastos || []); // array de gastos
    } catch (err) {
      setErrorResumen('No se pudo cargar el resumen y gastos.');
      console.error(err);
    } finally {
      setLoadingResumen(false);
    }
  };

  // Función para mostrar descripción del estado
  const descripcionEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente: En proceso';
      case 'pagada':
        return 'Pagada: Finalizada';
      case 'anulada':
        return 'Anulada: Cancelada';
      default:
        return estado || '';
    }
  };

  // Filtrar facturas segun filtros
  const facturasFiltradas = facturas.filter(f => {
    const cumpleEstado = filtroEstado === 'todos' || (f.status?.toLowerCase() === filtroEstado);
    if (!f.fecha_emision) return false;
    const fechaFactura = new Date(f.fecha_emision);
    const cumpleDesde = filtroFechaDesde ? fechaFactura >= new Date(filtroFechaDesde) : true;
    const cumpleHasta = filtroFechaHasta ? fechaFactura <= new Date(filtroFechaHasta) : true;
    return cumpleEstado && cumpleDesde && cumpleHasta;
  });

  const abrirModal = (factura) => {
    setFacturaSeleccionada(factura);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setFacturaSeleccionada(null);
    setMostrarModal(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h2>📑 Documentos y Facturas</h2>

      {/* Sección Facturas */}
      <section style={{ marginTop: 30 }}>
        <h3>🧾 Facturas Emitidas</h3>

        {/* Filtros */}
        <div className='document' style={{ marginBottom: 15 }}>
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
                  <td>{descripcionEstado(f.status)}</td>
                  <td>{new Date(f.fecha_emision).toLocaleDateString('es-CL')}</td>
                  <td>
                    {f.pdf_url ? (
                      <>
                        <button onClick={() => abrirModal(f)} style={{ marginRight: 8 }}>
                          Ver
                        </button>
                        <a
                          href={`http://localhost:5000${f.pdf_url}`}
                          download={`factura-${f.id}.pdf`}
                          style={{ color: 'green' }}
                        >
                          Descargar
                        </a>
                      </>
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

      {/* Sección Documentos SII */}
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

      {/* Sección Resúmenes de Gastos */}
      <section style={{ marginTop: 50 }}>
        <h3>📊 Resúmenes de Gastos</h3>
        {loadingResumen ? (
          <p>Cargando resúmenes...</p>
        ) : errorResumen ? (
          <p style={{ color: 'red' }}>{errorResumen}</p>
        ) : resumenes.length === 0 ? (
          <p>No hay resúmenes disponibles.</p>
        ) : (
          resumenes.map(resumen => (
            <div
              key={resumen.id}
              style={{
                marginBottom: 30,
                padding: 15,
                border: '1px solid #ccc',
                borderRadius: 8,
                backgroundColor: '#f9f9f9',
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <strong>Ingreso total:</strong>{' '}
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: resumen.moneda || 'CLP' }).format(resumen.ingreso_total)} <br />
                <strong>Total gastos:</strong>{' '}
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: resumen.moneda || 'CLP' }).format(resumen.total_gastos)} <br />
                <strong>Balance:</strong>{' '}
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: resumen.moneda || 'CLP' }).format(resumen.balance)} <br />
                <small>Fecha: {new Date(resumen.fecha_creacion).toLocaleString('es-CL')}</small>
              </div>
            </div>
          ))
        )}
      </section>

      {/* MODAL para visualizar PDF */}
      {mostrarModal && facturaSeleccionada && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 20,
              borderRadius: 8,
              maxWidth: '90%',
              width: '80%',
              height: '80%',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <button
              onClick={cerrarModal}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 30,
                height: 30,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            <h3 style={{ marginTop: 0 }}>Factura #{facturaSeleccionada.id}</h3>
            <iframe
              src={`http://localhost:5000${facturaSeleccionada.pdf_url}`}
              title="Factura PDF"
              width="100%"
              height="90%"
              style={{ border: '1px solid #ccc' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentos;
