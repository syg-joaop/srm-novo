import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  Matrix3,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'

/**
 * Cena "organismo": um núcleo vivo cercado por órbitas de partículas,
 * uma por medicação. Quantidade, velocidade e brilho das partículas
 * acompanham o nível estimado de cada remédio.
 */

export interface MedCena {
  id: string
  cor: string
  /** Nível relativo ao pico habitual (1 = pico em uso contínuo). */
  nivel: number
}

export interface Cena {
  atualizar(meds: MedCena[]): void
  definirTema(claro: boolean): void
  explodir(id: string): void
  destruir(): void
}

const RUIDO = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

function materialNucleo() {
  return new ShaderMaterial({
    transparent: true,
    uniforms: {
      uTempo: { value: 0 },
      uEnergia: { value: 0 },
      uPulso: { value: 0 },
      uCorA: { value: new Color('#8b7bff') },
      uCorB: { value: new Color('#34d399') },
      uClaro: { value: 0 },
    },
    vertexShader: /* glsl */ `
      ${RUIDO}
      uniform float uTempo; uniform float uEnergia; uniform float uPulso;
      varying vec3 vNormal; varying vec3 vVista; varying float vRuido;
      void main(){
        float n = snoise(position * 1.35 + vec3(uTempo * .22));
        float n2 = snoise(position * 3.1 - vec3(uTempo * .35));
        vRuido = n;
        float desloc = n * (.035 + .08 * uEnergia) + n2 * .015 + uPulso * .22;
        vec3 p = position + normal * desloc;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        vNormal = normalize(normalMatrix * normal);
        vVista = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCorA; uniform vec3 uCorB; uniform float uEnergia; uniform float uPulso; uniform float uClaro;
      varying vec3 vNormal; varying vec3 vVista; varying float vRuido;
      void main(){
        float fres = pow(1. - max(dot(vNormal, vVista), 0.), 2.4);
        vec3 base = mix(uCorA, uCorB, smoothstep(-.6, .7, vRuido));
        vec3 iris = .5 + .5 * cos(6.2831 * (fres * .6 + vRuido * .25 + vec3(0., .33, .67)));
        vec3 cor = base * (.05 + .16 * (vRuido * .5 + .5)) + mix(base, iris, .25) * fres * (1.2 + 1.3 * uEnergia) + vec3(1.) * pow(fres, 4.) * .5;
        cor += base * uPulso * .8;
        // no tema claro o interior fica perolado em vez de escuro
        vec3 perola = mix(mix(base, vec3(1.), .78), iris, .12) * (.92 + .08 * vRuido) + base * fres * 1.1;
        cor = mix(cor, perola, uClaro);
        gl_FragColor = vec4(cor, .55 + fres * .45 + uClaro * .3);
      }`,
  })
}

