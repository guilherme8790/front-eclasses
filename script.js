// URL base da API
const URL_API = 'http://localhost:3000';

// Estado local (espelho dos dados da API)
let estado = {
  jogos: [],
  times: [],
  competidores: [],
  confrontos: []
};

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', async () => {
  await carregarDados();
  configurarNavegacao();
  renderizarTudo();
});

async function carregarDados() {
  const [jogos, times, competidores, confrontos] = await Promise.all([
    fetch(`${URL_API}/jogos`).then(r => r.json()),
    fetch(`${URL_API}/times`).then(r => r.json()),
    fetch(`${URL_API}/competidores`).then(r => r.json()),
    fetch(`${URL_API}/confrontos`).then(r => r.json())
  ]);

  estado.jogos        = jogos;
  estado.times        = times;
  estado.competidores = competidores;
  estado.confrontos   = confrontos;
}

// ==================== NAVEGAÇÃO ====================

function configurarNavegacao() {
  const itensNav = document.querySelectorAll('#sidebar-nav li');
  itensNav.forEach(item => {
    item.addEventListener('click', () => {
      const idView = item.getAttribute('data-view');
      trocarView(idView);
      itensNav.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function trocarView(idView) {
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.getElementById(`view-${idView}`).classList.add('active');
}

// ==================== RENDERIZAÇÃO ====================

function renderizarTudo() {
  renderizarDashboard();
  renderizarJogos();
  renderizarTimes();
  renderizarCompetidores();
  renderizarConfrontos();
}

function renderizarDashboard() {
  const containerStats    = document.getElementById('dashboard-stats');
  const containerProximos = document.getElementById('upcoming-matches');

  const totalTimes        = estado.times.length;
  const totalCompetidores = estado.competidores.length;
  const confrontosFinaliz = estado.confrontos.filter(c => c.situacao === 'finalizado').length;
  const confrontosAgend   = estado.confrontos.filter(c => c.situacao === 'agendado').length;

  containerStats.innerHTML = `
    <div class="card">
      <span class="card-tag">Torneio</span>
      <h3>${totalTimes}</h3>
      <p class="subtitle">Equipes</p>
    </div>
    <div class="card">
      <span class="card-tag">Atletas</span>
      <h3>${totalCompetidores}</h3>
      <p class="subtitle">Competidores</p>
    </div>
    <div class="card">
      <span class="card-tag">Encerrados</span>
      <h3>${confrontosFinaliz}</h3>
      <p class="subtitle">Resultados</p>
    </div>
    <div class="card">
      <span class="card-tag">Pendentes</span>
      <h3>${confrontosAgend}</h3>
      <p class="subtitle">Agendamentos</p>
    </div>
  `;

  const proximos = estado.confrontos.filter(c => c.situacao === 'agendado').slice(0, 3);
  containerProximos.innerHTML = proximos.map(c => {
    const jogo  = estado.jogos.find(j => j.id == c.idJogo);
    const time1 = estado.times.find(t => t.id == c.idTime1);
    const time2 = estado.times.find(t => t.id == c.idTime2);
    return `
      <div class="card">
        <span class="card-tag">${jogo?.nome || 'Jogo'}</span>
        <div class="match-card">
          <div class="team-score"><strong>${time1?.nome || 'TBD'}</strong></div>
          <div class="vs">VS</div>
          <div class="team-score"><strong>${time2?.nome || 'TBD'}</strong></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderizarJogos() {
  const lista = document.getElementById('list-jogos');
  lista.innerHTML = estado.jogos.map(j => `
    <div class="card">
      <span class="card-tag">${j.genero}</span>
      <h3>${j.nome}</h3>
      <p class="subtitle">ID: ${j.id}</p>
    </div>
  `).join('');
}

function renderizarTimes() {
  const lista = document.getElementById('list-times');
  lista.innerHTML = estado.times.map(t => `
    <div class="card" style="border-right: 4px solid ${t.cor}">
      <span class="card-tag">EQUIPE</span>
      <h3>${t.nome}</h3>
      <p class="subtitle">${estado.competidores.filter(c => c.idTime == t.id).length} Jogadores</p>
    </div>
  `).join('');
}

function renderizarCompetidores() {
  const lista = document.getElementById('list-competidores');
  lista.innerHTML = estado.competidores.map(c => {
    const time = estado.times.find(t => t.id == c.idTime);
    return `
      <div class="card">
        <span class="card-tag">${time?.nome || 'Sem Time'}</span>
        <h3>${c.apelido}</h3>
        <p class="subtitle">${c.nome}</p>
      </div>
    `;
  }).join('');
}

function renderizarConfrontos() {
  const lista = document.getElementById('list-confrontos');
  lista.innerHTML = estado.confrontos.map(c => {
    const jogo  = estado.jogos.find(j => j.id == c.idJogo);
    const time1 = estado.times.find(t => t.id == c.idTime1);
    const time2 = estado.times.find(t => t.id == c.idTime2);
    const dataFormatada = new Date(c.data).toLocaleString('pt-BR');
    return `
      <div class="card">
        <span class="card-tag">${jogo?.nome || 'Jogo'} | ${dataFormatada}</span>
        <div class="match-card">
          <div class="team-score">
            <strong>${time1?.nome || '???'}</strong>
            <div class="score">${c.placar1}</div>
          </div>
          <div class="vs">VS</div>
          <div class="team-score">
            <strong>${time2?.nome || '???'}</strong>
            <div class="score">${c.placar2}</div>
          </div>
        </div>
        <div style="margin-top: 1rem; text-align: center;">
          <span class="card-tag" style="background: ${c.situacao === 'finalizado' ? '#10b981' : '#f59e0b'}">
            ${c.situacao === 'finalizado' ? 'FINALIZADO' : 'AGENDADO'}
          </span>
          ${c.situacao === 'agendado' ? `<button onclick="finalizarConfronto(${c.id})" style="padding: 4px 8px; font-size: 0.7rem; margin-left: 8px;">Finalizar</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ==================== MODAL / FORMULÁRIOS ====================

const modal      = document.getElementById('modal-container');
const conteudoForm = document.getElementById('form-content');

function showForm(tipo) {
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
  }, 10);

  let html = '';

  if (tipo === 'jogo') {
    html = `
      <h2>Adicionar Jogo</h2>
      <form onsubmit="salvarItem(event, 'jogos')">
        <div class="form-group">
          <label>Nome do Jogo</label>
          <input type="text" name="nome" required placeholder="Ex: CS2">
        </div>
        <div class="form-group">
          <label>Gênero</label>
          <input type="text" name="genero" required placeholder="Ex: FPS">
        </div>
        <div style="display:flex; gap: 1rem;">
          <button type="submit" class="btn-primary">Salvar</button>
          <button type="button" onclick="closeModal()">Cancelar</button>
        </div>
      </form>
    `;
  } else if (tipo === 'time') {
    html = `
      <h2>Adicionar Time</h2>
      <form onsubmit="salvarItem(event, 'times')">
        <div class="form-group">
          <label>Nome da Equipe</label>
          <input type="text" name="nome" required placeholder="Ex: Ninjas da Noite">
        </div>
        <div class="form-group">
          <label>Cor Identidade</label>
          <input type="color" name="cor" value="#6366f1">
        </div>
        <div style="display:flex; gap: 1rem;">
          <button type="submit" class="btn-primary">Criar</button>
          <button type="button" onclick="closeModal()">Cancelar</button>
        </div>
      </form>
    `;
  } else if (tipo === 'competidor') {
    html = `
      <h2>Registrar Competidor</h2>
      <form onsubmit="salvarItem(event, 'competidores')">
        <div class="form-group">
          <label>Nome Completo</label>
          <input type="text" name="nome" required>
        </div>
        <div class="form-group">
          <label>Apelido</label>
          <input type="text" name="apelido" required>
        </div>
        <div class="form-group">
          <label>Time</label>
          <select name="idTime" required>
            ${estado.times.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex; gap: 1rem;">
          <button type="submit" class="btn-primary">Registrar</button>
          <button type="button" onclick="closeModal()">Cancelar</button>
        </div>
      </form>
    `;
  }

  if (tipo === 'confronto') {
    html = `
      <h2>Novo Confronto</h2>
      <form onsubmit="salvarItem(event, 'confrontos')">
        <div class="form-group">
          <label>Jogo</label>
          <select name="idJogo" required>
            ${estado.jogos.map(j => `<option value="${j.id}">${j.nome}</option>`).join('')}
          </select>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label>Time A</label>
            <select name="idTime1" required>
              ${estado.times.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Time B</label>
            <select name="idTime2" required>
              ${estado.times.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
            </select>
          </div>
        </div>
        <input type="hidden" name="data" value="${new Date().toISOString().slice(0,16)}">
        <input type="hidden" name="placar1" value="0">
        <input type="hidden" name="placar2" value="0">
        <input type="hidden" name="situacao" value="agendado">
        <div style="display:flex; gap: 1rem;">
          <button type="submit" class="btn-primary">Registrar</button>
          <button type="button" onclick="closeModal()">Cancelar</button>
        </div>
      </form>
    `;
  }

  conteudoForm.innerHTML = html;
}

function closeModal() {
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

// ==================== SALVAR (POST na API) ====================

async function salvarItem(evento, rota) {
  evento.preventDefault();
  const dadosForm  = new FormData(evento.target);
  const novoItem   = Object.fromEntries(dadosForm.entries());

  await fetch(`${URL_API}/${rota}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoItem)
  });

  await carregarDados();
  renderizarTudo();
  closeModal();
}

// ==================== FINALIZAR CONFRONTO (PUT na API) ====================

async function finalizarConfronto(id) {
  const confronto = estado.confrontos.find(c => c.id == id);
  if (!confronto) return;

  const placar1 = Math.floor(Math.random() * 10);
  const placar2 = Math.floor(Math.random() * 10);

  await fetch(`${URL_API}/confrontos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placar1, placar2, situacao: 'finalizado' })
  });

  await carregarDados();
  renderizarTudo();
}