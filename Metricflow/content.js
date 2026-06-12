
// ========================================
// METRICFLOW CRM IA v1.1 - STABLE BUILD
// WhatsApp CRM + Pipeline + Messaging Engine
// ========================================

console.log("MetricFlow IA v1.1 iniciado");

// ========================================
// STATE
// ========================================

let ultimoNome = "";
let carregandoContato = false;

// chave única (evita inconsistência)
const STORAGE_KEY = "leads";

// ========================================
// UTIL: NORMALIZA NOME
// ========================================

function normalizarNome(nome) {

    if (!nome) return "";

    return nome
        .replace(/\(.*?\)/g, "")
        .replace(/mensagens para mim/i, "")
        .replace(/\s+/g, " ")
        .trim();
}

// ========================================
// UTIL: CAPTURA TELEFONE (FALLBACK WHATSAPP)
// ========================================

function capturarTelefone() {

    try {

        const link =
            document.querySelector('a[href*="wa.me"]') ||
            document.querySelector('a[href*="phone"]');

        if (link) {
            const match = link.href.match(/(\d{10,15})/);
            if (match) return match[0];
        }

        const bodyMatch =
            document.body.innerText.match(/(\+?\d{10,15})/);

        if (bodyMatch) return bodyMatch[0];

    } catch (e) {
        console.error("Erro telefone:", e);
    }

    return "";
}

// ========================================
// IA - SCORE DO LEAD
// ========================================

function calcularScore(lead) {

    let score = 0;

    if (lead.telefone) score += 20;
    if (lead.credito) score += 20;
    if (lead.followup) score += 15;

    const etapas = {
        "Novo Lead": 5,
        "Contato Feito": 15,
        "Qualificado": 30,
        "Proposta": 60,
        "Negociação": 80,
        "Fechado": 100
    };

    score += etapas[lead.etapa] || 0;

    if (lead.atualizadoEm) {

        const dias =
            (Date.now() - new Date(lead.atualizadoEm)) / 86400000;

        if (dias <= 1) score += 15;
        else if (dias <= 3) score += 10;
        else if (dias <= 7) score += 5;
    }

    return Math.min(score, 100);
}

// ========================================
// CLASSIFICAÇÃO IA
// ========================================

function classificarLead(lead) {

    const score = calcularScore(lead);

    if (score >= 75) return { nivel: "🔥 QUENTE", score };
    if (score >= 45) return { nivel: "⚡ MORNO", score };

    return { nivel: "❄ FRIO", score };
}

// ========================================
// SALVAR LEAD (ROBUSTO)
// ========================================

function salvarLead(nome, dados) {

    chrome.storage.local.get([STORAGE_KEY], (res) => {

        const leads = res.leads || {};

        leads[nome] = {
            ...leads[nome],
            ...dados,
            atualizadoEm: new Date().toISOString()
        };

        chrome.storage.local.set({ leads }, () => {
            console.log("Lead salvo:", nome);
        });
    });
}

// ========================================
// CARREGAR LEAD
// ========================================

function carregarLead(nome) {

    chrome.storage.local.get([STORAGE_KEY], (res) => {

        const leads = res.leads || {};

        const lead = leads[nome];

        if (!lead) return;

        document.getElementById("mf-telefone").value = lead.telefone || "";
        document.getElementById("mf-interesse").value = lead.interesse || "Imóvel";
        document.getElementById("mf-credito").value = lead.credito || "";
        document.getElementById("mf-parcela").value = lead.parcela || "";
        document.getElementById("mf-lance").value = lead.lance || "";
        document.getElementById("mf-followup").value = lead.followup || "";
        document.getElementById("mf-temperatura").value = lead.temperatura || "Morno";
        document.getElementById("mf-etapa").value = lead.etapa || "Novo Lead";
    });
}

// ========================================
// CAPTURA WHATSAPP
// ========================================

function capturarContatoWhatsApp() {

    try {

        const header = document.querySelector("header");

        if (!header) return;

        const nome = normalizarNome(header.innerText.split("\n")[0]);

        if (!nome || nome === ultimoNome) return;

        ultimoNome = nome;

        const telefone = capturarTelefone();

        document.getElementById("mf-nome").value = nome;

        if (telefone) {
            document.getElementById("mf-telefone").value = telefone;
        }

        carregarLead(nome);

    } catch (e) {
        console.error("Erro captura:", e);
    }
}

// ========================================
// SALVAR FORMULÁRIO
// ========================================

function salvarFormulario() {

    const nome = document.getElementById("mf-nome")?.value;

    if (!nome) return;

    const dados = {

        telefone: document.getElementById("mf-telefone")?.value || capturarTelefone(),
        interesse: document.getElementById("mf-interesse")?.value,
        credito: Number(document.getElementById("mf-credito")?.value || 0),
        parcela: document.getElementById("mf-parcela")?.value,
        lance: document.getElementById("mf-lance")?.value,
        followup: document.getElementById("mf-followup")?.value,
        temperatura: document.getElementById("mf-temperatura")?.value,
        etapa: document.getElementById("mf-etapa")?.value

    };

    salvarLead(nome, dados);
}

// ========================================
// ENVIO EM MASSA (FILA REAL)
// ========================================

async function enviarMensagens(lista, mensagem, delay = 7000) {

    for (let i = 0; i < lista.length; i++) {

        const numero = lista[i];

        try {

            const url =
                `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensagem)}`;

            window.location.href = url;

            await new Promise(r => setTimeout(r, 5000));

            const btn = document.querySelector('span[data-icon="send"]');

            if (btn) btn.click();

            console.log("Enviado:", numero);

        } catch (e) {
            console.error("Erro envio:", numero);
        }

        await new Promise(r => setTimeout(r, delay));
    }

    console.log("Envio finalizado");
}

// ========================================
// KANBAN SIMPLES (ESTÁVEL)
// ========================================

function atualizarKanban() {

    const container = document.getElementById("kanban");

    if (!container) return;

    chrome.storage.local.get([STORAGE_KEY], (res) => {

        const leads = res.leads || {};

        container.innerHTML = "";

        const etapas = [
            "Novo Lead",
            "Contato Feito",
            "Qualificado",
            "Proposta",
            "Negociação",
            "Fechado"
        ];

        etapas.forEach(etapa => {

            const coluna = document.createElement("div");

            coluna.style = `
                width: 100%;
                background: #f5f5f5;
                margin-bottom: 10px;
                padding: 10px;
                border-radius: 10px;
            `;

            coluna.innerHTML = `<strong>${etapa}</strong>`;

            Object.keys(leads)
                .filter(nome => leads[nome].etapa === etapa)
                .forEach(nome => {

                    const lead = leads[nome];

                    const ia = classificarLead(lead);

                    const card = document.createElement("div");

                    card.style = `
                        background: white;
                        margin-top: 6px;
                        padding: 8px;
                        border-radius: 8px;
                        border: 1px solid #ddd;
                        font-size: 12px;
                    `;

                    card.innerHTML = `
                        <strong>${nome}</strong><br>
                        ${ia.nivel} (${ia.score})
                    `;

                    coluna.appendChild(card);
                });

            container.appendChild(coluna);
        });
    });
}

// ========================================
// INIT LOOP
// ========================================

function iniciar() {

    setInterval(() => {
        capturarContatoWhatsApp();
    }, 2000);

    setInterval(() => {
        atualizarKanban();
    }, 5000);
}

iniciar();