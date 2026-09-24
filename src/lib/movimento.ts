import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import type { Directive } from 'vue'

gsap.registerPlugin(ScrollTrigger)

export const movimentoReduzido = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/* ---------- rolagem suave ---------- */

let lenis: Lenis | null = null

/** Rolagem suave com inércia (só em ponteiro fino, fora do modo de movimento reduzido). */
export function iniciarRolagemSuave() {
  if (lenis || movimentoReduzido() || !window.matchMedia('(pointer: fine)').matches) return
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function rolarParaTopo() {
  if (lenis) lenis.scrollTo(0, { duration: 0.8 })
  else window.scrollTo({ top: 0, behavior: movimentoReduzido() ? 'auto' : 'smooth' })
}

/* ---------- título palavra a palavra ---------- */

/** Anima as palavras (`.palavra > span`) de um título, como se subissem de uma máscara. */
export function animarPalavras(el: HTMLElement, atraso = 0) {
  const internos = el.querySelectorAll('.palavra > span')
  if (!internos.length || movimentoReduzido()) return
  gsap.fromTo(
    internos,
    { yPercent: 115, rotate: 5, opacity: 0, filter: 'blur(8px)' },
    { yPercent: 0, rotate: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.09, delay: atraso, clearProps: 'filter' },
  )
}

/* ---------- revelação ao rolar ---------- */

/** Anima elementos `.revelar` dentro de `raiz` quando entram na tela. */
export function revelarAoRolar(raiz: HTMLElement) {
  const alvos = raiz.querySelectorAll<HTMLElement>('.revelar')
  if (!alvos.length) return () => {}
  if (movimentoReduzido()) {
    gsap.set(alvos, { opacity: 1, y: 0 })
    return () => {}
  }
  gsap.set(alvos, { opacity: 0, y: 40, scale: 0.985 })
  const gatilhos = ScrollTrigger.batch(alvos, {
    start: 'top 92%',
    once: true,
    onEnter: (lote) => gsap.to(lote, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out', stagger: 0.1, overwrite: true }),
  })
  return () => gatilhos.forEach((g) => g.kill())
}

/* ---------- entrada em cascata ---------- */

export function cascata(alvos: Element[] | NodeListOf<Element>, atraso = 0) {
  if (movimentoReduzido()) return
  gsap.fromTo(
    alvos,
    { opacity: 0, y: 24, filter: 'blur(6px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: atraso, clearProps: 'filter' },
  )
}

/* ---------- botão magnético ---------- */

interface ElMagnetico extends HTMLElement {
  _magnetico?: { mover: (e: PointerEvent) => void; sair: () => void }
}

/** `v-magnetico`: o elemento é atraído levemente pelo ponteiro. `v-magnetico="0.4"` ajusta a força. */
export const vMagnetico: Directive<ElMagnetico, number | undefined> = {
  mounted(el, binding) {
    if (movimentoReduzido() || !window.matchMedia('(pointer: fine)').matches) return
    const forca = binding.value ?? 0.3
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * forca)
      y((e.clientY - (r.top + r.height / 2)) * forca)
    }
    const sair = () => {
      gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)' })
    }
    el._magnetico = { mover, sair }
    el.addEventListener('pointermove', mover)
    el.addEventListener('pointerleave', sair)
  },
  unmounted(el) {
    if (!el._magnetico) return
    el.removeEventListener('pointermove', el._magnetico.mover)
    el.removeEventListener('pointerleave', el._magnetico.sair)
  },
}

/* ---------- pulso de confirmação ---------- */

