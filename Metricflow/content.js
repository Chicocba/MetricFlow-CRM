// ========================================
// METRICFLOW CRM
// ========================================

let contatoAtual = null;

// ========================================
// CRIAR PAINEL
// ========================================

function criarPainel() {

    if (document.getElementById("metricflow-panel")) return;

    const painel = document.createElement("div");

    painel.id = "metricflow-panel";

    painel.innerHTML = `
        <h2>MetricFlow CRM</h2>

        <label>Nome</label>
        <input id="mf-nome" type="text" readonly>

        <label>Telefone</label>
        <input id="mf-telefone" type="text">

        <label>Observações</label>
        <textarea id="mf-nota" rows="5"></textarea>

        <button id="mf-salvar">
            Salvar Contato
        </button>

        <div id="mf-status"></div>
    `;

    document.body.appendChild(painel);

    document
        .getElementById("mf-salvar")
        .addEventListener("click", salvarContato);
}

// ========================================
// OBTER NOME DO CONTATO
// ========================================

function obterNomeContato() {

    const elemento = document.querySelector(
        'header span[title]'
    );

    if (!elemento) return null;

    return elemento.getAttribute("title");
}

// ========================================
// CARREGAR DADOS
// ========================================

function carregarContato(nome) {

    chrome.storage.local.get([nome], (resultado) => {

        const dados = resultado[nome];

        document.getElementById("mf-nome").value = nome;

        document.getElementById("mf-telefone").value =
            dados?.telefone || "";

        document.getElementById("mf-nota").value =
            dados?.nota || "";
    });
}

// ========================================
// SALVAR CONTATO
// ========================================

function salvarContato() {

    const nome =
        document.getElementById("mf-nome").value;

    if (!nome) return;

    const telefone =
        document.getElementById("mf-telefone").value;

    const nota =
        document.getElementById("mf-nota").value;

    const dados = {
        [nome]: {
            telefone,
            nota,
            atualizadoEm: new Date().toISOString()
        }
    };

    chrome.storage.local.set(dados, () => {

        const status =
            document.getElementById("mf-status");

        status.innerText = "✅ Salvo";

        setTimeout(() => {
            status.innerText = "";
        }, 2000);
    });
}

// ========================================
// ATUALIZAR CONTATO ATUAL
// ========================================

function atualizarContatoAtual() {

    const nome = obterNomeContato();

    if (!nome) return;

    if (nome === contatoAtual) return;

    contatoAtual = nome;

    carregarContato(nome);

    console.log(
        "Contato detectado:",
        contatoAtual
    );
}

// ========================================
// AGUARDAR WHATSAPP
// ========================================

function aguardarWhatsApp() {

    const intervalo = setInterval(() => {

        const header = document.querySelector("header");

        if (!header) return;

        clearInterval(intervalo);

        criarPainel();

        atualizarContatoAtual();

        setInterval(() => {
            atualizarContatoAtual();
        }, 1000);

        console.log("MetricFlow iniciado");

    }, 1000);
}

// ========================================
// INICIAR
// ========================================

aguardarWhatsApp();