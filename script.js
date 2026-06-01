/* ══════════════════════════════════════════════════════════════
   AUTH — constantes e estado
══════════════════════════════════════════════════════════════ */
const GOOGLE_CLIENT_ID =
  '502453864922-4p67id2no5lgq012m1hc7kt31ou8u6uk.apps.googleusercontent.com';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'openid', 'profile', 'email'
].join(' ');

let _tokenClient = null;
let _accessToken = null;
let _emailChart  = null;   // referência ao Chart.js
let _weekOffset  = 0;      // 0 = semana atual, -1 = semana passada, +1 = próxima

/* ── Inicializa token client (lazy, ao clicar no botão) ── */
function _initTokenClient() {
  _tokenClient = google.accounts.oauth2.initTokenClient({
    client_id:      GOOGLE_CLIENT_ID,
    scope:          GOOGLE_SCOPES,
    callback:       async (resp) => {
      if (resp.error) {
        console.error('[Auth] Erro OAuth:', resp);
        alert(`Erro de autenticação: ${resp.error}\n\nVerifique se http://localhost:8000 está nas Origens JavaScript autorizadas do seu Client ID no Google Cloud Console.`);
        _resetSignInButton();
        return;
      }
      _accessToken = resp.access_token;
      await _onLoginSuccess();
    },
    error_callback: (err) => {
      console.error('[Auth] Erro GSI:', err);
      if (err.type === 'popup_closed') {
        // usuário fechou o popup — apenas reabilita o botão
        _resetSignInButton();
        return;
      }
      alert(`Não foi possível abrir o login Google.\n\nCausa: ${err.type}\n\nCertifique-se de que:\n• http://localhost:8000 está nas Origens JavaScript autorizadas\n• As APIs Gmail e Google Calendar estão habilitadas no projeto`);
      _resetSignInButton();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   HANDLERS PÚBLICOS (chamados pelo HTML)
══════════════════════════════════════════════════════════════ */

function handleGoogleLogin() {
  const btnText    = document.querySelector('.btn-signin-text');
  const btnLoading = document.querySelector('.btn-signin-loading');
  const btn        = document.getElementById('google-signin-btn');
  btnText.style.display    = 'none';
  btnLoading.style.display = 'inline';
  btn.disabled = true;

  // GSI pode ainda estar carregando (script async)
  if (!window.google?.accounts?.oauth2) {
    // Aguarda até 4s
    let tries = 0;
    const wait = setInterval(() => {
      tries++;
      if (window.google?.accounts?.oauth2) {
        clearInterval(wait);
        _doRequestToken();
      } else if (tries > 8) {
        clearInterval(wait);
        _resetSignInButton();
        alert('Não foi possível carregar a biblioteca Google. Verifique sua conexão e tente novamente.');
      }
    }, 500);
    return;
  }
  _doRequestToken();
}

function _doRequestToken() {
  if (!_tokenClient) _initTokenClient();
  console.log('[Auth] Client ID:', GOOGLE_CLIENT_ID);
  console.log('[Auth] Scopes:', GOOGLE_SCOPES);
  console.log('[Auth] GSI carregado?', !!window.google?.accounts?.oauth2);
  console.log('[Auth] Solicitando token de acesso…');
  // 'select_account' garante que o popup do Google sempre abre
  _tokenClient.requestAccessToken({ prompt: 'select_account' });
}

function _resetSignInButton() {
  const btnText    = document.querySelector('.btn-signin-text');
  const btnLoading = document.querySelector('.btn-signin-loading');
  const btn        = document.getElementById('google-signin-btn');
  btnText.style.display    = 'inline';
  btnLoading.style.display = 'none';
  btn.disabled = false;
}

function handleSignOut() {
  if (_accessToken) {
    google.accounts.oauth2.revoke(_accessToken, () => {});
    _accessToken = null;
  }
  // Volta para o overlay de login
  document.getElementById('login-overlay').style.display  = 'flex';
  document.getElementById('user-profile').style.display   = 'none';
  document.getElementById('email-data-source').style.display    = 'none';
  document.getElementById('calendar-data-source').style.display = 'none';
  _resetSignInButton();
  // Restaura dados mock
  _updateEmailChartData([24, 38, 17, 45, 31, 9, 6]);
  renderAgenda(MOCK_EVENTS);
}

/* ══════════════════════════════════════════════════════════════
   FLUXO PÓS-LOGIN
══════════════════════════════════════════════════════════════ */

async function _onLoginSuccess() {
  // Mostra o dashboard imediatamente (tira o overlay)
  document.getElementById('login-overlay').style.display = 'none';
  document.querySelector('.wrapper').classList.add('data-loading');

  try {
    const [userInfo, gmailCounts, calendarItems] = await Promise.all([
      _fetchUserInfo(),
      _fetchGmailWeekCounts(),
      _fetchCalendarWeekEvents()
    ]);

    _showUserProfile(userInfo);
    _updateEmailChartData(gmailCounts);
    _updateAgendaWithCalendar(calendarItems);

    // Extrai eventos de hoje para o today strip
    const todayEvents = _getTodayEvents(calendarItems);
    renderTodayReminder(todayEvents);

    document.getElementById('email-data-source').style.display    = 'flex';
    document.getElementById('calendar-data-source').style.display = 'flex';
  } catch (err) {
    console.error('[Dashboard] Erro ao buscar dados da API:', err);
  } finally {
    document.querySelector('.wrapper').classList.remove('data-loading');
  }
}

/* ══════════════════════════════════════════════════════════════
   API FETCHERS
══════════════════════════════════════════════════════════════ */

async function _apiFetch(url) {
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${_accessToken}` }
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`[API ${resp.status}] ${err?.error?.message || url}`);
  }
  return resp.json();
}

/* ── Navega entre semanas ── */
async function navigateWeek(delta, jumpToToday = false) {
  if (jumpToToday) {
    _weekOffset = 0;
  } else {
    _weekOffset += delta;
  }

  // Atualiza botão "Hoje" (desabilitado quando está na semana atual)
  const todayBtn = document.getElementById('week-today-btn');
  if (todayBtn) todayBtn.disabled = (_weekOffset === 0);

  if (_accessToken) {
    document.querySelector('.wrapper').classList.add('data-loading');
    try {
      const [gmailCounts, calendarItems] = await Promise.all([
        _fetchGmailWeekCounts(),
        _fetchCalendarWeekEvents()
      ]);
      _updateEmailChartData(gmailCounts);
      _updateAgendaWithCalendar(calendarItems);
    } catch(e) {
      console.error('[navigateWeek] Erro:', e);
    } finally {
      document.querySelector('.wrapper').classList.remove('data-loading');
    }
  } else {
    // Sem login: re-renderiza agenda mock e atualiza label de datas
    renderAgenda(MOCK_EVENTS);
  }
}

/* ── Extrai eventos de hoje de uma lista do Calendar ── */
function _getTodayEvents(items) {
  const today = new Date(); today.setHours(0,0,0,0);
  return items
    .filter(ev => {
      if (ev.status === 'cancelled') return false;
      const raw = ev.start?.dateTime || ev.start?.date;
      if (!raw) return false;
      const d = new Date(raw); d.setHours(0,0,0,0);
      return d.getTime() === today.getTime();
    })
    .map(ev => ({
      type:  ev.start?.date && !ev.start?.dateTime ? 'todo' : 'meeting',
      time:  ev.start?.dateTime
        ? new Date(ev.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : null,
      title: ev.summary || '(sem título)'
    }))
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
}

/* ── Renderiza o today strip ── */
function renderTodayReminder(todayEvents = []) {
  const evContainer = document.getElementById('today-strip-events');
  const dateEl      = document.getElementById('today-strip-date');
  if (!evContainer) return;

  // Data de hoje
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  if (dateEl) dateEl.textContent = dateStr.replace('.', '').toUpperCase();

  evContainer.innerHTML = '';

  // Tarefas pendentes do task list
  const pending = tasks.filter(t => !t.done);
  if (pending.length > 0) {
    const pill = document.createElement('span');
    pill.className = 'today-pill today-pill-task';
    pill.title = pending.map(t => t.text).join('\n');
    pill.textContent = `✓ ${pending.length} tarefa${pending.length > 1 ? 's' : ''} pendente${pending.length > 1 ? 's' : ''}`;
    evContainer.appendChild(pill);
  } else if (tasks.length > 0) {
    const pill = document.createElement('span');
    pill.className = 'today-pill today-pill-done';
    pill.textContent = '✓ Todas as tarefas concluídas!';
    evContainer.appendChild(pill);
  }

  // Eventos de hoje
  if (!_accessToken) {
    const pill = document.createElement('span');
    pill.className = 'today-pill today-pill-empty';
    pill.textContent = '🔒 Faça login para ver sua agenda';
    evContainer.appendChild(pill);
  } else if (todayEvents.length === 0) {
    const pill = document.createElement('span');
    pill.className = 'today-pill today-pill-empty';
    pill.textContent = 'Sem eventos hoje ✶';
    evContainer.appendChild(pill);
  } else {
    todayEvents.forEach(ev => {
      const pill = document.createElement('span');
      pill.className = `today-pill today-pill-${ev.type}`;
      pill.textContent = ev.time ? `⏱ ${ev.time}  ${ev.title}` : ev.title;
      pill.title = ev.title;
      evContainer.appendChild(pill);
    });
  }

  // Se não há nada no strip ainda
  if (evContainer.children.length === 0) {
    const pill = document.createElement('span');
    pill.className = 'today-pill today-pill-empty';
    pill.textContent = 'Adicione tarefas para começar!';
    evContainer.appendChild(pill);
  }
}

/* ── Perfil do usuário logado ── */
async function _fetchUserInfo() {
  return _apiFetch('https://www.googleapis.com/oauth2/v2/userinfo');
}

/* ── Contagem de e-mails por dia (semana atual) ── */
async function _fetchGmailWeekCounts() {
  const dates = getWeekDates();

  const counts = await Promise.all(dates.map(async (date) => {
    const after  = _toGmailDate(date);
    const next   = new Date(date.getTime() + 86_400_000);
    const before = _toGmailDate(next);
    const q      = encodeURIComponent(`in:inbox after:${after} before:${before}`);
    try {
      const data = await _apiFetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=${q}`
      );
      return data.resultSizeEstimate || 0;
    } catch {
      return 0;
    }
  }));

  return counts;   // [seg, ter, qua, qui, sex, sáb, dom]
}

