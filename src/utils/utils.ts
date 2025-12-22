//returns YYYY-MM-DD
export function dataAtualPrimeiroDiaMes(): string {
  const date = new Date();
  date.setMonth(date.getMonth());
  date.setDate(1);
  return date.toISOString().split("T")[0];
}

//format YYYY-MM-DD
export function dataAtualUltimoDiaMes(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date.toISOString().split("T")[0];
}

/**
 * Formata uma data ISO (2025-10-28T00:00:00.000Z) para o formato brasileiro (28/10/2025)
 * @param dateString - String de data no formato ISO ou YYYY-MM-DD
 * @returns Data formatada como DD/MM/YYYY ou string vazia se invalida
 */
export function formatarData(dateString: string | undefined | null): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Formata uma data ISO para o formato brasileiro com hora (28/10/2025 14:30)
 * @param dateString - String de data no formato ISO
 * @returns Data formatada como DD/MM/YYYY HH:mm ou string vazia se invalida
 */
export function formatarDataHora(dateString: string | undefined | null): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

/**
 * Formata um intervalo de datas (ex: 01/01/2024 - 10/01/2024)
 */
export function formatarIntervaloDatas(inicio?: string, fim?: string): string {
  if (!inicio && !fim) return "—";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const dataInicio = formatDate(inicio);
  const dataFim = formatDate(fim);

  if (dataInicio && dataFim) {
    return `${dataInicio} - ${dataFim}`;
  }

  return dataInicio || dataFim || "—";
}
