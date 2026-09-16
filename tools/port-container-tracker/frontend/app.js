const chartInstances = new Map();

function renderChart(canvas, config) {
  chartInstances.get(canvas)?.destroy();
  chartInstances.set(canvas, new Chart(canvas, config));
}

// Port Container Tracker — Dashboard Logic
// Simulates live terminal data feed (in production: fetched from TOS REST API)

const DATA = {
  kpis: { teu: 2847, vessels: 4, dwellDays: 4.3, gateTx: 1203 },
  throughput: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    import: [1820, 2100, 1950, 2400, 2847, 2200, 1650],
    export: [1400, 1780, 1600, 2050, 2310, 1900, 1400]
  },
  occupancy: {
    labels: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'],
    values: [78, 91, 55, 67, 83]
  },
  turnaround: {
    labels: ['MSC Allegra', 'OOCL HK', 'Cosco Star', 'Evergreen E'],
    values: [18.4, 22.1, 14.7, 19.8]
  },
  alerts: [
    { id: 'CSNU7402841', size: '40HC', location: 'A-14-03', arrival: '2026-05-20', dwell: 8.2, status: 'critical' },
    { id: 'TCKU3291055', size: '20GP', location: 'C-07-11', arrival: '2026-05-22', dwell: 6.1, status: 'critical' },
    { id: 'OOLU8814423', size: '40HC', location: 'B-02-05', arrival: '2026-05-24', dwell: 4.8, status: 'warning' },
    { id: 'MSCU4401872', size: '20GP', location: 'D-11-08', arrival: '2026-05-25', dwell: 3.9, status: 'warning' },
    { id: 'HLXU2290034', size: '40RF', location: 'E-03-02', arrival: '2026-05-26', dwell: 2.1, status: 'ok' },
  ]
};

const CHART_DEFAULTS = {
  color: {
    accent: '#388bfd',
    positive: '#3fb950',
    warning: '#d29922',
    muted: '#8b949e',
    grid: 'rgba(48,54,61,0.8)'
  }
};

// --- Init ---
function init() {
  renderKPIs();
  renderThroughputChart();
  renderOccupancyChart();
  renderTurnaroundChart();
  renderAlerts();
  startClock();
  simulateLiveUpdates();
}

function renderKPIs() {
  animateCount('teu-count', DATA.kpis.teu, '');
  animateCount('vessel-count', DATA.kpis.vessels, '');
  document.getElementById('dwell-time').textContent = DATA.kpis.dwellDays + ' days';
  animateCount('gate-count', DATA.kpis.gateTx, '');
}

function animateCount(id, target, suffix) {
  const el = document.getElementById(id);
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current).toLocaleString() + suffix;
    if (current >= target) clearInterval(timer);
  }, 16);
}

function renderThroughputChart() {
  const ctx = document.getElementById('throughputChart').getContext('2d');
  renderChart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.throughput.labels,
      datasets: [
        {
          label: 'Import (TEU)',
          data: DATA.throughput.import,
          backgroundColor: 'rgba(56,139,253,0.7)',
          borderRadius: 4
        },
        {
          label: 'Export (TEU)',
          data: DATA.throughput.export,
          backgroundColor: 'rgba(63,185,80,0.6)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8b949e', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#8b949e' }, grid: { color: CHART_DEFAULTS.color.grid } },
        y: { ticks: { color: '#8b949e' }, grid: { color: CHART_DEFAULTS.color.grid } }
      }
    }
  });
}

function renderOccupancyChart() {
  const ctx = document.getElementById('occupancyChart').getContext('2d');
  const colors = DATA.occupancy.values.map(v =>
    v > 85 ? 'rgba(248,81,73,0.7)' : v > 70 ? 'rgba(210,153,34,0.7)' : 'rgba(63,185,80,0.7)'
  );
  renderChart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.occupancy.labels,
      datasets: [{ label: 'Occupancy %', data: DATA.occupancy.values, backgroundColor: colors, borderRadius: 4 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { max: 100, ticks: { color: '#8b949e', callback: v => v + '%' }, grid: { color: CHART_DEFAULTS.color.grid } },
        y: { ticks: { color: '#8b949e' }, grid: { display: false } }
      }
    }
  });
}

function renderTurnaroundChart() {
  const ctx = document.getElementById('turnaroundChart').getContext('2d');
  renderChart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.turnaround.labels,
      datasets: [{ label: 'Hours', data: DATA.turnaround.values, backgroundColor: 'rgba(56,139,253,0.65)', borderRadius: 4 }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        annotation: { annotations: { line: { type: 'line', yMin: 20, yMax: 20, borderColor: '#f85149', borderWidth: 1.5, label: { content: 'SLA 20h', display: true } } } }
      },
      scales: {
        x: { ticks: { color: '#8b949e', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#8b949e', callback: v => v + 'h' }, grid: { color: CHART_DEFAULTS.color.grid } }
      }
    }
  });
}

function renderAlerts() {
  const tbody = document.getElementById('alerts-body');
  tbody.innerHTML = DATA.alerts.map(c => `
    <tr>
      <td><code>${c.id}</code></td>
      <td>${c.size}</td>
      <td>${c.location}</td>
      <td>${c.arrival}</td>
      <td style="font-weight:600; color:${c.dwell > 6 ? '#f85149' : c.dwell > 4 ? '#d29922' : '#3fb950'}">${c.dwell}</td>
      <td><span class="status-pill status-${c.status}">${c.status.toUpperCase()}</span></td>
    </tr>
  `).join('');
}

function startClock() {
  const el = document.getElementById('live-clock');
  const update = () => el.textContent = new Date().toLocaleTimeString('nl-BE');
  update();
  setInterval(update, 1000);
}

function simulateLiveUpdates() {
  setInterval(() => {
    DATA.kpis.teu += Math.floor(Math.random() * 5);
    DATA.kpis.gateTx += Math.floor(Math.random() * 3);
    document.getElementById('teu-count').textContent = DATA.kpis.teu.toLocaleString();
    document.getElementById('gate-count').textContent = DATA.kpis.gateTx.toLocaleString();
  }, 4000);
}

document.addEventListener('DOMContentLoaded', init);
