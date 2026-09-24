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
