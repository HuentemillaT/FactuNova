/*frontend/pages/gastos.jsx */
import React, { useState, useEffect } from 'react';
import '../App.css';
import { construirTasasCambio } from './tasas_cambio';

const monedas = [
  { code: 'USD', name: 'Dólar estadounidense' },
  { code: 'EUR', name: 'Euro' },
  { code: 'CLP', name: 'Peso chileno' },
  { code: 'ARS', name: 'Peso argentino' },
  { code: 'MXN', name: 'Peso mexicano' },
  { code: 'GBP', name: 'Libra esterlina' },
  { code: 'JPY', name: 'Yen japonés' },
  { code: 'CNY', name: 'Yuan chino' },
  { code: 'BRL', name: 'Real brasileño' },
  { code: 'CAD', name: 'Dólar canadiense' },
  { code: 'AUD', name: 'Dólar australiano' },
];

function Gastos() {
  const [tasasCambio, setTasasCambio] = useState(null);
  const [ingresoTotalNumerico, setIngresoTotalNumerico] = useState(0);
  const [moneda, setMoneda] = useState('CLP');
  const [monedaAnterior, setMonedaAnterior] = useState('CLP');

  const [gastos, setGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({
    descripcion: '',
    monto: '',
    categoria: '',
    fecha: '',
    moneda: 'CLP',
  });

  // ✅ Actualiza la moneda del nuevo gasto cuando cambia la moneda principal
  useEffect(() => {
    setNuevoGasto((prev) => ({ ...prev, moneda }));
  }, [moneda]);

  useEffect(() => {
    async function fetchTasas() {
      try {
        const res = await fetch('/tasas.json');
        if (!res.ok) throw new Error('No se pudo cargar el archivo JSON');
        const data = await res.json();
        const tasas = construirTasasCambio(data);
        setTasasCambio(tasas);
      } catch (error) {
        console.error('Error al obtener tasas de cambio:', error);
      }
    }
    fetchTasas();
  }, []);

  const manejarIngresoTotal = (e) => {
    const valor = e.target.value.replace(/\D/g, '');
    const numero = parseFloat(valor || 0);
    setIngresoTotalNumerico(numero);
  };

  const handleMonedaChange = (e) => {
    if (!tasasCambio) return;
    const nuevaMoneda = e.target.value;
    const tasa = tasasCambio[monedaAnterior]?.[nuevaMoneda] || 1;
    const nuevoIngreso = ingresoTotalNumerico * tasa;

    setIngresoTotalNumerico(nuevoIngreso);
    setMoneda(nuevaMoneda);
    setMonedaAnterior(nuevaMoneda);
  };

  const handleAgregarGasto = () => {
    const { descripcion, monto, categoria, fecha, moneda: monedaGasto } = nuevoGasto;
    if (!descripcion || !monto) return;

    setGastos([...gastos, {
      descripcion,
      monto: parseFloat(monto),
      categoria,
      fecha,
      moneda: monedaGasto || moneda,
    }]);

    setNuevoGasto({
      descripcion: '',
      monto: '',
      categoria: '',
      fecha: '',
      moneda,
    });
  };

  const totalGastos = gastos.reduce((acc, gasto) => {
    if (!tasasCambio) return acc;
    const tasa = tasasCambio[gasto.moneda]?.[moneda] || 1;
    return acc + gasto.monto * tasa;
  }, 0);

  const balance = ingresoTotalNumerico - totalGastos;

  const guardarResumen = async () => {
  const resumen = {
      ingreso_total: ingresoTotalNumerico,
      total_gastos: totalGastos,
      balance: balance,
      moneda: moneda
    };

    try {
      const res = await fetch('http://localhost:5000/api/resumen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}` // si usas JWT
        },
        credentials: "include",
        body: JSON.stringify(resumen)
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error('Error al guardar resumen:', error);
    }
  };

  return (
    <div className="gasto-container">
      <h1 className="gasto-title">Control de Gastos</h1>

      <div className="gasto-group">
        <label>Ingreso Total</label>
        <input
          type="text"
          className="gasto-input"
          value={ingresoTotalNumerico.toLocaleString(undefined, { style: 'currency', currency: moneda })}
          onChange={manejarIngresoTotal}
          placeholder="Ej: 1.000.000"
        />
      </div>

      <div className="gasto-group">
        <label>Moneda</label>
        <select className="gasto-input" value={moneda} onChange={handleMonedaChange} disabled={!tasasCambio}>
          {monedas.map((m) => (
            <option key={m.code} value={m.code}>
              {m.name} ({m.code})
            </option>
          ))}
        </select>
      </div>

      <hr />

      <h2>Agregar Gasto</h2>
      <div className="gasto-group">
        <label>Descripción</label>
        <input
          className="gasto-input"
          type="text"
          value={nuevoGasto.descripcion}
          onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
        />
      </div>
      <div className="gasto-group">
        <label>Monto</label>
        <input
          className="gasto-input"
          type="text"
          value={Number(nuevoGasto.monto || 0).toLocaleString(undefined, {
            style: 'currency',
            currency: moneda,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            setNuevoGasto({ ...nuevoGasto, monto: raw });
          }}
        />
      </div>
      <div className="gasto-group">
        <label>Moneda del Gasto</label>
        <select
          className="gasto-input"
          value={nuevoGasto.moneda || moneda}
          onChange={(e) => setNuevoGasto({ ...nuevoGasto, moneda: e.target.value })}
        >
          {monedas.map((m) => (
            <option key={m.code} value={m.code}>
              {m.name} ({m.code})
            </option>
          ))}
        </select>
      </div>
      <div className="gasto-group">
        <label>Categoría</label>
        <input
          className="gasto-input"
          type="text"
          value={nuevoGasto.categoria}
          onChange={(e) => setNuevoGasto({ ...nuevoGasto, categoria: e.target.value })}
        />
      </div>
      <div className="gasto-group">
        <label>Fecha</label>
        <input
          className="gasto-input"
          type="date"
          value={nuevoGasto.fecha}
          onChange={(e) => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })}
        />
      </div>
      <button className="gasto-btn" onClick={handleAgregarGasto}>
        Agregar Gasto
      </button>

      <hr />

      <h2>Resumen</h2>
      <p><strong>Ingreso Total:</strong> {ingresoTotalNumerico.toLocaleString(undefined, { style: 'currency', currency: moneda })}</p>
      <p><strong>Total Gastos:</strong> {totalGastos.toLocaleString(undefined, { style: 'currency', currency: moneda })}</p>
      <p><strong>Balance:</strong> {balance.toLocaleString(undefined, { style: 'currency', currency: moneda })}</p>

      <h2>Gastos Registrados</h2>
      <table className="gasto-table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Moneda</th>
            <th>Categoría</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((gasto, index) => (
            <tr key={index}>
              <td>{gasto.descripcion}</td>
              <td>
                {typeof gasto.monto === 'number' && gasto.moneda
                  ? gasto.monto.toLocaleString(undefined, {
                      style: 'currency',
                      currency: gasto.moneda,
                    })
                  : gasto.monto}
              </td>
              <td>{gasto.moneda}</td>
              <td>{gasto.categoria}</td>
              <td>{gasto.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='guardar'>
          <button
          className="gasto-btn"
          onClick={async () => {
            try {
              const token = localStorage.getItem('authToken'); 
              console.log(token);
              const res = await fetch('http://localhost:5000/api/resumen', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ingreso_total: ingresoTotalNumerico,
                  total_gastos: totalGastos,
                  balance: balance,
                  moneda: moneda,
                }),
              });

              const data = await res.json();
              alert(data.message || 'Resumen guardado');
            } catch (error) {
              console.error('Error al guardar el resumen:', error);
              alert('Error al guardar resumen');
            }
          }}
        >
          Guardar Resumen
        </button>
      </div>
    </div>  
    
  );
}

export default Gastos;