/* ── Formata data para query Gmail: YYYY/MM/DD ── */
function _toGmailDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

/* ── Eventos do Google Calendar na semana atual ── */
async function _fetchCalendarWeekEvents() {
  const dates = getWeekDates();
  const start = new Date(dates[0]); start.setHours(0, 0, 0, 0);
  const end   = new Date(dates[6]); end.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    timeMin:       start.toISOString(),
    timeMax:       end.toISOString(),
    singleEvents:  'true',
    orderBy:       'startTime',
    maxResults:    '250'
  });

  const data = await _apiFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`
  );
  return data.items || [];
}

/* ══════════════════════════════════════════════════════════════
   UI UPDATERS
══════════════════════════════════════════════════════════════ */

function _showUserProfile(user) {
  const profile = document.getElementById('user-profile');
  const avatar  = document.getElementById('user-avatar');
  const name    = document.getElementById('user-name');
  avatar.src        = user.picture || '';
  avatar.alt        = user.name   || '';
  name.textContent  = user.given_name || user.name || user.email || '';
  profile.style.display = 'flex';
}

/* ── Atualiza dados do gráfico de e-mails ── */
function _updateEmailChartData(counts) {
  if (!_emailChart) return;
  const total   = counts.reduce((a, b) => a + b, 0);
  const totalEl = document.getElementById('email-total');
  if (totalEl) totalEl.textContent = `${total} e-mails no total`;
  _emailChart.data.datasets[0].data = counts;
  _emailChart.update('active');
}

/* ── Converte eventos do Calendar → estrutura interna e re-renderiza ── */
function _updateAgendaWithCalendar(items) {
  const dates = getWeekDates();
  const byDay = Array.from({ length: 7 }, () => []);

  items.forEach(ev => {
    if (ev.status === 'cancelled') return;

    const startRaw = ev.start?.dateTime || ev.start?.date;
    if (!startRaw) return;

    const evDate = new Date(startRaw);
    evDate.setHours(0, 0, 0, 0);

    const idx = dates.findIndex(d => {
      const dc = new Date(d); dc.setHours(0, 0, 0, 0);
      return dc.getTime() === evDate.getTime();
    });
    if (idx === -1) return;

    const isAllDay = Boolean(ev.start?.date && !ev.start?.dateTime);
    const timeStr  = ev.start?.dateTime
      ? new Date(ev.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : null;

    byDay[idx].push({
      type:  isAllDay ? 'todo' : 'meeting',
      time:  timeStr,
      title: ev.summary || '(sem título)'
    });
  });

  renderAgenda(byDay);
}

/* ══════════════════════════════════════════════════════════════
   AGENDA SEMANAL
══════════════════════════════════════════════════════════════ */

const MOCK_EVENTS = [
  /* Seg */ [
    { type: 'meeting', time: '09:00', title: 'Standup de equipe' },
    { type: 'task',                   title: 'Revisar relatório mensal' },
    { type: 'todo',                   title: 'Responder e-mails pendentes' }
  ],
  /* Ter */ [
    { type: 'meeting', time: '10:00', title: 'Alinhamento de produto' },
    { type: 'meeting', time: '15:30', title: 'One-on-one com gestora' },
    { type: 'task',                   title: 'Atualizar planilha de métricas' }
  ],
  /* Qua */ [
    { type: 'meeting', time: '09:00', title: 'Standup de equipe' },
    { type: 'meeting', time: '14:00', title: 'Review do sprint' },
    { type: 'todo',                   title: 'Preparar apresentação de sexta' }
  ],
  /* Qui */ [
    { type: 'meeting', time: '11:00', title: 'Reunião com fornecedor' },
    { type: 'task',                   title: 'Fechar proposta comercial' },
    { type: 'todo',                   title: 'Revisar documentação técnica' }
  ],
  /* Sex */ [
    { type: 'meeting', time: '09:00', title: 'Standup de equipe' },
    { type: 'meeting', time: '13:00', title: 'Apresentação para diretoria' },
    { type: 'task',                   title: 'Planning da próxima semana' }
  ],
  /* Sáb */ [{ type: 'todo', title: 'Organizar backlog pessoal' }],
  /* Dom */ []
];

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/* ── Retorna as 7 datas da semana deslocada por _weekOffset (seg → dom) ── */
function getWeekDates() {
  const today  = new Date();
  const dow    = today.getDay();                 // 0 = dom
  const diff   = (dow === 0) ? -6 : 1 - dow;    // ajusta para segunda
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + (_weekOffset * 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/* ── Renderiza (ou re-renderiza) a grade de agenda ── */
function renderAgenda(eventsByDay) {
  const grid    = document.getElementById('agenda-grid');
  const rangeEl = document.getElementById('week-range');
  if (!grid) return;

  grid.innerHTML = '';                           // limpa antes de re-renderizar

  const dates = getWeekDates();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const fmt = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  if (rangeEl) rangeEl.textContent = `${fmt(dates[0])} – ${fmt(dates[6])}`;

  dates.forEach((date, i) => {
    const dc        = new Date(date); dc.setHours(0, 0, 0, 0);
    const isToday   = dc.getTime() === today.getTime();
    const isWeekend = i >= 5;
    const events    = eventsByDay[i] || [];

    const col = document.createElement('div');
    col.className = 'agenda-day'
      + (isToday   ? ' is-today'   : '')
      + (isWeekend ? ' is-weekend' : '');

    col.innerHTML = `
      <div class="agenda-day-head">
        <span class="agenda-day-name">${DAY_NAMES[i]}</span>
        <span class="agenda-day-date">${String(date.getDate()).padStart(2, '0')}</span>
        ${isToday ? '<span class="today-badge">hoje</span>' : ''}
      </div>
      <div class="agenda-events" id="ev-${i}"></div>`;

    grid.appendChild(col);

    const evContainer = col.querySelector(`#ev-${i}`);

    if (events.length === 0) {
      evContainer.innerHTML = '<span class="agenda-empty">Dia livre ✦</span>';
      return;
    }

    events.forEach(ev => {
      const el = document.createElement('div');
      el.className = `agenda-event ev-${ev.type}`;
      el.innerHTML = `
        ${ev.time ? `<span class="agenda-event-time">⏱ ${ev.time}</span>` : ''}
        <span class="agenda-event-title">${escHtml(ev.title)}</span>`;
      evContainer.appendChild(el);
    });
  });
}