export function pulsar(el: Element) {
  if (movimentoReduzido()) return
  gsap.fromTo(el, { scale: 0.96 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1.1, 0.4)' })
}

export { gsap, ScrollTrigger }

/* ---------- cenas acionadas pela rolagem ---------- */

/**
 * Marca com `data-em-cena` os elementos `[data-cena]` de `raiz` quando entram na tela.
 * Enquanto não entram, as animações CSS deles ficam pausadas (ver styles.css),
 * então cada seção "se monta" só quando é vista.
 */
export function ativarCenas(raiz: HTMLElement) {
  const registrados = new WeakSet<Element>()
  const gatilhos: ScrollTrigger[] = []

  function varrer() {
    const novos = [...raiz.querySelectorAll<HTMLElement>('[data-cena]:not([data-em-cena])')].filter((el) => !registrados.has(el))
    if (!novos.length) return
    novos.forEach((el) => registrados.add(el))
    if (movimentoReduzido()) {
      novos.forEach((el) => el.setAttribute('data-em-cena', ''))
      return
    }
    // O que já está na tela entra direto (em cascata); o resto espera a rolagem.
    const limite = window.innerHeight * 0.92
    const naTela = novos.filter((el) => el.getBoundingClientRect().top < limite)
    const abaixo = novos.filter((el) => !naTela.includes(el))
    naTela.forEach((el, i) => setTimeout(() => el.setAttribute('data-em-cena', ''), 60 + i * 90))
    if (!abaixo.length) return
    gatilhos.push(
      ...ScrollTrigger.batch(abaixo, {
        start: 'top 90%',
        once: true,
        onEnter: (lote) => lote.forEach((el, i) => setTimeout(() => el.setAttribute('data-em-cena', ''), i * 90)),
      }),
    )
  }

  // espera um quadro para o layout da aba assentar
  requestAnimationFrame(varrer)
  // elementos que aparecem depois (ex.: remédio recém-adicionado) também entram em cena
  const obs = new MutationObserver(() => varrer())
  obs.observe(raiz, { childList: true, subtree: true })
  /** Ao reabrir a aba: ativa o que estiver visível e recalcula os gatilhos. */
  function reativar() {
    const limite = window.innerHeight * 0.92
    raiz.querySelectorAll<HTMLElement>('[data-cena]:not([data-em-cena])').forEach((el, i) => {
      if (el.getBoundingClientRect().top < limite) setTimeout(() => el.setAttribute('data-em-cena', ''), i * 90)
    })
    varrer()
    ScrollTrigger.refresh()
    // (um atributo, e não uma classe: o Vue reescreve className ao re-renderizar)
  }
  const desfazer = () => {
    obs.disconnect()
    gatilhos.forEach((g) => g.kill())
  }
  return Object.assign(desfazer, { reativar })
}

/** Recalcula as posições depois que a aba termina de entrar (KeepAlive + transição). */
export function recalcularRolagem(atrasoMs = 520, cenas?: { reativar?: () => void }) {
  setTimeout(() => (cenas?.reativar ? cenas.reativar() : ScrollTrigger.refresh()), atrasoMs)
}

/* ---------- inclinação 3D ---------- */

interface ElInclinavel extends HTMLElement {
  _inclinar?: { mover: (e: PointerEvent) => void; sair: () => void }
}

/** `v-inclinar`: o cartão inclina em 3D acompanhando o ponteiro. `v-inclinar="6"` = graus máximos. */
export const vInclinar: Directive<ElInclinavel, number | undefined> = {
  mounted(el, binding) {
    if (movimentoReduzido() || !window.matchMedia('(pointer: fine)').matches) return
    const graus = binding.value ?? 5
    gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' })
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      ry(nx * graus * 2)
      rx(-ny * graus * 2)
      el.style.setProperty('--luz-x', `${(nx + 0.5) * 100}%`)
      el.style.setProperty('--luz-y', `${(ny + 0.5) * 100}%`)
    }
    const sair = () => gsap.to(el, { rotationX: 0, rotationY: 0, duration: 1, ease: 'elastic.out(1, 0.5)' })
    el._inclinar = { mover, sair }
    el.classList.add('inclinavel')
    el.addEventListener('pointermove', mover)
    el.addEventListener('pointerleave', sair)
  },
  unmounted(el) {
    if (!el._inclinar) return
    el.removeEventListener('pointermove', el._inclinar.mover)
    el.removeEventListener('pointerleave', el._inclinar.sair)
  },
}
