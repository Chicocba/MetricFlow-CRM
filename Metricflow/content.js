function criarPainel() {

    const painel = document.createElement("div");

    painel.id = "metricflow-panel";

    painel.innerHTML = `
        <h2>MetricFlow CRM</h2>

        <input type="text" placeholder="Nome">

        <input type="text" placeholder="Telefone">

        <button>Salvar</button>
    `;

    document.body.appendChild(painel);
}

setTimeout(() => {
    criarPainel();
}, 3000);