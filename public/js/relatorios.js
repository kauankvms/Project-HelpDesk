// =========================================================
// RELATÓRIOS — FILTRO DE PERÍODO E RENDERIZAÇÃO DE GRÁFICOS
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Renderiza os estilos gráficos dinâmicos a partir dos atributos data-*
  const rosca = document.querySelector(".rosca[data-gradiente]");
  if (rosca) {
    rosca.style.background = rosca.getAttribute("data-gradiente");
  }

  document.querySelectorAll(".barra-fill[data-largura]").forEach((barra) => {
    barra.style.width = barra.getAttribute("data-largura") + "%";
    const cor = barra.getAttribute("data-cor");
    if (cor) barra.style.background = cor;
  });

  document.querySelectorAll(".barra-preenchida[data-sla]").forEach((barra) => {
    const sla = Number(barra.getAttribute("data-sla")) || 0;
    barra.style.width = sla + "%";
    if (sla < 90) {
      barra.style.background = "var(--cor-laranja)";
    }
  });

  // 2. Filtros de Período (Hoje, Esta Semana, Este Mês)
  const botoesPeriodo = document.querySelectorAll(".btn-periodo");
  botoesPeriodo.forEach((btn) => {
    btn.addEventListener("click", () => {
      const periodo = btn.dataset.periodo;
      if (periodo) {
        window.location.href = `/relatorios?periodo=${periodo}`;
      }
    });
  });

  // 3. Período Personalizado (Data Início até Data Fim)
  const btnAplicar = document.getElementById("btn-aplicar");
  const dataInicio = document.getElementById("data-inicio");
  const dataFim = document.getElementById("data-fim");

  if (btnAplicar && dataInicio && dataFim) {
    btnAplicar.addEventListener("click", () => {
      if (!dataInicio.value || !dataFim.value) {
        alert("Selecione as datas de início e fim do período.");
        return;
      }

      if (dataInicio.value > dataFim.value) {
        alert("A data inicial não pode ser posterior à data final.");
        return;
      }

      window.location.href = `/relatorios?inicio=${dataInicio.value}&fim=${dataFim.value}`;
    });
  }
});
