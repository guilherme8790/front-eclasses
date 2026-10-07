let state = { jogos: [], times: [], competidores: [], confrontos: [] };

document.addEventListener('DOMContentLoaded', async () => {
  await carregarDados();
  configurarNavegacao();
  renderizarTudo();
});

async function carregarDados() {
  try {
    const [jogos, times, competidores, confrontos] = await Promise.all([
      getJogos(), getTimes(), getCompetidores(), getConfrontos()
    ]);
    state.jogos = jogos || [];
    state.times = times || [];
    state.competidores = competidores || [];
    state.confrontos = confrontos || [];
  } catch (e) {
    console.error(e);
  }
}

function configurarNavegacao() {
  document.querySelectorAll('#sidebar-nav li').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${view}`).classList.add('active');
      document.querySelectorAll('#sidebar-nav li').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function renderizarTudo() {
  renderizarDashboard();
  renderizarJogos();
  renderizarTimes();
  renderizarCompetidores();
  renderizarConfrontos();
}

function renderizarDashboard() {
  const stats = document.getElementById('dashboard-stats');
  const proximos = document.getElementById('upcoming-matches');
  const encerrados = state.confrontos.filter(c => c.status === 'finished').length;
  const agendados = state.confrontos.filter(c => c.status === 'scheduled').length;
  stats.innerHTML = `
    <div class="card"><span class="card-tag">Torneio</span><h3>${state.times.length}</h3><p class="subtitle">Equipes</p></div>
    <div class="card"><span class="card-tag">Atletas</span><h3>${state.competidores.length}</h3><p class="subtitle">Competidores</p></div>
    <div class="card"><span class="card-tag">Encerrados</span><h3>${encerrados}</h3><p class="subtitle">Resultados</p></div>
    <div class="card"><span class="card-tag">Agendados</span><h3>${agendados}</h3><p class="subtitle">Próximos</p></div>
  `;
  const upcoming = state.confrontos.filter(c => c.status === 'scheduled').slice(0, 4);
  proximos.innerHTML = upcoming.map(c => {
    const jogo = state.jogos.find(j => j.id == c.gameId);
    const time1 = state.times.find(t => t.id == c.team1Id);
    const time2 = state.times.find(t => t.id == c.team2Id);
    return `<div class="card"><span class="card-tag">${jogo?.name || 'Jogo'}</span>
      <div class="match-card"><div class="team-score"><strong>${time1?.name || 'TBD'}</strong></div>
      <div class="vs">VS</div><div class="team-score"><strong>${time2?.name || 'TBD'}</strong></div></div></div>`;
  }).join('') || '<p class="subtitle">Nenhum confronto agendado.</p>';
}

function renderizarJogos() {
  document.getElementById('list-jogos').innerHTML = state.jogos.map(j => `
    <div class="card">
      <span class="card-tag">${j.genre}</span>
      <h3>${j.name}</h3>
      <p class="subtitle">ID: ${j.id}</p>
      <div style="display:flex;gap:0.5rem;margin-top:1rem">
        <button class="btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem" onclick="editarItem('jogo',${j.id})">Editar</button>
        <button style="background:#ef4444;color:#fff;padding:0.4rem 1rem;font-size:0.85rem;border-radius:12px" onclick="excluirItem('jogos',${j.id})">Excluir</button>
      </div>
    </div>`).join('');
}

function renderizarTimes() {
  document.getElementById('list-times').innerHTML = state.times.map(t => `
    <div class="card" style="border-right:4px solid ${t.color}">
      <span class="card-tag">EQUIPE</span>
      <h3>${t.name}</h3>
      <p class="subtitle">${state.competidores.filter(c => c.teamId == t.id).length} Jogadores</p>
      <div style="display:flex;gap:0.5rem;margin-top:1rem">
        <button class="btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem" onclick="editarItem('time',${t.id})">Editar</button>
        <button style="background:#ef4444;color:#fff;padding:0.4rem 1rem;font-size:0.85rem;border-radius:12px" onclick="excluirItem('times',${t.id})">Excluir</button>
      </div>
    </div>`).join('');
}

function renderizarCompetidores() {
  document.getElementById('list-competidores').innerHTML = state.competidores.map(c => {
    const time = state.times.find(t => t.id == c.teamId);
    return `<div class="card">
      <span class="card-tag">${time?.name || 'Sem Time'}</span>
      <h3>${c.nickname}</h3>
      <p class="subtitle">${c.name}</p>
      <div style="display:flex;gap:0.5rem;margin-top:1rem">
        <button class="btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem" onclick="editarItem('competidor',${c.id})">Editar</button>
        <button style="background:#ef4444;color:#fff;padding:0.4rem 1rem;font-size:0.85rem;border-radius:12px" onclick="excluirItem('competidores',${c.id})">Excluir</button>
      </div>
    </div>`;
  }).join('');
}

function renderizarConfrontos() {
  document.getElementById('list-confrontos').innerHTML = state.confrontos.map(c => {
    const jogo = state.jogos.find(j => j.id == c.gameId);
    const time1 = state.times.find(t => t.id == c.team1Id);
    const time2 = state.times.find(t => t.id == c.team2Id);
    const data = new Date(c.date).toLocaleString('pt-BR');
    return `<div class="card">
      <span class="card-tag">${jogo?.name || 'Jogo'} | ${data}</span>
      <div class="match-card">
        <div class="team-score"><strong>${time1?.name || '???'}</strong><div class="score">${c.score1}</div></div>
        <div class="vs">VS</div>
        <div class="team-score"><strong>${time2?.name || '???'}</strong><div class="score">${c.score2}</div></div>
      </div>
      <p class="subtitle">${c.status === 'finished' ? 'Encerrado' : 'Agendado'}</p>
      <div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap">
        ${c.status === 'scheduled' ? `<button class="btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem" onclick="encerrarConfrontos(${c.id})">Encerrar</button>` : ''}
        <button class="btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem" onclick="editarItem('confronto',${c.id})">Editar</button>
        <button style="background:#ef4444;color:#fff;padding:0.4rem 1rem;font-size:0.85rem;border-radius:12px" onclick="excluirItem('confrontos',${c.id})">Excluir</button>
      </div>
    </div>`;
  }).join('');
}

const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

window.abrirFormulario = function (tipo, item = null) {
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.opacity = '1'; modal.style.pointerEvents = 'auto'; }, 10);
  const optionsTimes = state.times.map(t => `<option value="${t.id}" ${item && item.teamId == t.id ? 'selected' : ''}>${t.name}</option>`).join('');
  const optionsJogos = state.jogos.map(j => `<option value="${j.id}" ${item && item.gameId == j.id ? 'selected' : ''}>${j.name}</option>`).join('');
  const optionsTeam1 = state.times.map(t => `<option value="${t.id}" ${item && item.team1Id == t.id ? 'selected' : ''}>${t.name}</option>`).join('');
  const optionsTeam2 = state.times.map(t => `<option value="${t.id}" ${item && item.team2Id == t.id ? 'selected' : ''}>${t.name}</option>`).join('');
  const isEdit = !!item;
  const formularios = {
    jogo: `<h2>${isEdit ? 'Editar' : 'Adicionar'} Jogo</h2>
      <form onsubmit="salvarItem(event,'jogos',${item ? item.id : 'null'})">
        <div class="form-group"><label>Nome do Jogo</label><input type="text" name="name" required value="${item?.name || ''}"></div>
        <div class="form-group"><label>Gênero</label><input type="text" name="genre" required value="${item?.genre || ''}"></div>
        <div style="display:flex;gap:1rem"><button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Salvar'}</button>
        <button type="button" onclick="fecharModal()">Cancelar</button></div></form>`,
    time: `<h2>${isEdit ? 'Editar' : 'Adicionar'} Time</h2>
      <form onsubmit="salvarItem(event,'times',${item ? item.id : 'null'})">
        <div class="form-group"><label>Nome da Equipe</label><input type="text" name="name" required value="${item?.name || ''}"></div>
        <div class="form-group"><label>Cor Identidade</label><input type="color" name="color" value="${item?.color || '#6366f1'}"></div>
        <div style="display:flex;gap:1rem"><button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Criar'}</button>
        <button type="button" onclick="fecharModal()">Cancelar</button></div></form>`,
    competidor: `<h2>${isEdit ? 'Editar' : 'Registrar'} Competidor</h2>
      <form onsubmit="salvarItem(event,'competidores',${item ? item.id : 'null'})">
        <div class="form-group"><label>Nome Completo</label><input type="text" name="name" required value="${item?.name || ''}"></div>
        <div class="form-group"><label>Nickname</label><input type="text" name="nickname" required value="${item?.nickname || ''}"></div>
        <div class="form-group"><label>Time</label><select name="teamId" required>${optionsTimes}</select></div>
        <div style="display:flex;gap:1rem"><button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Registrar'}</button>
        <button type="button" onclick="fecharModal()">Cancelar</button></div></form>`,
    confronto: `<h2>${isEdit ? 'Editar' : 'Novo'} Confronto</h2>
      <form onsubmit="salvarItem(event,'confrontos',${item ? item.id : 'null'})">
        <div class="form-group"><label>Jogo</label><select name="gameId" required>${optionsJogos}</select></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="form-group"><label>Time A</label><select name="team1Id" required>${optionsTeam1}</select></div>
          <div class="form-group"><label>Time B</label><select name="team2Id" required>${optionsTeam2}</select></div>
        </div>
        <div class="form-group"><label>Data/Hora</label><input type="datetime-local" name="date" required value="${item?.date ? item.date.slice(0,16) : new Date().toISOString().slice(0,16)}"></div>
        ${isEdit ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="form-group"><label>Placar Time A</label><input type="number" name="score1" value="${item?.score1 ?? 0}"></div>
          <div class="form-group"><label>Placar Time B</label><input type="number" name="score2" value="${item?.score2 ?? 0}"></div>
        </div>
        <div class="form-group"><label>Status</label><select name="status"><option value="scheduled" ${item?.status==='scheduled'?'selected':''}>Agendado</option><option value="finished" ${item?.status==='finished'?'selected':''}>Encerrado</option></select></div>` : `
        <input type="hidden" name="score1" value="0"><input type="hidden" name="score2" value="0"><input type="hidden" name="status" value="scheduled">`}
        <div style="display:flex;gap:1rem"><button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Agendar'}</button>
        <button type="button" onclick="fecharModal()">Cancelar</button></div></form>`
  };
  formContent.innerHTML = formularios[tipo] || '';
};

