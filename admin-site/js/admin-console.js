(function () {
  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.section');
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      sections.forEach((s) => s.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(tab.dataset.target);
      if (target) target.classList.add('active');
    })
  );

  // Services actions
  const servicesOutput = document.getElementById('servicesOutput');
  const servicesDynamicList = document.getElementById('servicesDynamicList');
  async function loadServices() {
    try {
      const res = await fetch('/admin/services/list', { credentials: 'include' });
      const data = await res.json();
      const names = Array.isArray(data.services)
        ? data.services
        : ['api-gateway', 'auth-service', 'product-service', 'frontend', 'admin-panel'];
      servicesDynamicList.innerHTML = names
        .map(
          (n) => `
        <label class="service"><input type="checkbox" name="svc" value="${n}" ${['api-gateway', 'auth-service', 'product-service'].includes(n) ? 'checked' : ''}> ${n}</label>
      `
        )
        .join('');
    } catch (e) {
      servicesDynamicList.textContent = 'No fue posible cargar servicios';
    }
  }
  loadServices();
  function getSelectedServices() {
    return Array.from(document.querySelectorAll('input[name="svc"]:checked')).map((i) => i.value);
  }
  async function runServiceAction(action) {
    servicesOutput.textContent = `Ejecutando acción: ${action}...`;
    try {
      const res = await fetch('/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, services: getSelectedServices() }),
      });
      const data = await res.json();
      servicesOutput.textContent = data.output || JSON.stringify(data, null, 2);
    } catch (e) {
      servicesOutput.textContent = `Error: ${e.message}`;
    }
  }
  document.querySelectorAll('#services [data-action]').forEach((btn) => {
    btn.addEventListener('click', () => runServiceAction(btn.dataset.action));
  });
  document.getElementById('restartMcp')?.addEventListener('click', async () => {
    servicesOutput.textContent = 'Reiniciando MCP...';
    const res = await fetch('/admin/mcp/restart', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    servicesOutput.textContent = data.output || JSON.stringify(data, null, 2);
  });

  // Presets
  document.getElementById('presetStartBasico')?.addEventListener('click', async () => {
    // Seleccionar básicos y hacer up -d
    Array.from(document.querySelectorAll('input[name="svc"]')).forEach((i) => {
      i.checked = ['api-gateway', 'auth-service', 'product-service'].includes(i.value);
    });
    runServiceAction('up');
  });
  document
    .getElementById('presetSmokeAhora')
    ?.addEventListener('click', () => runPipeline('smoke'));
  document.getElementById('presetRestartGateway')?.addEventListener('click', async () => {
    Array.from(document.querySelectorAll('input[name="svc"]')).forEach(
      (i) => (i.checked = i.value === 'api-gateway')
    );
    runServiceAction('restart');
  });
  document.getElementById('presetLogsGateway')?.addEventListener('click', () => {
    const sel = document.getElementById('logTarget');
    sel.value = 'api-gateway';
    fetchLogs();
  });

  // Pipelines
  const pipelineOutput = document.getElementById('pipelineOutput');
  async function runPipeline(name) {
    pipelineOutput.textContent = `Ejecutando pipeline: ${name}...`;
    try {
      const res = await fetch('/admin/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      pipelineOutput.textContent = data.output || JSON.stringify(data, null, 2);
    } catch (e) {
      pipelineOutput.textContent = `Error: ${e.message}`;
    }
  }
  document.querySelectorAll('#pipelines [data-pipe]').forEach((btn) => {
    btn.addEventListener('click', () => runPipeline(btn.dataset.pipe));
  });

  // Logs
  const logsOutput = document.getElementById('logsOutput');
  const fetchLogsBtn = document.getElementById('fetchLogs');
  const logTargetSel = document.getElementById('logTarget');
  const logLinesInp = document.getElementById('logLines');
  const autoRefreshChk = document.getElementById('autoRefresh');
  const liveSSE = document.getElementById('liveSSE');
  let logsTimer;
  let sse;
  async function fetchLogs() {
    logsOutput.textContent = 'Cargando logs...';
    const target = logTargetSel.value;
    const lines = parseInt(logLinesInp.value, 10) || 200;
    try {
      const res = await fetch(`/admin/logs?target=${encodeURIComponent(target)}&lines=${lines}`, {
        credentials: 'include',
      });
      const data = await res.json();
      logsOutput.textContent = data.output || JSON.stringify(data, null, 2);
      logsOutput.scrollTop = logsOutput.scrollHeight;
    } catch (e) {
      logsOutput.textContent = `Error: ${e.message}`;
    }
  }
  fetchLogsBtn.addEventListener('click', fetchLogs);
  autoRefreshChk.addEventListener('change', () => {
    clearInterval(logsTimer);
    if (autoRefreshChk.checked) {
      fetchLogs();
      logsTimer = setInterval(fetchLogs, 5000);
    }
  });
  function stopSSE() {
    if (sse) {
      sse.close();
      sse = null;
    }
  }
  liveSSE.addEventListener('change', () => {
    stopSSE();
    if (liveSSE.checked) {
      logsOutput.textContent = '[Live] Conectando...';
      const target = logTargetSel.value;
      sse = new EventSource(`/admin/logs/stream?target=${encodeURIComponent(target)}`);
      sse.onmessage = (e) => {
        logsOutput.textContent += (logsOutput.textContent ? '\n' : '') + e.data;
        logsOutput.scrollTop = logsOutput.scrollHeight;
      };
      sse.onerror = () => {
        logsOutput.textContent += '\n[Live] error de conexión';
      };
    }
  });
  logTargetSel.addEventListener('change', () => {
    if (liveSSE.checked) {
      liveSSE.checked = false;
      stopSSE();
    }
  });

  // Problems list
  async function loadProblems() {
    try {
      const res = await fetch('/admin/problems', { credentials: 'include' });
      const data = await res.json();
      const container = document.getElementById('problemsList');
      if (!Array.isArray(data.items)) {
        container.textContent = 'Sin datos.';
        return;
      }
      container.innerHTML = data.items
        .map(
          (p) => `
        <div class="card" style="margin:6px 0">
          <div class="row" style="justify-content:space-between">
            <div><strong>#${p.id}</strong> - ${p.title} <span style="color:${p.status === 'open' ? '#f59e0b' : '#10b981'}">(${p.status})</span></div>
            <div class="actions">
              ${p.quickFix ? `<button class="btn btn-outline" data-fix="${p.quickFix}">Resolver</button>` : ''}
            </div>
          </div>
          <div style="font-size:.9rem;color:#6b7280">${p.description || ''}</div>
        </div>
      `
        )
        .join('');
      container.querySelectorAll('[data-fix]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = 'Ejecutando...';
          const res2 = await fetch('/admin/quick-fix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: btn.dataset.fix }),
          });
          const data2 = await res2.json();
          alert(data2.message || 'Listo');
          btn.disabled = false;
          btn.textContent = 'Resolver';
        });
      });
    } catch (e) {
      document.getElementById('problemsList').textContent = 'Error cargando problemas';
    }
  }

  // Status refresh
  document.getElementById('refreshStatus')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/admin/status', { credentials: 'include' });
      const data = await res.json();
      alert(`Estado:\n${JSON.stringify(data, null, 2)}`);
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  });

  // Initial auto-load
  loadProblems();
})();
