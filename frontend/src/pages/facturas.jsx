import React, { useState, useRef, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import { comunas } from './comunas'; // Asegúrate de tener este archivo
import SHA256 from 'crypto-js/sha256';

const formatearRut = (rutSinFormato) => {
  let rut = rutSinFormato.replace(/[^\dkK]/g, '').toUpperCase();
  if (rut.length === 0) return '';
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  const cuerpoConPuntos = cuerpo
    .split('')
    .reverse()
    .reduce((acc, digit, i) => digit + (i > 0 && i % 3 === 0 ? '.' : '') + acc, '');
  return cuerpoConPuntos + '-' + dv;
};


const validarRut = (rutCompleto) => {
  if (!rutCompleto || rutCompleto.indexOf('-') === -1) return false;
  const [rut, dv] = rutCompleto.replace(/\./g, '').split('-');
  let suma = 0, multiplo = 2;
  for (let i = rut.length - 1; i >= 0; i--) {
    suma += multiplo * parseInt(rut[i]);
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  return dv.toUpperCase() === dvCalculado;
};


const guiaPorPaso = {
  1: "Ingrese los datos del Emisor...",
  2: "Ingrese los datos del Receptor...",
  3: "Agregue los productos o servicios...",
  4: "Revise los totales...",
  5: "Confirme la factura y envíe..."
};


const FacturaInteractiva = () => {
  const [paso, setPaso] = useState(1);
  const facturaRef = useRef(null);
  const [moneda, setMoneda] = useState('CLP');
  const [emisor, setEmisor] = useState({ rut: '', razonSocial: '', giro: '', direccion: '', comuna: '' });
  const [receptor, setReceptor] = useState({ rut: '', razonSocial: '', giro: '', direccion: '', comuna: '' });
  const [items, setItems] = useState([{ descripcion: '', cantidad: 1, precioUnitario: 0 }]);

  const handleChange = (setter, e) => {
    const { name, value } = e.target;
    const nuevoValor = name === 'rut' ? formatearRut(value) : value;
    setter(prev => ({ ...prev, [name]: nuevoValor }));
  };

  const [numeroFactura, setNumeroFactura] = useState('FAC-2025-0001'); // número de factura falso fijo

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const agregarItem = () => setItems([...items, { descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  const quitarItem = (index) => setItems(items.filter((_, i) => i !== index));

  const [neto, iva, total] = useMemo(() => {
    const net = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
    const ivaCalc = net * 0.19;
    return [net, ivaCalc, net + ivaCalc];
  }, [items]);

  const formatoMoneda = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2
  });

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

  const handleAnterior = () => paso > 1 && setPaso(paso - 1);

  const fechaEmision = new Date().toLocaleDateString('es-CL');

  const generarTimbre = () => {
    const base = `${emisor.rut}|${receptor.rut}|${total}|${fechaEmision}`;
    const hash = SHA256(base).toString().substring(0, 24); // hash corto
    return hash;
  };

  const handleEnviar = async () => {
    try {
      const response = await fetch('http://localhost:5000/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          descripcion: items.map(i => i.descripcion).join(', '),
          monto: total,
          timbre: generarTimbre(),
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNumeroFactura(data.numero_factura);  // actualizar número factura
        alert("Factura registrada y PDF generado.");
        handleDescargarPDF();
      } else {
        alert("Error al enviar factura: " + data.msg);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
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
    backgroundColor: '#fefefe',
    color: '#333'
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
    <h4>Moneda de la Factura</h4>
        <select value={moneda} onChange={(e) => setMoneda(e.target.value)} style={inputStyle}>
          <option value="CLP">CLP - Peso Chileno</option>
          <option value="USD">USD - Dólar estadounidense</option>
          <option value="EUR">EUR - Euro</option>
          <option value="BRL">BRL - Real brasileño</option>
          <option value="ARS">ARS - Peso argentino</option>
          <option value="GBP">GBP - Libra esterlina</option>
          <option value="JPY">JPY - Yen japonés</option>
          <option value="CNY">CNY - Yuan chino</option>
          <option value="CAD">CAD - Dólar canadiense</option>
          <option value="AUD">AUD - Dólar australiano</option>
          <option value="CHF">CHF - Franco suizo</option>
          <option value="MXN">MXN - Peso mexicano</option>
          <option value="KRW">KRW - Won surcoreano</option>
          <option value="INR">INR - Rupia india</option>
          <option value="PEN">PEN - Sol peruano</option>
          <option value="UYU">UYU - Peso uruguayo</option>
        </select>

        <h3 style={{ marginTop: 20 }}>Detalle de Productos/Servicios</h3>
        {items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: 10, border: '1px solid #ccc', padding: 10, borderRadius: 5 }}>
            <input
              placeholder="Descripción"
              value={item.descripcion}
              onChange={e => handleItemChange(idx, 'descripcion', e.target.value)}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Cantidad"
              min={1}
              value={item.cantidad}
              onChange={e => handleItemChange(idx, 'cantidad', parseInt(e.target.value))}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Precio Unitario"
              min={0}
              value={item.precioUnitario}
              onChange={e => handleItemChange(idx, 'precioUnitario', parseFloat(e.target.value))}
              style={inputStyle}
            />
            <span style={{ marginLeft: 10 }}>
              {formatoMoneda.format(item.cantidad * item.precioUnitario || 0)}
            </span>
            <button
              type="button"
              onClick={() => quitarItem(idx)}
              style={{ marginLeft: 10, color: 'red' }}
            >
              Eliminar
            </button>
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
          <div ref={facturaRef} style={{
            backgroundColor: '#fff',
            padding: 20,
            border: '1px solid #ccc',
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#000',
            position: 'relative'
          }}>
          {/* Logo SII visible en la factura */}
          <img
            src="/sii.png"
            alt="Logo SII"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 100,
              opacity: 0.9
            }}
          />

            <h2 style={{ textAlign: 'center' }}>Factura Electrónica</h2>
            <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
              Número de factura: {numeroFactura}
            </p>
            <p><strong>Fecha de emisión:</strong> {fechaEmision}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ width: '48%' }}>
                <h4>Emisor</h4>
                <p><strong>Razón Social:</strong> {emisor.razonSocial}</p>
                <p><strong>RUT:</strong> {emisor.rut}</p>
                <p><strong>Giro:</strong> {emisor.giro}</p>
                <p><strong>Dirección:</strong> {emisor.direccion}, {emisor.comuna}</p>
              </div>
              <div style={{ width: '48%' }}>
                <h4>Receptor</h4>
                <p><strong>Razón Social:</strong> {receptor.razonSocial}</p>
                <p><strong>RUT:</strong> {receptor.rut}</p>
                <p><strong>Giro:</strong> {receptor.giro}</p>
                <p><strong>Dirección:</strong> {receptor.direccion}, {receptor.comuna}</p>
              </div>
            </div>

             <h4>Detalle</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr style={{ background: '#eee' }}>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Descripción</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Cantidad</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Precio Unitario</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{item.descripcion}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'right' }}>{formatoMoneda.format(item.precioUnitario)}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'right' }}>
                      {formatoMoneda.format(item.cantidad * item.precioUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginRight: 10 }}>
              <p><strong>Neto:</strong> {formatoMoneda.format(neto)}</p>
              <p><strong>IVA (19%):</strong> {formatoMoneda.format(iva)}</p>
              <p><strong>Total a pagar:</strong> {formatoMoneda.format(total)}</p>
            </div>

             {/* Pie legal */}
            <footer style={{ marginTop: 20, fontSize: 12, color: '#555', borderTop: '1px solid #ccc', paddingTop: 10 }}>
              Documento emitido electrónicamente conforme a la normativa del Servicio de Impuestos Internos (SII).<br />
              Contacto emisor: contacto@empresa.cl
            </footer>

            {/* Timbre electrónico - código QR */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <p><strong>Timbre electrónico:</strong> {generarTimbre()}</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generarTimbre())}`}
                alt="QR Timbre electrónico"
                style={{ margin: 'auto', display: 'block' }}
              />
            </div>

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
