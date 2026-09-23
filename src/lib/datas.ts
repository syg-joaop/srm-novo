export const MIN = 60_000
export const HORA = 3_600_000
export const DIA = 86_400_000

const pad = (n: number) => String(n).padStart(2, '0')

/** Chave local YYYY-MM-DD. */
export function chaveDia(d: Date | number | string): string {
  const x = new Date(d)
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
}

export function deChave(chave: string): Date {
  const [a, m, d] = chave.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function inicioDoDia(d: Date | number | string): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function somarDias(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function hhmm(d: Date | number | string): string {
  const x = new Date(d)
  return `${pad(x.getHours())}:${pad(x.getMinutes())}`
}

export function minutosDe(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function deMinutos(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
}

/** "1h 25min", "40min", "3h". */
export function duracao(horas: number): string {
  const totalMin = Math.round(Math.abs(horas) * 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h && m) return `${h}h ${m}min`
  if (h) return `${h}h`
  return `${m}min`
}

export function faixaHoras(f: [number, number]): string {
  if (f[0] === f[1]) return duracao(f[0])
  return `${duracao(f[0])}–${duracao(f[1])}`
}

export function mesmoDia(a: Date | number | string, b: Date | number | string) {
  return chaveDia(a) === chaveDia(b)
}

export const NOMES_MES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
export const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function dataLonga(d: Date | number | string): string {
  const t = new Date(d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function paraInputDatetime(d: Date | number | string): string {
  const x = new Date(d)
  return `${chaveDia(x)}T${hhmm(x)}`
}

export function saudacao(d = new Date()): string {
  const h = d.getHours()
  if (h < 5) return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
