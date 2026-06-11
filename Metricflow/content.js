// ========================================
// METRICFLOW CRM
// VERSÃO 0.3
// ========================================

console.log("MetricFlow iniciado");

console.log("Chrome:", chrome);

console.log("Storage:", chrome.storage);

console.log("Runtime:", chrome.runtime);

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let ultimoNome = "";

let carregandoContato = false;

// ========================================
// CRIAÇÃO DO PAINEL CRM
// ========================================

/**
 * Cria o painel principal do CRM.
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
        <input
            id="mf-nome"
            type="text"
            readonly
        >

        <label>Telefone</label>
        <input
            id="mf-telefone"
            type="text"
        >

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

        <hr>

        <h3>Leads</h3>

        <div id="mf-leads-lista"></div>

        <div id="mf-total-leads"></div>
    `;

    document.body.appendChild(painel);

    // ====================================
    // EVENTOS
    // ====================================

    document
        .getElementById("mf-salvar")
        .addEventListener(
            "click",
            salvarContato
        );

    registrarEventosFormulario();
}

// ========================================
// CAPTURA DE DADOS DO WHATSAPP
// ========================================

/**
 * Captura o nome do contato aberto.
 */
function capturarNomeContato() {

    const spans =
        document.querySelectorAll("span[title]");

    for (const span of spans) {

        const nome =
            span.getAttribute("title");

        if (
            nome &&
            nome.length > 2 &&
            nome !== ultimoNome
        ) {

            ultimoNome = nome;

            const campoNome =
                document.getElementById(
                    "mf-nome"
                );

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
 * Carrega os dados salvos
 * do contato atual.
 */
function carregarContato(nome) {

    carregandoContato = true;

    try {

        chrome.storage.local.get(
            [nome],
            (resultado) => {

                if (
                    chrome.runtime.lastError
                ) {

                    console.error(
                        "Erro ao carregar:",
                        chrome.runtime.lastError
                    );

                    carregandoContato = false;

                    return;
                }

                const dados =
                    resultado[nome];

                if (!dados) {

                    limparFormulario();

                    carregandoContato = false;

                    return;
                }

                document.getElementById(
                    "mf-telefone"
                ).value =
                    dados.telefone || "";

                document.getElementById(
                    "mf-tag"
                ).value =
                    dados.tag || "Lead";

                document.getElementById(
                    "mf-etapa"
                ).value =
                    dados.etapa || "Novo Lead";

                document.getElementById(
                    "mf-observacao"
                ).value =
                    dados.observacao || "";

                console.log(
                    "Contato carregado:",
                    nome
                );

                carregandoContato = false;
            }
        );

    } catch (erro) {

        carregandoContato = false;

        console.error(
            "Erro geral:",
            erro
        );
    }
}

/**
 * Limpa os campos do formulário.
 */
function limparFormulario() {

    document.getElementById(
        "mf-telefone"
    ).value = "";

    document.getElementById(
        "mf-tag"
    ).value = "Lead";

    document.getElementById(
        "mf-etapa"
    ).value = "Novo Lead";

    document.getElementById(
        "mf-observacao"
    ).value = "";
}

// ========================================
// STORAGE LOCAL
// ========================================

/**
 * Salva os dados do contato.
 */
function salvarContato() {

    const nome =
        document.getElementById(
            "mf-nome"
        ).value;

    if (!nome) {
        return;
    }

    const dados = {

        telefone:
            document.getElementById(
                "mf-telefone"
            ).value,

        tag:
            document.getElementById(
                "mf-tag"
            ).value,

        etapa:
            document.getElementById(
                "mf-etapa"
            ).value,

        observacao:
            document.getElementById(
                "mf-observacao"
            ).value,

        atualizadoEm:
            new Date().toISOString()
    };

    chrome.storage.local.set(
        {
            [nome]: dados
        },
        () => {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    chrome.runtime.lastError
                );

                return;
            }

            const status =
                document.getElementById(
                    "mf-status"
                );

            if (status) {

                status.innerText =
                    "✅ Salvo";

                setTimeout(() => {

                    status.innerText = "";

                }, 2000);
            }

            console.log(
                "Contato salvo:",
                nome
            );

            atualizarListaLeads();
        }
    );
}

// ========================================
// AUTO SAVE
// ========================================

/**
 * Salva automaticamente
 * quando algum campo muda.
 */
function salvarContatoAutomaticamente() {

    if (carregandoContato) {
        return;
    }

    salvarContato();
}

/**
 * Registra eventos do formulário.
 */
function registrarEventosFormulario() {

    document
        .getElementById("mf-telefone")
        .addEventListener(
            "input",
            salvarContatoAutomaticamente
        );

    document
        .getElementById("mf-tag")
        .addEventListener(
            "change",
            salvarContatoAutomaticamente
        );

    document
        .getElementById("mf-etapa")
        .addEventListener(
            "change",
            salvarContatoAutomaticamente
        );

    document
        .getElementById("mf-observacao")
        .addEventListener(
            "input",
            salvarContatoAutomaticamente
        );
}

// ========================================
// LISTA DE LEADS
// ========================================

/**
 * Atualiza a lista de contatos
 * cadastrados no CRM.
 */
function atualizarListaLeads() {

    chrome.storage.local.get(null, (resultado) => {

        const lista =
            document.getElementById(
                "mf-leads-lista"
            );

        const total =
            document.getElementById(
                "mf-total-leads"
            );

        if (!lista || !total) {
            return;
        }

        lista.innerHTML = "";

        const contatos =
            Object.keys(resultado);

        contatos.forEach((nome) => {

            const item =
                document.createElement("div");

            item.className =
                "mf-lead-item";

            item.innerText = nome;

            lista.appendChild(item);
        });

        total.innerText =
            `Total: ${contatos.length} Leads`;
    });
}

// ========================================
// INICIALIZAÇÃO
// ========================================

/**
 * Inicializa o CRM.
 */
function iniciarCRM() {

    criarPainel();

    atualizarListaLeads();

    setInterval(() => {

        capturarNomeContato();

    }, 2000);
}

// ========================================
// EXECUÇÃO
// ========================================

iniciarCRM();