window.editarItem = function (tipo, id) {
  const map = { jogo: 'jogos', time: 'times', competidor: 'competidores', confronto: 'confrontos' };
  const item = state[map[tipo]].find(i => i.id == id);
  if (item) abrirFormulario(tipo, item);
};

window.fecharModal = function () {
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';
  setTimeout(() => { modal.style.display = 'none'; }, 300);
};

window.salvarItem = async function (event, colecao, id) {
  event.preventDefault();
  const dados = Object.fromEntries(new FormData(event.target).entries());
  if (dados.teamId) dados.teamId = Number(dados.teamId);
  if (dados.gameId) dados.gameId = Number(dados.gameId);
  if (dados.team1Id) dados.team1Id = Number(dados.team1Id);
  if (dados.team2Id) dados.team2Id = Number(dados.team2Id);
  if (dados.score1 !== undefined) dados.score1 = Number(dados.score1);
  if (dados.score2 !== undefined) dados.score2 = Number(dados.score2);

  try {
    if (id) {
      if (colecao === 'jogos') await updateJogo(id, dados);
      else if (colecao === 'times') await updateTime(id, dados);
      else if (colecao === 'competidores') await updateCompetidor(id, dados);
      else if (colecao === 'confrontos') await updateConfronto(id, dados);
    } else {
      if (colecao === 'jogos') await createJogo(dados);
      else if (colecao === 'times') await createTime(dados);
      else if (colecao === 'competidores') await createCompetidor(dados);
      else if (colecao === 'confrontos') await createConfronto(dados);
    }
    await carregarDados();
    renderizarTudo();
    fecharModal();
  } catch (e) {}
};

window.excluirItem = async function (colecao, id) {
  if (!confirm('Confirmar exclusão?')) return;
  try {
    if (colecao === 'jogos') await deleteJogo(id);
    else if (colecao === 'times') await deleteTime(id);
    else if (colecao === 'competidores') await deleteCompetidor(id);
    else if (colecao === 'confrontos') await deleteConfronto(id);
    await carregarDados();
    renderizarTudo();
  } catch (e) {}
};

window.encerrarConfrontos = async function (id) {
  const confronto = state.confrontos.find(c => c.id == id);
  if (!confronto) return;
  const time1 = state.times.find(t => t.id == confronto.team1Id);
  const time2 = state.times.find(t => t.id == confronto.team2Id);
  const placar1 = prompt(`Placar para ${time1?.name}:`, '0');
  const placar2 = prompt(`Placar para ${time2?.name}:`, '0');
  if (placar1 !== null && placar2 !== null) {
    try {
      await updateConfronto(id, { score1: Number(placar1), score2: Number(placar2), status: 'finished' });
      await carregarDados();
      renderizarTudo();
    } catch (e) {}
  }
};