function materialHalo() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uCor: { value: new Color('#8b7bff') }, uForca: { value: 0.4 }, uClaro: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCor; uniform float uForca; uniform float uClaro; varying vec2 vUv;
      void main(){
        float d = length(vUv - .5) * 2.;
        float a = pow(max(1. - d, 0.), 2.6) * uForca * (1. - uClaro * .55);
        // em fundo claro, brilho precisa ser quase branco para não "sujar" a página
        vec3 c = mix(uCor, mix(uCor, vec3(1.), .7), uClaro);
        gl_FragColor = vec4(c * a, a);
      }`,
  })
}

function materialOrbita(cor: string, pr: number) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTempo: { value: 0 },
      uNivel: { value: 0 },
      uExplosao: { value: 0 },
      uCor: { value: new Color(cor) },
      uRaio: { value: 2 },
      uRot: { value: new Matrix3() },
      uPR: { value: pr },
    },
    vertexShader: /* glsl */ `
      attribute vec4 aSemente;
      uniform float uTempo; uniform float uNivel; uniform float uExplosao; uniform float uRaio; uniform mat3 uRot; uniform float uPR;
      varying float vAlfa; varying float vBrilho;
      void main(){
        float vel = (.08 + .30 * aSemente.y) * (.35 + uNivel * .9);
        float ang = aSemente.x * 6.28318 + uTempo * vel;
        float largura = .22 + .5 * uNivel;
        float r = uRaio + (aSemente.z - .5) * largura + sin(uTempo * .6 + aSemente.w * 40.) * .04;
        vec3 p = vec3(cos(ang) * r, (aSemente.w - .5) * (.12 + .25 * uNivel) + sin(ang * 3. + uTempo * .8) * .05, sin(ang) * r);
        p *= 1. + uExplosao * (.4 + aSemente.y * 1.6);
        p = uRot * p;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        // fração de partículas visíveis acompanha o nível
        float limiar = aSemente.y;
        vAlfa = smoothstep(limiar - .12, limiar, uNivel * .92 + .04 + uExplosao);
        vBrilho = .55 + .45 * sin(uTempo * 2. + aSemente.x * 30.);
        gl_PointSize = (16. + 42. * aSemente.z * aSemente.z) * uPR * (1. + uExplosao * 1.5) / -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCor; uniform float uExplosao;
      varying float vAlfa; varying float vBrilho;
      void main(){
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, 0., d);
        a *= a;
        vec3 cor = mix(uCor, vec3(1.), a * .35 + uExplosao * .4);
        gl_FragColor = vec4(cor * (1. + uExplosao), a * vAlfa * vBrilho);
      }`,
  })
}

const INCLINACOES: [number, number, number][] = [
  [0.42, 0, 0.18],
  [-0.62, 0.4, -0.3],
  [1.05, -0.3, 0.55],
  [-0.25, 0.9, 0.8],
  [0.8, 0.6, -0.7],
]

interface Orbita {
  id: string
  pontos: Points
  linha: LineLoop
  material: ShaderMaterial
  nivel: number
  alvo: number
  explosao: number
  cor: Color
  indice: number
}

export function criarCena(canvas: HTMLCanvasElement, opcoes: { reduzido?: boolean } = {}): Cena {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  const pr = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(pr)
  renderer.setClearColor(0x000000, 0)

  const cena = new Scene()
  const camera = new PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0, 0.5, 8.2)
  camera.lookAt(0, 0, 0)

  const mundo = new Group()
  cena.add(mundo)

  // núcleo
  const matNucleo = materialNucleo()
  const nucleo = new Mesh(new IcosahedronGeometry(1.0, 20), matNucleo)
  mundo.add(nucleo)

  const matHalo = materialHalo()
  const halo = new Mesh(new PlaneGeometry(7, 7), matHalo)
  matHalo.depthTest = false
  halo.renderOrder = -1
  cena.add(halo)

  // estrelas
  const nEstrelas = 900
  const posEstrelas = new Float32Array(nEstrelas * 3)
  for (let i = 0; i < nEstrelas; i++) {
    const v = new Vector3().randomDirection().multiplyScalar(14 + Math.random() * 22)
    posEstrelas.set([v.x, v.y, v.z], i * 3)
  }
  const geoEstrelas = new BufferGeometry()
  geoEstrelas.setAttribute('position', new BufferAttribute(posEstrelas, 3))
  const matEstrelas = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uTempo: { value: 0 }, uPR: { value: pr } },
    vertexShader: /* glsl */ `
      uniform float uTempo; uniform float uPR; varying float vA;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mv;
        vA = .35 + .35 * sin(uTempo * 1.3 + position.x * 3.1 + position.y);
        gl_PointSize = 30. * uPR / -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); gl_FragColor = vec4(vec3(.8,.85,1.), a * a * vA * .7); }`,
  })
  const estrelas = new Points(geoEstrelas, matEstrelas)
  cena.add(estrelas)

  // órbitas
  const orbitas = new Map<string, Orbita>()
  const N = 2200

  function novaOrbita(id: string, cor: string, i: number): Orbita {
    const sementes = new Float32Array(N * 4)
    for (let k = 0; k < N * 4; k++) sementes[k] = Math.random()
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(N * 3), 3))
    geo.setAttribute('aSemente', new BufferAttribute(sementes, 4))
    const material = materialOrbita(cor, pr)
    const pontos = new Points(geo, material)
    pontos.frustumCulled = false

    const pts: number[] = []
    for (let k = 0; k < 128; k++) {
      const a = (k / 128) * Math.PI * 2
      pts.push(Math.cos(a), 0, Math.sin(a))
    }
    const geoLinha = new BufferGeometry()
    geoLinha.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3))
    const linha = new LineLoop(geoLinha, new LineBasicMaterial({ color: cor, transparent: true, opacity: 0.12, depthWrite: false }))

    mundo.add(pontos, linha)
    const o: Orbita = { id, pontos, linha, material, nivel: 0, alvo: 0, explosao: 0, cor: new Color(cor), indice: i }
    posicionar(o, i)
    return o
  }

  function posicionar(o: Orbita, i: number) {
    const raio = 1.85 + i * 0.62
    const [rx, ry, rz] = INCLINACOES[i % INCLINACOES.length]
    const g = new Group()
    g.rotation.set(rx, ry, rz)
    g.updateMatrix()
    const m3 = new Matrix3().setFromMatrix4(g.matrix)
    o.material.uniforms.uRaio.value = raio
    o.material.uniforms.uRot.value = m3
    o.linha.rotation.set(rx, ry, rz)
    o.linha.scale.setScalar(raio)
  }

  function atualizar(meds: MedCena[]) {
    const ids = new Set(meds.map((m) => m.id))
    for (const [id, o] of orbitas) {
      if (!ids.has(id)) {
        mundo.remove(o.pontos, o.linha)
        o.pontos.geometry.dispose()
        o.material.dispose()
        o.linha.geometry.dispose()
        orbitas.delete(id)
      }
    }
    meds.forEach((m, i) => {
      let o = orbitas.get(m.id)
      if (!o) {
        o = novaOrbita(m.id, m.cor, i)
        orbitas.set(m.id, o)
      }
      if (o.indice !== i) {
        o.indice = i
        posicionar(o, i)
      }
      o.cor.set(m.cor)
      o.material.uniforms.uCor.value.set(m.cor)
      ;(o.linha.material as LineBasicMaterial).color.set(m.cor)
      o.alvo = Math.max(0, Math.min(1.3, m.nivel))
    })
  }

  let pulso = 0
  function explodir(id: string) {
    const o = orbitas.get(id)
    if (o) o.explosao = 1
    pulso = 1
  }

  /* ---------- interação ---------- */

  const alvoRot = { x: 0, y: 0 }
  let rotY = 0
  let velY = 0
  let arrasto: { x: number; t: number } | null = null

  function aoMover(ev: PointerEvent) {
    const r = canvas.getBoundingClientRect()
    const nx = (ev.clientX - r.left) / r.width - 0.5
    const ny = (ev.clientY - r.top) / r.height - 0.5
    alvoRot.y = nx * 0.5
    alvoRot.x = ny * 0.3
    if (arrasto) {
      const dx = ev.clientX - arrasto.x
      velY = (dx / r.width) * 4
      rotY += velY
      arrasto.x = ev.clientX
    }
  }
  function aoBaixar(ev: PointerEvent) {
    arrasto = { x: ev.clientX, t: performance.now() }
    canvas.setPointerCapture(ev.pointerId)
  }
  function aoSoltar() {
    arrasto = null
  }
  function aoSair() {
    alvoRot.x = 0
    alvoRot.y = 0
    arrasto = null
  }
  canvas.addEventListener('pointermove', aoMover)
  canvas.addEventListener('pointerdown', aoBaixar)
  canvas.addEventListener('pointerup', aoSoltar)
  canvas.addEventListener('pointerleave', aoSair)

  /* ---------- tamanho e visibilidade ---------- */

  function redimensionar() {
    const w = canvas.clientWidth || 1
    const h = canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // afasta a câmera em telas estreitas para caber todas as órbitas
    camera.position.z = w / h < 1 ? 8.2 / Math.max(0.55, w / h) : 8.2
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(redimensionar)
  ro.observe(canvas)
  redimensionar()

  let visivel = true
  const io = new IntersectionObserver((e) => (visivel = e[0].isIntersecting))
  io.observe(canvas)

  /* ---------- loop ---------- */

  const escalaTempo = opcoes.reduzido ? 0.15 : 1
  let tempo = 0
  let anterior = performance.now()
  let raf = 0
  const corA = new Color()
  const corB = new Color()

  function quadro(agora: number) {
    raf = requestAnimationFrame(quadro)
    const dt = Math.min(0.05, (agora - anterior) / 1000)
    anterior = agora
    if (!visivel || document.hidden) return
    tempo += dt * escalaTempo

    // níveis suavizados e cor do núcleo ponderada pelos níveis
    let energia = 0
    let somaPeso = 0
    corA.setRGB(0, 0, 0)
    const lista = [...orbitas.values()].sort((a, b) => b.nivel - a.nivel)
    for (const o of orbitas.values()) {
      o.nivel += (o.alvo - o.nivel) * Math.min(1, dt * 3)
      o.explosao = Math.max(0, o.explosao - dt * 0.9)
      o.material.uniforms.uTempo.value = tempo
      o.material.uniforms.uNivel.value = o.nivel
      o.material.uniforms.uExplosao.value = o.explosao * o.explosao
      ;(o.linha.material as LineBasicMaterial).opacity = 0.06 + o.nivel * 0.12
      energia = Math.max(energia, o.nivel)
      const peso = 0.05 + o.nivel
      corA.r += o.cor.r * peso
      corA.g += o.cor.g * peso
      corA.b += o.cor.b * peso
      somaPeso += peso
    }
    if (somaPeso) corA.multiplyScalar(1 / somaPeso)
    else corA.set('#8b7bff')
    corB.copy(lista[1]?.cor ?? lista[0]?.cor ?? corA)
    matNucleo.uniforms.uCorA.value.lerp(lista[0]?.cor ?? corA, Math.min(1, dt * 2))
    matNucleo.uniforms.uCorB.value.lerp(corB, Math.min(1, dt * 2))
    pulso = Math.max(0, pulso - dt * 1.4)
    matNucleo.uniforms.uTempo.value = tempo
    matNucleo.uniforms.uEnergia.value += (energia - matNucleo.uniforms.uEnergia.value) * Math.min(1, dt * 2)
    matNucleo.uniforms.uPulso.value = pulso * pulso
    matHalo.uniforms.uCor.value.lerp(corA, Math.min(1, dt * 2))
    matHalo.uniforms.uForca.value = 0.18 + energia * 0.32 + pulso * 0.5
    matEstrelas.uniforms.uTempo.value = tempo

    // rotação: deriva lenta + paralaxe do ponteiro + inércia do arrasto
    if (!arrasto) {
      velY *= 0.94
      rotY += velY
    }
    rotY += dt * 0.06 * escalaTempo
    mundo.rotation.y += (rotY + alvoRot.y - mundo.rotation.y) * Math.min(1, dt * 4)
    mundo.rotation.x += (alvoRot.x - mundo.rotation.x) * Math.min(1, dt * 3)
    nucleo.rotation.y = tempo * 0.1
    estrelas.rotation.y = tempo * 0.008 + mundo.rotation.y * 0.15
    estrelas.rotation.x = mundo.rotation.x * 0.2
    halo.quaternion.copy(camera.quaternion)

    renderer.render(cena, camera)
  }
  raf = requestAnimationFrame(quadro)

  function definirTema(claro: boolean) {
    const v = claro ? 1 : 0
    matNucleo.uniforms.uClaro.value = v
    matHalo.uniforms.uClaro.value = v
    matEstrelas.visible = !claro
  }

  return {
    atualizar,
    explodir,
    definirTema,
    destruir() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointermove', aoMover)
      canvas.removeEventListener('pointerdown', aoBaixar)
      canvas.removeEventListener('pointerup', aoSoltar)
      canvas.removeEventListener('pointerleave', aoSair)
      cena.traverse((o) => {
        const m = o as Mesh
        m.geometry?.dispose?.()
        const mat = m.material as ShaderMaterial | undefined
        mat?.dispose?.()
      })
      renderer.dispose()
    },
  }
}

export function temWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
