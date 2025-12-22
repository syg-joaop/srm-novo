export function formatarMoeda(valor: string | number | undefined): string {
  if (valor === undefined || valor === null) return "R$ 0,00";
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return isNaN(num)
    ? "R$ 0,00"
    : num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarNumero(valor: string | number | undefined): string {
  if (valor === undefined || valor === null) return "0";
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return isNaN(num) ? "0" : num.toLocaleString("pt-BR");
}

export function formatarKg(valor: string | number | undefined): string {
  if (valor === undefined || valor === null) return "0 KG";
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return isNaN(num)
    ? "0 KG"
    : num.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + " KG";
}

export function formatarDistancia(metros: number): string {
  if (metros >= 1000) {
    return `${(metros / 1000).toFixed(1)} km`;
  }
  return `${Math.round(metros)} m`;
}

export function formatarDuracao(segundos: number): string {
  const hours = Math.floor(segundos / 3600);
  const minutes = Math.floor((segundos % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}