// Render inicial com dados mock
renderAgenda(MOCK_EVENTS);

/* ══════════════════════════════════════════════════════════════
   GRÁFICO — E-MAILS DA SEMANA
══════════════════════════════════════════════════════════════ */
(function initEmailChart() {
  const dias       = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const mockEmails = [24, 38, 17, 45, 31, 9, 6];
  const total      = mockEmails.reduce((a, b) => a + b, 0);

  const totalEl = document.getElementById('email-total');
  if (totalEl) totalEl.textContent = `${total} e-mails no total`;

  const ctx = document.getElementById('emailChart');
  if (!ctx) return;

  const chartCtx = ctx.getContext('2d');
  const grad     = chartCtx.createLinearGradient(0, 0, 0, 220);
  grad.addColorStop(0, 'rgba(0,240,255,0.80)');
  grad.addColorStop(1, 'rgba(0,240,255,0.06)');

  _emailChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dias,
      datasets: [{
        label: 'E-mails recebidos',
        data:  mockEmails,
        backgroundColor: grad,
        borderColor:     'rgba(0,240,255,0.60)',
        borderWidth:     1,
        borderRadius:    3,
        borderSkipped:   false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#131313',
          borderColor:     'rgba(0,240,255,0.25)',
          borderWidth:     1,
          titleColor:      '#00F0FF',
          bodyColor:       '#e2e2e2',
          padding:         10,
          callbacks: { label: c => ` ${c.parsed.y} e-mails` }
        }
      },
      scales: {
        x: {
          grid:   { color: 'rgba(255,255,255,0.04)' },
          ticks:  { color: '#b9cacb', font: { family: "'Inter', sans-serif", size: 12 } },
          border: { color: 'transparent' }
        },
        y: {
          beginAtZero: true,
          grid:   { color: 'rgba(255,255,255,0.04)' },
          ticks:  { color: '#b9cacb', font: { family: "'Inter', sans-serif", size: 11 }, stepSize: 10 },
          border: { color: 'transparent', dash: [4, 4] }
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
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  const ss  = String(now.getSeconds()).padStart(2, '0');
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

function saveTasks() { localStorage.setItem('dash-tasks', JSON.stringify(tasks)); }

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
  saveTasks(); renderTasks();
  input.value = ''; input.focus();
}

function toggleTask(i) { tasks[i].done = !tasks[i].done; saveTasks(); renderTasks(); renderTodayReminder(); }
function deleteTask(i) { tasks.splice(i, 1); saveTasks(); renderTasks(); renderTodayReminder(); }

document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
renderTasks();
// Inicializa o today strip com as tarefas já disponíveis
renderTodayReminder();


/* ══════════════════════════════════════════════════════════════
   METAS DO SPRINT
══════════════════════════════════════════════════════════════ */
let goals = JSON.parse(localStorage.getItem('dash-goals') || '[]');

function saveGoals() { localStorage.setItem('dash-goals', JSON.stringify(goals)); }

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
  saveGoals(); renderGoals();
  const areas = document.querySelectorAll('.goal-text');
  const last  = areas[areas.length - 1];
  if (last) { last.focus(); last.select(); }
}

function toggleGoal(i)           { goals[i].done = !goals[i].done; saveGoals(); renderGoals(); }
function updateGoalText(i, val)  { goals[i].text = val; saveGoals(); }
function deleteGoal(i)           { goals.splice(i, 1); saveGoals(); renderGoals(); }
function autoResize(el)          { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }

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
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
