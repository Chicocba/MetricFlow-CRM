// ========================================
// METRICFLOW CRM
// VERSÃO 0.2
// ========================================

console.log("MetricFlow iniciado");

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let ultimoNome = "";

// ========================================
// CRIAÇÃO DO PAINEL CRM
// ========================================

/**
 * Cria o painel principal do CRM
 * dentro do WhatsApp Web.
 *
 * Executa apenas uma vez.
 */
function criarPainel() {

    if (document.getElementById("metricflow-panel")) {
        return;
    }

    const painel = document.createElement("div");

    painel.id = "metricflow-panel";

    painel.innerHTML = `
        <h2>MetricFlow CRM</h2>

        <label>Nome</label>
        <input id="mf-nome" type="text" readonly>

        <label>Telefone</label>
        <input id="mf-telefone" type="text">

        <label>Tag</label>
        <select id="mf-tag">
            <option>Lead</option>
            <option>Cliente</option>
            <option>Parceiro</option>
            <option>Fornecedor</option>
        </select>

        <label>Etapa</label>
        <select id="mf-etapa">
            <option>Novo Lead</option>
            <option>Contato Feito</option>
            <option>Qualificado</option>
            <option>Proposta</option>
            <option>Negociação</option>
            <option>Fechado</option>
        </select>

        <label>Observação</label>
        <textarea
            id="mf-observacao"
            rows="5"
        ></textarea>

        <button id="mf-salvar">
            Salvar
        </button>

        <div id="mf-status"></div>
    `;

    document.body.appendChild(painel);

    // Evento do botão Salvar

    document
        .getElementById("mf-salvar")
        .addEventListener("click", salvarContato);
}

// ========================================
// CAPTURA DE DADOS DO WHATSAPP
// ========================================

/**
 * Captura o nome do contato
 * atualmente aberto na conversa.
 *
 * Atualiza o campo Nome do CRM.
 */
function capturarNomeContato() {

    const spans = document.querySelectorAll("span[title]");

    for (const span of spans) {

        const nome = span.getAttribute("title");

        if (
            nome &&
            nome.length > 2 &&
            nome !== ultimoNome
        ) {

            ultimoNome = nome;

            const campoNome =
                document.getElementById("mf-nome");

            if (campoNome) {

                campoNome.value = nome;
                carregarContato(nome);

            }

            console.log(
                "Contato encontrado:",
                nome
            );

            break;
        }
    }
}

// ========================================
// CARREGAMENTO DE DADOS
// ========================================

/**
 * Carrega os dados do contato
 * salvos anteriormente.
 */
function carregarContato(nome) {

    chrome.storage.local.get([nome], (resultado) => {

        const dados = resultado[nome];

        if (!dados) {

            limparFormulario();

            return;
        }

        document.getElementById("mf-telefone").value =
            dados.telefone || "";

        document.getElementById("mf-tag").value =
            dados.tag || "Lead";

        document.getElementById("mf-etapa").value =
            dados.etapa || "Novo Lead";

        document.getElementById("mf-observacao").value =
            dados.observacao || "";

        console.log(
            "Contato carregado:",
            nome
        );
    });
}

/**
 * Limpa os campos do formulário.
 */
function limparFormulario() {

    document.getElementById("mf-telefone").value = "";

    document.getElementById("mf-tag").value = "Lead";

    document.getElementById("mf-etapa").value =
        "Novo Lead";

    document.getElementById("mf-observacao").value = "";
}

// ========================================
// STORAGE LOCAL
// ========================================

/**
 * Salva os dados do contato
 * no chrome.storage.local.
 */
function salvarContato() {

    const nome =
        document.getElementById("mf-nome").value;

    if (!nome) {

        alert("Nenhum contato selecionado");

        return;
    }

    const dados = {

        telefone:
            document.getElementById("mf-telefone").value,

        tag:
            document.getElementById("mf-tag").value,

        etapa:
            document.getElementById("mf-etapa").value,

        observacao:
            document.getElementById("mf-observacao").value,

        atualizadoEm:
            new Date().toISOString()
    };

    chrome.storage.local.set({

        [nome]: dados

    }, () => {

        const status =
            document.getElementById("mf-status");

        if (status) {

            status.innerText =
                "✅ Salvo com sucesso";

            setTimeout(() => {

                status.innerText = "";

            }, 3000);
        }

        console.log(
            "Contato salvo:",
            nome
        );

        console.log(dados);
    });
}

// ========================================
// INICIALIZAÇÃO DO CRM
// ========================================

/**
 * Inicializa o MetricFlow CRM.
 */
function iniciarCRM() {

    criarPainel();

    setInterval(() => {

        capturarNomeContato();

    }, 2000);
}

// ========================================
// EXECUÇÃO
// ========================================

iniciarCRM();