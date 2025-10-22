(function(){
  const outProd = document.getElementById('prodOutput');
  const outPromo = document.getElementById('promoOutput');

  async function getProduct(id){
    try {
      const res = await fetch(`/api/worker/products/${encodeURIComponent(id)}`, { credentials: 'include' });
      const data = await res.json();
      outProd.textContent = JSON.stringify(data, null, 2);
    } catch (e) { outProd.textContent = 'Error: ' + e.message; }
  }
  async function updateProduct(id, payload){
    try {
      const res = await fetch(`/api/worker/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      outProd.textContent = JSON.stringify(data, null, 2);
    } catch (e) { outProd.textContent = 'Error: ' + e.message; }
  }

  async function createPromotion(name, discount, filter){
    try {
      const res = await fetch('/api/worker/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, discount: Number(discount), filter })
      });
      const data = await res.json();
      outPromo.textContent = JSON.stringify(data, null, 2);
    } catch (e) { outPromo.textContent = 'Error: ' + e.message; }
  }

  document.getElementById('btnGet').addEventListener('click', () => {
    const id = document.getElementById('prodId').value.trim();
    if (!id) { outProd.textContent = 'Ingresa un ID de producto'; return; }
    getProduct(id);
  });
  document.getElementById('btnUpdate').addEventListener('click', () => {
    const id = document.getElementById('prodId').value.trim();
    if (!id) { outProd.textContent = 'Ingresa un ID de producto'; return; }
    const payloadRaw = document.getElementById('prodPayload').value.trim();
    try { const payload = payloadRaw ? JSON.parse(payloadRaw) : {}; updateProduct(id, payload); }
    catch { outProd.textContent = 'JSON inválido'; }
  });

  document.getElementById('btnCreatePromo').addEventListener('click', () => {
    const name = document.getElementById('promoName').value.trim();
    const discount = document.getElementById('promoDiscount').value.trim();
    const filterRaw = document.getElementById('promoFilter').value.trim();
    try { const filter = filterRaw ? JSON.parse(filterRaw) : {}; createPromotion(name, discount, filter); }
    catch { outPromo.textContent = 'JSON inválido'; }
  });
})();
