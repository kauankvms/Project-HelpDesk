// =========================================================
// NOVO CHAMADO - INTERATIVIDADE DO FORMULÁRIO
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-novo-chamado");
  const selectPrioridade = document.getElementById("prioridade");
  const slaTempo = document.getElementById("sla-tempo");

  const inputAnexos = document.getElementById("input-anexos");
  const listaArquivos = document.getElementById("lista-arquivos");
  const areaUpload = document.getElementById("area-upload");

  let arquivosSelecionados = [];

  // 1. Atualizar Previsão de SLA com base na Prioridade
  const tabelaSLA = {
    baixa: "24 horas úteis",
    media: "8 horas úteis",
    alta: "4 horas úteis",
    critica: "1 hora (Atendimento imediato)",
  };

  selectPrioridade.addEventListener("change", (e) => {
    const prioridade = e.target.value;
    slaTempo.textContent = tabelaSLA[prioridade] || "8 horas úteis";
  });

  // 2. Manipulação de Anexos
  inputAnexos.addEventListener("change", (e) => {
    adicionarArquivos(Array.from(e.target.files));
    inputAnexos.value = "";
  });

  // Drag and drop visual
  areaUpload.addEventListener("dragover", (e) => {
    e.preventDefault();
    areaUpload.classList.add("drag-over");
  });

  areaUpload.addEventListener("dragleave", () => {
    areaUpload.classList.remove("drag-over");
  });

  areaUpload.addEventListener("drop", (e) => {
    e.preventDefault();
    areaUpload.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) {
      adicionarArquivos(Array.from(e.dataTransfer.files));
    }
  });

  function adicionarArquivos(novosArquivos) {
    arquivosSelecionados = [...arquivosSelecionados, ...novosArquivos];
    renderizarListaArquivos();
  }

  function renderizarListaArquivos() {
    listaArquivos.innerHTML = "";

    arquivosSelecionados.forEach((arquivo, index) => {
      const li = document.createElement("li");
      li.className = "item-arquivo";

      const tamanhoFormatado =
        (arquivo.size / (1024 * 1024)).toFixed(2) + " MB";

      li.innerHTML = `
                <span class="nome-arquivo">
                    📄 ${arquivo.name} (${tamanhoFormatado})
                </span>
                <button type="button" class="btn-remover-arquivo" data-index="${index}">Remover</button>
            `;

      listaArquivos.appendChild(li);
    });

    // Event Listener para botões de remover
    const botoesRemover = listaArquivos.querySelectorAll(".btn-remover-arquivo");
    botoesRemover.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.target.dataset.index);
        arquivosSelecionados.splice(idx, 1);
        renderizarListaArquivos();
      });
    });
  }

  // 3. Envio do Formulário (Simulação de criação)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dados = {
      titulo: document.getElementById("titulo").value,
      descricao: document.getElementById("descricao").value,
      solicitante: document.getElementById("solicitante").value,
      fila: document.getElementById("fila").value,
      categoria: document.getElementById("categoria").value,
      prioridade: document.getElementById("prioridade").value,
      ativo: document.getElementById("ativo").value,
      totalAnexos: arquivosSelecionados.length,
    };

    console.log("Novo Chamado Criado:", dados);

    // Feedback visual
    alert(`Chamado "${dados.titulo}" criado com sucesso! Status: Aberto.`);

    //Redireciona de volta para a lista de chamados
    window.location.href = "chamados.html";
  });
});
