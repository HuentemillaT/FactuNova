// tasas_cambio.js
export function construirTasasCambio(data) {
  const quotes = data.quotes;

  const monedas = ["USD", "CLP", "EUR", "ARS", "MXN", "GBP", "JPY", "CNY", "BRL", "CAD", "AUD"];

  // Construir objeto USD → moneda
  const usdTo = { USD: 1 };
  monedas.forEach(moneda => {
    if (moneda !== "USD") {
      const key = "USD" + moneda;
      usdTo[moneda] = quotes[key];
    }
  });

  // Construir tasasCambio: monA -> monB
  const tasasCambio = {};
  monedas.forEach(monA => {
    tasasCambio[monA] = {};
    monedas.forEach(monB => {
      if (usdTo[monA] && usdTo[monB]) {
        tasasCambio[monA][monB] = usdTo[monB] / usdTo[monA];
      } else {
        tasasCambio[monA][monB] = monA === monB ? 1 : 0;
      }
    });
  });

  return tasasCambio;
}
