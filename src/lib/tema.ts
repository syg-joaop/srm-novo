export type Tema = 'auto' | 'claro' | 'escuro'
const CHAVE = 'medtempo:tema'

export function temaAtual(): Tema {
  try {
    return (localStorage.getItem(CHAVE) as Tema) || 'auto'
  } catch {
    return 'auto'
  }
}

export function aplicarTema(t: Tema = temaAtual()) {
  const html = document.documentElement
  if (t === 'auto') html.removeAttribute('data-theme')
  else html.setAttribute('data-theme', t === 'claro' ? 'light' : 'dark')
  try {
    localStorage.setItem(CHAVE, t)
  } catch {
    /* ignora */
  }
}
