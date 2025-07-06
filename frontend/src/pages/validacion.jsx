import React, { useState, useEffect } from 'react';
import '../App.css';

function Validacion() {
  const [facturaId, setFacturaId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [facturas, setFacturas] = useState([]);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    // Traer facturas al cargar el componente
    const fetchFacturas = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/facturas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          // Filtrar solo las facturas con estado pendiente o proceso
          const facturasFiltradas = data.filter(f => f.status === 'pendiente' || f.status === 'proceso');
          setFacturas(facturasFiltradas);
          if (facturasFiltradas.length > 0) setFacturaId(facturasFiltradas[0].id); // Seleccionar la primera por defecto
        } else {
          setMensaje('Error al cargar facturas');
        }
      } catch (error) {
        console.error('Error al cargar facturas:', error);
        setMensaje('Error de conexión al cargar facturas');
      }
    };

    fetchFacturas();
  }, [token]);

  const solicitarCodigo = async () => {
    if (!facturaId) {
      setMensaje('Por favor selecciona una factura');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/solicitar-codigo/${facturaId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMensaje('✅ Código enviado al correo');
      } else {
        const data = await res.json();
        setMensaje(`❌ Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error al solicitar código:', error);
      setMensaje('❌ Error de conexión');
    }
  };

  const verificarCodigo = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/verificar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ factura_id: facturaId, codigo }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje('✅ Factura validada y enviada con éxito');
      } else {
        setMensaje(`❌ Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
      setMensaje('❌ Error de conexión');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
      <h2>Validar Factura</h2>

      <label>Selecciona factura:</label>
      <select
        className='valida'
        value={facturaId}
        onChange={(e) => setFacturaId(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {facturas.map(f => (
          <option key={f.id} value={f.id}>
            {f.numero_factura} - {f.descripcion}
          </option>
        ))}
      </select>

      <button className='buttonV' onClick={solicitarCodigo} style={{ marginBottom: '1rem' }}>
        Solicitar Código
      </button>

      <br />

      <label>Ingresa el Código:</label>
      <input
        className='valida'
        type="text"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Ej: 123456"
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <button className='buttonV' onClick={verificarCodigo}>Verificar Código</button>

      {mensaje && (
        <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          {mensaje}
        </div>
      )}
    </div>
  );
}

export default Validacion;
