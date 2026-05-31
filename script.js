/* ══════════════════════════════════════════════════════════════
   AGENDA SEMANAL
══════════════════════════════════════════════════════════════ */
(function initAgenda() {

  /* ── Dados fictícios por dia da semana (0 = seg … 6 = dom) ── */
  const eventsByDay = [
    /* Segunda */ [
      { type: 'meeting', time: '09:00', title: 'Standup de equipe' },
      { type: 'task',               title: 'Revisar relatório mensal' },
      { type: 'todo',               title: 'Responder e-mails pendentes' },
    ],
    /* Terça */ [
      { type: 'meeting', time: '10:00', title: 'Alinhamento de produto' },
      { type: 'meeting', time: '15:30', title: 'One-on-one com gestora' },
      { type: 'task',               title: 'Atualizar planilha de métricas' },
    ],
    /* Quarta */ [
      { type: 'meeting', time: '09:00', title: 'Standup de equipe' },
      { type: 'meeting', time: '14:00', title: 'Review do sprint' },
      { type: 'todo',               title: 'Preparar apresentação de sexta' },
    ],
    /* Quinta */ [
      { type: 'meeting', time: '11:00', title: 'Reunião com fornecedor' },
      { type: 'task',               title: 'Fechar proposta comercial' },
      { type: 'todo',               title: 'Revisar documentação técnica' },
    ],
    /* Sexta */ [
      { type: 'meeting', time: '09:00', title: 'Standup de equipe' },
      { type: 'meeting', time: '13:00', title: 'Apresentação para diretoria' },
      { type: 'task',               title: 'Planning da próxima semana' },
    ],
    /* Sábado */ [
      { type: 'todo', title: 'Organizar backlog pessoal' },
    ],
    /* Domingo */ [],
  ];

  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  /* ── Calcula as datas da semana atual (seg → dom) ── */
  function getWeekDates() {
    const today = new Date();
    const dow   = today.getDay();               // 0 = dom
    const diff  = (dow === 0) ? -6 : 1 - dow;  // ajusta para segunda
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  /* ── Render ── */
  const grid    = document.getElementById('agenda-grid');
  const rangeEl = document.getElementById('week-range');
  if (!grid) return;

  const dates   = getWeekDates();
  const today   = new Date();
  today.setHours(0,0,0,0);

  /* semana no cabeçalho */
  const fmt = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  if (rangeEl) rangeEl.textContent = `${fmt(dates[0])} – ${fmt(dates[6])}`;

  /* itera os 7 dias */
  dates.forEach((date, i) => {
    date.setHours(0,0,0,0);
    const isToday   = date.getTime() === today.getTime();
    const isWeekend = i >= 5;
    const events    = eventsByDay[i] || [];

    /* coluna do dia */
    const col = document.createElement('div');
    col.className = 'agenda-day'
      + (isToday   ? ' is-today'   : '')
      + (isWeekend ? ' is-weekend' : '');

    /* cabeçalho */
    col.innerHTML = `
      <div class="agenda-day-head">
        <span class="agenda-day-name">${dayNames[i]}</span>
        <span class="agenda-day-date">${String(date.getDate()).padStart(2,'0')}</span>
        ${isToday ? '<span class="today-badge">hoje</span>' : ''}
      </div>
      <div class="agenda-events" id="events-${i}"></div>`;

    grid.appendChild(col);

    /* eventos */
    const evContainer = col.querySelector(`#events-${i}`);

    if (events.length === 0) {
      evContainer.innerHTML = '<span class="agenda-empty">Dia livre ✦</span>';
      return;
    }

    events.forEach(ev => {
      const el = document.createElement('div');
      el.className = `agenda-event ev-${ev.type}`;
      el.innerHTML = `
        ${ev.time ? `<span class="agenda-event-time">⏱ ${ev.time}</span>` : ''}
        <span class="agenda-event-title">${ev.title}</span>`;
      evContainer.appendChild(el);
    });
  });

})();

/* ══════════════════════════════════════════════════════════════
   GRÁFICO — E-MAILS DA SEMANA (dados fictícios)
══════════════════════════════════════════════════════════════ */
(function initEmailChart() {
  const dias   = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const emails = [24, 38, 17, 45, 31, 9, 6];
  const total  = emails.reduce((a, b) => a + b, 0);

  const totalEl = document.getElementById('email-total');
  if (totalEl) totalEl.textContent = `${total} e-mails no total`;

  const ctx = document.getElementById('emailChart');
  if (!ctx) return;

  /* gradiente azul nas barras */
  const chart = ctx.getContext('2d');
  const grad  = chart.createLinearGradient(0, 0, 0, 220);
  grad.addColorStop(0,   'rgba(37,99,235,0.85)');
  grad.addColorStop(1,   'rgba(37,99,235,0.15)');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dias,
      datasets: [{
        label: 'E-mails recebidos',
        data: emails,
        backgroundColor: grad,
        borderColor: 'rgba(59,130,246,0.9)',
        borderWidth: 1.5,
        borderRadius: 7,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#162033',
          borderColor: 'rgba(37,99,235,0.35)',
          borderWidth: 1,
          titleColor: '#93c5fd',
          bodyColor: '#e2e8f0',
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} e-mails`
          }
        }
      },
      scales: {
        x: {
          grid:  { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { family: "'DM Sans', sans-serif", size: 12 } },
          border:{ color: 'transparent' }
        },
        y: {
          beginAtZero: true,
          grid:  { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#94a3b8',
            font:  { family: "'DM Sans', sans-serif", size: 11 },
            stepSize: 10
          },
          border: { color: 'transparent', dash: [4,4] }
        }
      }
    }
  });
})();

/* ══════════════════════════════════════════════════════════════
   RELÓGIO & DATA
══════════════════════════════════════════════════════════════ */
function updateClock() {
  const now = new Date();

  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('clock').textContent = `${hh}:${mm}:${ss}`;

  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
  document.getElementById('date-display').textContent =
    dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}
updateClock();
setInterval(updateClock, 1000);

/* ══════════════════════════════════════════════════════════════
   TAREFAS
══════════════════════════════════════════════════════════════ */
let tasks = JSON.parse(localStorage.getItem('dash-tasks') || '[]');

function saveTasks() {
  localStorage.setItem('dash-tasks', JSON.stringify(tasks));
}

function renderTasks() {
  const list  = document.getElementById('task-list');
  const empty = document.getElementById('task-empty');
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;

  document.getElementById('task-counter').textContent = `${done} / ${total}`;
  document.getElementById('task-progress').style.width =
    total ? `${(done / total) * 100}%` : '0%';

  if (total === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = '';
  tasks.forEach((task, i) => {
    const item = document.createElement('div');
    item.className = 'task-item' + (task.done ? ' done' : '');
    item.innerHTML = `
      <div class="task-check" onclick="toggleTask(${i})"></div>
      <span class="task-label" onclick="toggleTask(${i})">${escHtml(task.text)}</span>
      <button class="task-delete" onclick="deleteTask(${i})" title="Remover">×</button>`;
    list.appendChild(item);
  });
}

function addTask() {
  const input = document.getElementById('task-input');
  const text  = input.value.trim();
  if (!text) return;
  tasks.push({ text, done: false });
  saveTasks();
  renderTasks();
  input.value = '';
  input.focus();
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  saveTasks();
  renderTasks();
}

function deleteTask(i) {
  tasks.splice(i, 1);
  saveTasks();
  renderTasks();
}

document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

renderTasks();

/* ══════════════════════════════════════════════════════════════
   METAS DO SPRINT
══════════════════════════════════════════════════════════════ */
let goals = JSON.parse(localStorage.getItem('dash-goals') || '[]');

function saveGoals() {
  localStorage.setItem('dash-goals', JSON.stringify(goals));
}

function renderGoals() {
  const list  = document.getElementById('goal-list');
  const empty = document.getElementById('goal-empty');

  if (goals.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = '';
  goals.forEach((goal, i) => {
    const item = document.createElement('div');
    item.className = 'goal-item' + (goal.done ? ' done-g' : '');
    item.innerHTML = `
      <div class="goal-bullet" onclick="toggleGoal(${i})" title="Marcar como concluída"></div>
      <textarea class="goal-text" rows="1"
        oninput="autoResize(this);updateGoalText(${i},this.value)"
        onfocus="this.select()">${escHtml(goal.text)}</textarea>
      <button class="goal-delete" onclick="deleteGoal(${i})" title="Remover">×</button>`;
    list.appendChild(item);
    autoResize(item.querySelector('textarea'));
  });
}

function addGoal() {
  goals.push({ text: 'Nova meta…', done: false });
  saveGoals();
  renderGoals();
  const areas = document.querySelectorAll('.goal-text');
  const last  = areas[areas.length - 1];
  if (last) { last.focus(); last.select(); }
}

function toggleGoal(i) {
  goals[i].done = !goals[i].done;
  saveGoals();
  renderGoals();
}

function updateGoalText(i, val) {
  goals[i].text = val;
  saveGoals();
}

function deleteGoal(i) {
  goals.splice(i, 1);
  saveGoals();
  renderGoals();
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

renderGoals();

/* ══════════════════════════════════════════════════════════════
   NOTAS RÁPIDAS
══════════════════════════════════════════════════════════════ */
const notesEl = document.getElementById('notes');
const badge   = document.getElementById('saved-badge');
let saveTimer;

notesEl.value = localStorage.getItem('dash-notes') || '';

notesEl.addEventListener('input', () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem('dash-notes', notesEl.value);
    badge.classList.add('show');
    setTimeout(() => badge.classList.remove('show'), 1800);
  }, 600);
});

/* ══════════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════════ */
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
