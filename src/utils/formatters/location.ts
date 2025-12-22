export function formatLocation(
  item: { cidade?: string | null; estado?: string | null } | null | undefined,
): string {
  if (!item) return "";

  const cidade = item.cidade ?? "";
  const estado = item.estado ?? "";

  if (!cidade && !estado) return "Sem localidade";
  if (!estado) return cidade;
  if (!cidade) return estado;
  return `${cidade} - ${estado}`;
}
