/**
 * Consumo de APIs para Aplicação Bíblica
 * Bible API (https://bible-api.com/) - Busca capítulos bíblicos em português
 *Quotable API (https://api.quotable.io/) - Frases motivacionais ao completar metas
 */
let capituloAtual = null; // Armazena o capítulo atual sendo lido
let jaLidoHoje = false; // Controla se o capítulo atual já foi marcado como lido

//Funcao para inicializar a aplicação
function inicializarApp() {
    // Carrega e exibe as estatísticas do usuário
    carregarEstatisticas();

    // Verifica se a meta diária já foi cumprida
    verificarMetaCumprida();
}

// ========================================
// FUNÇÃO: CARREGAR ESTATÍSTICAS DO LOCALSTORAGE
// ========================================
function carregarEstatisticas() {
    // Obtém dados salvos no localStorage ou usa valores padrão
    const hoje = new Date().toDateString();
    const ultimaLeitura = localStorage.getItem('ultimaLeitura');

    // Verifica se é um novo dia (reseta contador diário)
    if (ultimaLeitura !== hoje) {
        localStorage.setItem('capitulosHoje', '0');
        localStorage.setItem('ultimaLeitura', hoje);

        // Verifica sequência de dias
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        if (ultimaLeitura === ontem.toDateString()) {
            // Mantém sequência
        } else if (ultimaLeitura) {
            // Quebrou a sequência
            localStorage.setItem('sequenciaDias', '0');
        }
    }

    // Carrega valores do localStorage
    const capitulosHoje = parseInt(localStorage.getItem('capitulosHoje') || '0');
    const metaDiaria = parseInt(localStorage.getItem('metaDiaria') || '3');
    const sequencia = parseInt(localStorage.getItem('sequenciaDias') || '0');

    // Atualiza interface
    document.getElementById('capitulosLidos').textContent = capitulosHoje;
    document.getElementById('metaDiaria').textContent = metaDiaria;
    document.getElementById('sequencia').textContent = sequencia;

    // Atualiza barra de progresso
    const progresso = Math.min((capitulosHoje / metaDiaria) * 100, 100);
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = progresso + '%';
    progressBar.textContent = Math.round(progresso) + '%';
}

//Aqui posso verificar se a meta diária foi cumprida
//Se cumprida, buscar uma frase motivacional na API e exibir um alerta
async function verificarMetaCumprida() {
    const capitulosHoje = parseInt(localStorage.getItem('capitulosHoje') || '0');
    const metaDiaria = parseInt(localStorage.getItem('metaDiaria') || '3');
    const metaCumpridaHoje = localStorage.getItem('metaCumpridaHoje');
    const hoje = new Date().toDateString();

    // VALIDAÇÃO 1: Verifica se meta foi cumprida e ainda não foi mostrada hoje
    if (capitulosHoje >= metaDiaria && metaCumpridaHoje !== hoje) {
        // Busca frase motivacional da API
        await buscarFraseMotivacional();
        localStorage.setItem('metaCumpridaHoje', hoje);
    }
}

//Busca uma frase motivacional na API Quotable  
async function buscarFraseMotivacional() {
    try {
        // Consume API de citações motivacionais
        const response = await fetch('https://api.quotable.io/random?tags=inspirational');

        // VALIDAÇÃO 2: Verifica se a requisição foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao buscar frase motivacional');
        }

        const data = await response.json();

        // Exibe alerta com frase motivacional
        const alertaMeta = document.getElementById('alertaMeta');
        const mensagem = document.getElementById('mensagemMotivacional');
        mensagem.textContent = `"${data.content}" - ${data.author}`;
        alertaMeta.classList.remove('d-none');

        // Incrementa sequência de dias
        const sequenciaAtual = parseInt(localStorage.getItem('sequenciaDias') || '0');
        localStorage.setItem('sequenciaDias', (sequenciaAtual + 1).toString());
        carregarEstatisticas();
    } catch (error) {
        console.error('Erro ao buscar frase:', error);
        // Mensagem padrão caso a API falhe
        const alertaMeta = document.getElementById('alertaMeta');
        const mensagem = document.getElementById('mensagemMotivacional');
        mensagem.textContent = 'Continue firme na sua jornada de fé!';
        alertaMeta.classList.remove('d-none');
    }
}

