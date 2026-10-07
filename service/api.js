const BASE_URL = 'http://localhost:3000/api/';

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (response.status === 204) return null;
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.erro || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Erro em ${endpoint}:`, error);
    alert(`Erro: ${error.message}`);
    throw error;
  }
}

async function getJogos() { return request('jogos'); }
async function getTimes() { return request('times'); }
async function getCompetidores() { return request('competidores'); }
async function getConfrontos() { return request('confrontos'); }

async function createJogo(data) { return request('jogos', { method: 'POST', body: JSON.stringify(data) }); }
async function updateJogo(id, data) { return request(`jogos/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteJogo(id) { return request(`jogos/${id}`, { method: 'DELETE' }); }

async function createTime(data) { return request('times', { method: 'POST', body: JSON.stringify(data) }); }
async function updateTime(id, data) { return request(`times/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteTime(id) { return request(`times/${id}`, { method: 'DELETE' }); }

async function createCompetidor(data) { return request('competidores', { method: 'POST', body: JSON.stringify(data) }); }
async function updateCompetidor(id, data) { return request(`competidores/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteCompetidor(id) { return request(`competidores/${id}`, { method: 'DELETE' }); }

async function createConfronto(data) { return request('confrontos', { method: 'POST', body: JSON.stringify(data) }); }
async function updateConfronto(id, data) { return request(`confrontos/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteConfronto(id) { return request(`confrontos/${id}`, { method: 'DELETE' }); }
