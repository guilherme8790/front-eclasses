const BASE_URL = 'http://localhost:3000/api/';

async function getDados(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erro ao buscar ${endpoint}:`, error);
        alert(`Erro ao carregar ${endpoint}. Verifique se o servidor está rodando.`);
        return [];
    }
}

async function getJogos() {
    return getDados('jogos');
}

async function getTimes() {
    return getDados('times');
}

async function getCompetidores() {
    return getDados('competidores');
}

async function getConfrontos() {
    return getDados('confrontos');
}