//evento de submit do formulário de busca
document.getElementById('formBusca').addEventListener('submit', async function (event) {
    // Previne reload da página
    event.preventDefault();

    // Obtém valores dos inputs
    const livro = document.getElementById('inputLivro').value.trim();
    const capitulo = document.getElementById('inputCapitulo').value.trim();

    // VALIDAÇÃO 3: Verifica se campos não estão vazios
    if (livro === '' || capitulo === '') {
        alert('Por favor, preencha o livro e o capítulo!');
        return;
    }

    // VALIDAÇÃO 4: Verifica se capítulo é um número válido
    if (isNaN(capitulo) || parseInt(capitulo) < 1) {
        alert('Por favor, informe um número de capítulo válido!');
        return;
    }

    // Chama função de busca
    await buscarCapitulo(livro, capitulo);
});

//busca o capítulo na API Bible-API 
async function buscarCapitulo(livro, capitulo) {
    // Reseta estado de leitura
    jaLidoHoje = false;

    // Mostra loading
    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('areaLeitura').classList.add('d-none');

    try {
        // Formata referência bíblica para a API
        const referencia = `${livro} ${capitulo}`;

        // Consome API Bible-API (em português)
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(referencia)}?translation=almeida`);

        // VALIDAÇÃO 5: Verifica se a requisição foi bem-sucedida
        if (!response.ok) {
            throw new Error('Capítulo não encontrado. Verifique o nome do livro e número do capítulo.');
        }

        const data = await response.json();

        // Armazena capítulo atual
        capituloAtual = {
            livro: livro,
            capitulo: capitulo,
            referencia: data.reference
        };

        // Exibe o capítulo
        exibirCapitulo(data);

    } catch (error) {
        alert(error.message || 'Erro ao buscar capítulo. Verifique se o nome do livro está correto (ex: João, Salmos, Gênesis).');
        console.error('Erro:', error);
    } finally {
        // Esconde loading
        document.getElementById('loading').classList.add('d-none');
    }
}

//função para exibir o capítulo na interface
function exibirCapitulo(data) {
    const areaLeitura = document.getElementById('areaLeitura');
    const tituloCapitulo = document.getElementById('tituloCapitulo');
    const textoLeitura = document.getElementById('textoLeitura');

    // Define título
    tituloCapitulo.innerHTML = `<i class="bi bi-book-fill"></i> ${data.reference}`;

    // Formata versículos
    let textoFormatado = '';
    data.verses.forEach(verso => {
        textoFormatado += `<p><span class="verse-number">${verso.verse}</span>${verso.text}</p>`;
    });

    textoLeitura.innerHTML = textoFormatado;

    // Mostra área de leitura
    areaLeitura.classList.remove('d-none');

    // Rola para a área de leitura
    areaLeitura.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

//marcar o capítulo atual como lido
function marcarComoLido() {
    // Verifica se há um capítulo carregado
    if (!capituloAtual) {
        alert('Nenhum capítulo carregado!');
        return;
    }

    // Verifica se já foi marcado como lido
    if (jaLidoHoje) {
        alert('Este capítulo já foi contabilizado hoje!');
        return;
    }

    // Incrementa contador de capítulos lidos hoje
    const capitulosHoje = parseInt(localStorage.getItem('capitulosHoje') || '0');
    localStorage.setItem('capitulosHoje', (capitulosHoje + 1).toString());

    // Salva histórico de leitura
    salvarHistorico(capituloAtual);

    // Marca como lido
    jaLidoHoje = true;

    // Atualiza estatísticas
    carregarEstatisticas();

    // Verifica se completou a meta
    verificarMetaCumprida();

    // Feedback visual
    alert(` Capítulo ${capituloAtual.referencia} marcado como lido!`);
}

//salvar o capítulo lido no histórico   
function salvarHistorico(capitulo) {
    // Obtém histórico existente
    let historico = JSON.parse(localStorage.getItem('historicoLeitura') || '[]');

    // Adiciona nova leitura com data
    historico.push({
        referencia: capitulo.referencia,
        data: new Date().toISOString(),
        timestamp: Date.now()
    });

    // Mantém apenas últimas 100 leituras
    if (historico.length > 100) {
        historico = historico.slice(-100);
    }

    // Salva no localStorage
    localStorage.setItem('historicoLeitura', JSON.stringify(historico));
}
//navegar para a página de metas
function irParaMetas() {
    // Salva estado atual antes de navegar
    localStorage.setItem('ultimaPagina', 'principal');

    // Navega para página de metas usando location.href
    window.location.href = 'metas.html';
}
//inicializar a página de metas
// Executa quando a página carregar
window.addEventListener('load', inicializarApp);