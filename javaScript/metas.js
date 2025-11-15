function inicializarPaginaMetas() {
    carregarMetaAtual();
    exibirEstatisticas();
    exibirConquistas();
    exibirHistorico();
}

function carregarMetaAtual() {
    const metaAtual = localStorage.getItem('metaDiaria') || '3';
    document.getElementById('selectMeta').value = metaAtual;
}

document.getElementById('formMeta').addEventListener('submit', function (event) {
    event.preventDefault();

    const novaMeta = document.getElementById('selectMeta').value;

    if (!novaMeta || novaMeta < 1) {
        alert('Por favor, selecione uma meta válida!');
        return;
    }

    localStorage.setItem('metaDiaria', novaMeta);
    alert('✅ Meta atualizada com sucesso!');
    exibirEstatisticas();
});

function exibirEstatisticas() {
    const historico = JSON.parse(localStorage.getItem('historicoLeitura') || '[]');
    const totalCapitulos = historico.length;
    const sequencia = parseInt(localStorage.getItem('sequenciaDias') || '0');
    const melhorSeq = parseInt(localStorage.getItem('melhorSequencia') || '0');

    if (sequencia > melhorSeq) {
        localStorage.setItem('melhorSequencia', sequencia.toString());
    }

    document.getElementById('totalCapitulos').textContent = totalCapitulos;
    document.getElementById('sequenciaAtual').textContent = sequencia;

    const diasAtivos = calcularDiasAtivos(historico);
    const media = diasAtivos > 0 ? (totalCapitulos / diasAtivos).toFixed(1) : 0;
    document.getElementById('mediaCapitulos').textContent = media;

    if (historico.length > 0) {
        const primeira = new Date(historico[0].data).toLocaleDateString('pt-BR');
        const ultima = new Date(historico[historico.length - 1].data).toLocaleDateString('pt-BR');
        document.getElementById('primeiraLeitura').textContent = primeira;
        document.getElementById('ultimaLeituraData').textContent = ultima;
    }

    const melhorSequenciaFinal = Math.max(sequencia, melhorSeq);
    document.getElementById('melhorSequencia').textContent = melhorSequenciaFinal + ' dias';

    const capituloFav = encontrarCapituloFavorito(historico);
    document.getElementById('capituloFavorito').textContent = capituloFav || '-';

    const capitulosHoje = parseInt(localStorage.getItem('capitulosHoje') || '0');
    const metaDiaria = parseInt(localStorage.getItem('metaDiaria') || '3');
    const progresso = Math.min((capitulosHoje / metaDiaria) * 100, 100);
    const progressBar = document.getElementById('progressoGeral');
    progressBar.style.width = progresso + '%';
    progressBar.textContent = Math.round(progresso) + '%';
}

function calcularDiasAtivos(historico) {
    if (historico.length === 0) return 0;
    const datasUnicas = new Set(historico.map(h => new Date(h.data).toDateString()));
    return datasUnicas.size;
}

function encontrarCapituloFavorito(historico) {
    if (historico.length === 0) return null;

    const contagem = {};
    historico.forEach(h => {
        const ref = h.referencia;
        contagem[ref] = (contagem[ref] || 0) + 1;
    });

    let maxLeituras = 0;
    let favorito = null;
    for (const [ref, count] of Object.entries(contagem)) {
        if (count > maxLeituras) {
            maxLeituras = count;
            favorito = ref;
        }
    }
    return favorito;
}

function exibirConquistas() {
    const totalCapitulos = JSON.parse(localStorage.getItem('historicoLeitura') || '[]').length;
    const sequencia = parseInt(localStorage.getItem('sequenciaDias') || '0');

    const conquistasArea = document.getElementById('conquistasArea');
    conquistasArea.innerHTML = '';

    const conquistas = [
        { nome: 'Primeiro Passo', descricao: 'Leia seu primeiro capítulo', requisito: 1, atual: totalCapitulos, icon: 'star' },
        { nome: 'Dedicado', descricao: 'Leia 10 capítulos', requisito: 10, atual: totalCapitulos, icon: 'bookmark' },
        { nome: 'Persistente', descricao: 'Leia 50 capítulos', requisito: 50, atual: totalCapitulos, icon: 'trophy' },
        { nome: 'Sequência Iniciada', descricao: 'Mantenha 3 dias seguidos', requisito: 3, atual: sequencia, icon: 'fire' },
        { nome: 'Comprometido', descricao: 'Mantenha 7 dias seguidos', requisito: 7, atual: sequencia, icon: 'heart' },
        { nome: 'Campeão', descricao: 'Mantenha 30 dias seguidos', requisito: 30, atual: sequencia, icon: 'award' }
    ];

    conquistas.forEach(c => {
        const desbloqueada = c.atual >= c.requisito;
        const progresso = Math.min((c.atual / c.requisito) * 100, 100);

        const html = `
                    <div class="col-md-4">
                        <div class="achievement-card ${desbloqueada ? '' : 'opacity-50'}">
                            <div class="achievement-icon">
                                <i class="bi bi-${c.icon}${desbloqueada ? '-fill' : ''}"></i>
                            </div>
                            <h6>${c.nome}</h6>
                            <p class="mb-2" style="font-size: 0.85rem;">${c.descricao}</p>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-light" style="width: ${progresso}%"></div>
                            </div>
                            <small class="mt-1 d-block">${c.atual}/${c.requisito}</small>
                        </div>
                    </div>
                `;
        conquistasArea.innerHTML += html;
    });
}

function exibirHistorico() {
    const historico = JSON.parse(localStorage.getItem('historicoLeitura') || '[]');
    const historicoArea = document.getElementById('historicoArea');

    if (historico.length === 0) {
        historicoArea.innerHTML = '<p class="text-muted">Nenhuma leitura registrada ainda.</p>';
        return;
    }

    historicoArea.innerHTML = '';
    const ultimasLeituras = historico.slice(-20).reverse();

    ultimasLeituras.forEach(leitura => {
        const data = new Date(leitura.data);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const html = `
                    <div class="history-item">
                        <div class="history-date">${dataFormatada}</div>
                        <div class="mt-1">
                            <i class="bi bi-book"></i> ${leitura.referencia}
                        </div>
                    </div>
                `;
        historicoArea.innerHTML += html;
    });
}

function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita!')) {
        if (confirm('Última confirmação: Isso apagará TODAS suas leituras e estatísticas!')) {
            localStorage.removeItem('historicoLeitura');
            localStorage.setItem('capitulosHoje', '0');
            localStorage.setItem('sequenciaDias', '0');
            localStorage.setItem('melhorSequencia', '0');
            alert('Histórico limpo com sucesso!');
            location.reload();
        }
    }
}

function voltarParaPrincipal() {
    window.location.href = 'index.html';
}

window.addEventListener('load', inicializarPaginaMetas);