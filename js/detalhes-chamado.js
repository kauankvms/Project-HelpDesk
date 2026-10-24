// =========================================================
// DETALHES DO CHAMADO - INTERAÇÕES
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Controle de Abas (Comentários vs Histórico)
  const botoesAbas = document.querySelectorAll(".btn-aba");
  const conteudosAbas = document.querySelectorAll(".conteudo-aba");

  botoesAbas.forEach((btn) => {
    btn.addEventListener("click", () => {
      const abaAlvo = btn.dataset.aba;

      botoesAbas.forEach((b) => b.classList.remove("ativo"));
      conteudosAbas.forEach((c) => c.classList.remove("ativo"));

      btn.classList.add("ativo");
      document.getElementById(`aba-${abaAlvo}`).classList.add("ativo");
    });
  });

  // 2. Envio de Novo Comentario
  const formComentario = document.getElementById("form-novo-comentario");
  const textareaComentario = document.getElementById("texto-comentario");
  const timelineComentarios = document.getElementById("timeline-comentarios");

  formComentario.addEventListener("submit", (e) => {
    e.preventDefault();

    const texto = textareaComentario.value.trim();
    if (!texto) return;

    const tipoSelecionado = document.querySelector(
      'input[name="tipo-comentario"]:checked',
    ).value;
    const ehNotaInterna = tipoSelecionado === "interno";

    const agora = new Date();
    const dataFormatada =
      agora.toLocaleDateString("pt-BR") +
      " às " +
      agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Cria o novo card de comentário
    const div = document.createElement("div");
    div.className = `comentario-item ${ehNotaInterna ? "nota-interna" : ""}`;

    div.innerHTML = `
        <div class="comentario-avatar">KV</div>
        <div class="comentario-corpo">
            <div class="comentario-topo">
                <span class="autor">Kauan Vitor (Analista)</span>
                ${ehNotaInterna ? '<span class="badge-tipo-nota">Nota Interna</span>' : ""}
                <span class="data">${dataFormatada}</span>
            </div>
            <div class="comentario-texto">${texto}</div>
        </div>
        `;
    timelineComentarios.appendChild(div);
    textareaComentario.value = "";
  });

  // 3. Ações Rápidas de Atendimento (Resolver e Espera)
  const btnResolver = document.getElementById("btn-resolver");
  const btnAguardar = document.getElementById("btn-aguardar");
  const badgeTopo = document.getElementById("badge-status-topo");
  const badgeLateral = document.getElementById("badge-status-lateral");

  function atualizarStatus(novoStatus, classeCss) {
    [badgeTopo, badgeLateral].forEach((badge) => {
      badge.textContent = novoStatus;
      badge.className = `badge ${classeCss}`;
    });
  }

  btnResolver.addEventListener("click", () => {
    atualizarStatus("Resolvido", "status-resolvido");
    alert("Chamado marcado como Resolvido!");
  });

  btnAguardar.addEventListener("click", () => {
    atualizarStatus("Aguardando", "status-aguardando");
    alert("Chamado colocado em Espera / Aguardando!");
  });
});
