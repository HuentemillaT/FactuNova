// FacturaInteractiva.jsx
import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { comunas } from './comunas'; // Asegúrate de tener este archivo con todas las comunas de Chile

// Función para validar RUT (simple)
const validarRut = (rut) => {
  return rut && rut.length >= 8;
};

const guiaPorPaso = {
  1: "Ingrese los datos del Emisor. El RUT debe ser válido y corresponde al vendedor registrado en el SII.",
  2: "Ingrese los datos del Receptor. El RUT debe ser válido. Si el cliente es extranjero, puede usar RUT falso con 99999999-9.",
  3: "Agregue los productos o servicios. Cada línea debe tener descripción clara, cantidad y precio unitario.",
  4: "Revise los totales: el monto neto, IVA (19%) y el total final. Según el SII, debe calcularse correctamente.",
  5: "Confirme la factura y envíe. Una vez confirmada, podrá descargar la factura en PDF."
};

const FacturaInteractiva = () => {
  const [paso, setPaso] = useState(1);
  const facturaRef = useRef(null);

  const [emisor, setEmisor] = useState({
    rut: '', razonSocial: '', giro: '', direccion: '', comuna: ''
  });
  const [receptor, setReceptor] = useState({
    rut: '', razonSocial: '', giro: '', direccion: '', comuna: ''
  });
  const [items, setItems] = useState([
    { descripcion: '', cantidad: 1, precioUnitario: 0 }
  ]);

  const handleChange = (setter, e) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const agregarItem = () => setItems([...items, { descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  const quitarItem = (index) => setItems(items.filter((_, i) => i !== index));

  const neto = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
  const iva = neto * 0.19;
  const total = neto + iva;

  const puedeAvanzar = () => {
    switch (paso) {
      case 1:
        return validarRut(emisor.rut) && emisor.razonSocial.trim() !== '';
      case 2:
        return validarRut(receptor.rut) && receptor.razonSocial.trim() !== '';
      case 3:
        return items.length > 0 && items.every(i => i.descripcion.trim() !== '' && i.cantidad > 0 && i.precioUnitario >= 0);
      case 4:
        return total > 0;
      default:
        return true;
    }
  };

  const handleSiguiente = () => {
    if (puedeAvanzar()) setPaso(paso + 1);
    else alert("Por favor completa correctamente los campos requeridos.");
  };

  const handleAnterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const handleEnviar = async () => {
    alert("Factura generada correctamente. Puedes descargar el PDF.");
    handleDescargarPDF();
  };

  const handleDescargarPDF = () => {
    html2pdf().from(facturaRef.current).set({
      margin: 10,
      filename: 'factura.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  };

  const inputStyle = {
  padding: '8px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  backgroundColor: '#fefefe', // o 'transparent', '#fff', '#fdfaf0', etc.
  color: '#333', // Aquí defines el color del texto (puede ser '#fff' para blanco)
};


  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(p => (
            <div
              key={p}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: 10,
                background: p === paso ? '#007bff' : '#ccc',
                color: p === paso ? 'white' : 'black',
                borderRadius: 5,
                margin: '0 5px',
                fontWeight: p === paso ? 'bold' : 'normal',
                fontSize: 14
              }}
            >
              Paso {p}
            </div>
          ))}
        </div>
      <h2>Crear Factura Electrónica (SII Chile 2025)</h2>
      <p style={{ background: '#eef', padding: 10, borderRadius: 5 }}>{guiaPorPaso[paso]}</p>

      {paso === 1 && (
        <>
          <h3>Datos del Emisor</h3>
          <input name="rut" placeholder="RUT Emisor" value={emisor.rut} onChange={e => handleChange(setEmisor, e)}   style={inputStyle} />
          <input name="razonSocial" placeholder="Razón Social" value={emisor.razonSocial} onChange={e => handleChange(setEmisor, e)}   style={inputStyle} />
          <input name="giro" placeholder="Giro" value={emisor.giro} onChange={e => handleChange(setEmisor, e)}   style={inputStyle} />
          <input name="direccion" placeholder="Dirección" value={emisor.direccion} onChange={e => handleChange(setEmisor, e)}   style={inputStyle}/>
          <select name="comuna" value={emisor.comuna} onChange={e => handleChange(setEmisor, e)}   style={inputStyle}>
            <option value="">Seleccione comuna</option>
            {comunas.map((c, i) => <option key={i} value={c}>{c}</option>)} 
          </select>
        </>
      )}

      {paso === 2 && (
        <>
          <h3>Datos del Receptor</h3>
          <input name="rut" placeholder="RUT Receptor" value={receptor.rut} onChange={e => handleChange(setReceptor, e)}   style={inputStyle}/>
          <input name="razonSocial" placeholder="Razón Social" value={receptor.razonSocial} onChange={e => handleChange(setReceptor, e)}   style={inputStyle}/>
          <input name="giro" placeholder="Giro" value={receptor.giro} onChange={e => handleChange(setReceptor, e)}   style={inputStyle}/>
          <input name="direccion" placeholder="Dirección" value={receptor.direccion} onChange={e => handleChange(setReceptor, e)}   style={inputStyle}/>
          <select name="comuna" value={receptor.comuna} onChange={e => handleChange(setReceptor, e)}   style={inputStyle}>
            <option value="">Seleccione comuna</option>
            {comunas.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </>
      )}

      {paso === 3 && (
        <>
          <h3>Detalle de Productos/Servicios</h3>
          {items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 10, border: '1px solid #ccc', padding: 10, borderRadius: 5 }}>
              <input placeholder="Descripción" value={item.descripcion} onChange={e => handleItemChange(idx, 'descripcion', e.target.value)}   style={inputStyle}/>
              <input type="number" placeholder="Cantidad" min={1} value={item.cantidad} onChange={e => handleItemChange(idx, 'cantidad', parseInt(e.target.value))}   style={inputStyle}/>
              <input type="number" placeholder="Precio Unitario" min={0} value={item.precioUnitario} onChange={e => handleItemChange(idx, 'precioUnitario', parseFloat(e.target.value))}   style={inputStyle}/>
              <button type="button" onClick={() => quitarItem(idx)} style={{ marginLeft: 10, color: 'red' }}>Eliminar</button>
            </div>
          ))}
          <button type="button" onClick={agregarItem}>+ Agregar Ítem</button>
        </>
      )}

      {paso === 4 && (
        <>
          <h3>Totales</h3>
          <p>Neto: ${neto.toFixed(2)}</p>
          <p>IVA (19%): ${iva.toFixed(2)}</p>
          <p><strong>Total: ${total.toFixed(2)}</strong></p>
        </>
      )}

      {paso === 5 && (
        <>
          <div ref={facturaRef} style={{ backgroundColor: '#fdfdfd', padding: 20 }}>
            <h3>Factura Electrónica</h3>
            <p><strong>Emisor:</strong> {emisor.razonSocial} (RUT: {emisor.rut})</p>
            <p><strong>Receptor:</strong> {receptor.razonSocial} (RUT: {receptor.rut})</p>
            <h4>Detalle</h4>
            <ul>
              {items.map((item, idx) => (
                <li key={idx}>{item.descripcion} - {item.cantidad} x ${item.precioUnitario.toFixed(2)}</li>
              ))}
            </ul>
            <p><strong>Total a pagar:</strong> ${total.toFixed(2)}</p>
          </div>

          <button onClick={handleEnviar}>Enviar y Descargar PDF</button>
        </>
      )}

      <div style={{ marginTop: 20 }}>
        {paso > 1 && <button onClick={handleAnterior}>Anterior</button>}
        {paso < 5 && <button onClick={handleSiguiente} style={{ marginLeft: 10 }}>Siguiente</button>}
      </div>
    </div>
  );
};

export default FacturaInteractiva;
