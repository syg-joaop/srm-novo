<script setup lang="ts">
import { ativarCenas, recalcularRolagem } from '../lib/movimento'
import { ChevronDown, Pause, Pencil, Play, Plus, Sparkles, Trash2 } from 'lucide-vue-next'
import MedIcone from '../components/MedIcone.vue'
import { computed, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import FichaPerfil from '../components/FichaPerfil.vue'
import Modal from '../components/Modal.vue'
import { avisar, estado, inicioPessoal, perfilDe, proximaCor, removerMedicacao, salvarMedicacao, todosPerfis, uid } from '../store'
import { CORES_MED, EMOJIS_MED, PERFIS } from '../data/medicamentos'
import { chaveDia, duracao } from '../lib/datas'
import { perfilPersonalizado } from '../lib/farmaco'
import type { Etiqueta, Faixa, Medicacao, PerfilFarmaco } from '../types'

const aberta = ref<string | null>(estado.medicacoes[0]?.id ?? null)
const etapa = ref<null | 'biblioteca' | 'formulario' | 'personalizada'>(null)
const busca = ref('')
const perfilEscolhido = ref<PerfilFarmaco | null>(null)
const previa = ref<PerfilFarmaco | null>(null)
const editando = ref<Medicacao | null>(null)
const confirmarRemover = ref<string | null>(null)

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const resultados = computed(() => {
  const q = normalizar(busca.value.trim())
  const lista = todosPerfis()
  if (!q) return lista
  return lista.filter((p) => normalizar([p.nome, p.principioAtivo, p.classe, ...p.marcas, ...p.indicacoes].join(' ')).includes(q))
})

const form = reactive({ nome: '', doseMg: 0, horarios: ['08:00'] as string[], cor: '', inicioTratamento: chaveDia(new Date()), ativa: true })

function escolher(p: PerfilFarmaco) {
  perfilEscolhido.value = p
  editando.value = null
  Object.assign(form, {
    nome: p.marcas[0] && p.id !== 'cafeina' ? p.marcas[0] : p.nome,
    doseMg: p.dosesComunsMg[0] ?? 0,
    horarios: p.vezesAoDia > 1 ? ['08:00', '14:00'] : ['08:00'],
    cor: proximaCor(),
    inicioTratamento: chaveDia(new Date()),
    ativa: true,
  })
  etapa.value = 'formulario'
}

function editar(m: Medicacao) {
  editando.value = m
  perfilEscolhido.value = perfilDe(m)
  Object.assign(form, { nome: m.nome, doseMg: m.doseMg, horarios: [...m.horarios], cor: m.cor, inicioTratamento: m.inicioTratamento, ativa: m.ativa })
  etapa.value = 'formulario'
}

function salvar() {
  if (!perfilEscolhido.value || !form.nome.trim()) return
  const med: Medicacao = {
    id: editando.value?.id ?? uid(),
    perfilId: perfilEscolhido.value.id,
    nome: form.nome.trim(),
    doseMg: Number(form.doseMg) || 0,
    horarios: form.horarios.filter(Boolean).sort(),
    cor: form.cor,
    ativa: form.ativa,
    inicioTratamento: form.inicioTratamento,
  }
  salvarMedicacao(med)
  aberta.value = med.id
  avisar(editando.value ? 'Medicação atualizada' : `${med.nome} adicionada`, perfilEscolhido.value.emoji)
  fechar()
}

function fechar() {
  etapa.value = null
  busca.value = ''
  previa.value = null
}

function remover(m: Medicacao) {
  if (confirmarRemover.value !== m.id) {
    confirmarRemover.value = m.id
    setTimeout(() => (confirmarRemover.value = null), 3000)
    return
  }
  removerMedicacao(m.id)
  avisar(`${m.nome} removida`, '🗑️')
}

/* ---------- personalizada ---------- */

const ETIQUETAS_OPCOES: { id: Etiqueta; rotulo: string }[] = [
  { id: 'estimulante', rotulo: 'Estimulante' },
  { id: 'serotoninergico', rotulo: 'Serotoninérgico' },
  { id: 'noradrenergico', rotulo: 'Noradrenérgico' },
  { id: 'sedativo', rotulo: 'Sedativo / dá sono' },
  { id: 'inibidor-cyp2d6', rotulo: 'Inibidor CYP2D6' },
  { id: 'substrato-cyp2d6', rotulo: 'Metabolizado pela CYP2D6' },
  { id: 'reduz-limiar-convulsivo', rotulo: 'Reduz limiar convulsivo' },
]

const custom = reactive({
  nome: '',
  classe: '',
  inicio: [0.5, 1.5] as Faixa,
  pico: [2, 3] as Faixa,
  duracao: [6, 8] as Faixa,
  meiaVida: 6,
  emoji: '💊',
  etiquetas: [] as Etiqueta[],
  terapeutico: false,
  semanas: [2, 4] as Faixa,
})

const perfilCustom = computed(() =>
  perfilPersonalizado({
    id: 'custom-previa',
    nome: custom.nome || 'Personalizada',
    classe: custom.classe,
    inicioH: [Number(custom.inicio[0]), Number(custom.inicio[1])],
    picoH: [Number(custom.pico[0]), Number(custom.pico[1])],
    duracaoH: [Number(custom.duracao[0]), Number(custom.duracao[1])],
    meiaVidaH: Math.max(0.2, Number(custom.meiaVida) || 1),
    cor: '#7c5cff',
    emoji: custom.emoji,
    etiquetas: custom.etiquetas,
    semanasTerapeutico: custom.terapeutico ? custom.semanas : null,
  }),
)

function criarPersonalizada() {
  if (!custom.nome.trim()) return
  const p = { ...perfilCustom.value, id: 'custom-' + uid(), nome: custom.nome.trim() }
  estado.perfisPersonalizados.push(p)
  escolher(p)
}

const perfisDaBiblioteca = PERFIS.length

/* ---------- montagem pela rolagem ---------- */
const raizCena = ref<HTMLElement | null>(null)
let desfazerCenas: (() => void) & { reativar?: () => void } = () => {}
onMounted(() => {
  if (raizCena.value) desfazerCenas = ativarCenas(raizCena.value)
})
onActivated(() => recalcularRolagem(520, desfazerCenas))
onBeforeUnmount(() => desfazerCenas())
</script>

<template>
  <div ref="raizCena" class="stack">
    <section class="row between wrap" data-cena>
      <div>
        <h2>Minhas medicações</h2>
        <p class="small muted">Toque para ver como cada uma age e seus horários.</p>
      </div>
      <button class="btn btn-primary" @click="etapa = 'biblioteca'"><Plus :size="16" /> Adicionar medicação</button>
    </section>

    <TransitionGroup name="lista" tag="div" class="stack">
      <article v-for="m in estado.medicacoes" :key="m.id" data-cena class="card med" :class="{ aberta: aberta === m.id, inativa: !m.ativa }" :style="{ '--cor': m.cor }">
        <button class="topo" :aria-expanded="aberta === m.id" @click="aberta = aberta === m.id ? null : m.id">
          <MedIcone :perfil="perfilDe(m)" :cor="m.cor" :tamanho="44" class="icone-med" />
          <span style="flex: 1 1 180px; text-align: left; min-width: 0">
            <strong>{{ m.nome }} {{ m.doseMg }} mg</strong>
            <span class="tiny faint" style="display: block">{{ perfilDe(m).nome }} · {{ m.horarios.join(', ') || 'sem horário' }}{{ m.ativa ? '' : ' · pausada' }}</span>
          </span>
          <span v-if="inicioPessoal(m.id) != null" class="chip pessoal"><Sparkles :size="12" /> seu início: {{ duracao(inicioPessoal(m.id)!) }}</span>
          <ChevronDown :size="18" class="seta" />
        </button>
        <div class="corpo-wrap">
          <div class="corpo">
            <FichaPerfil v-if="aberta === m.id" :perfil="perfilDe(m)" :cor="m.cor" />
            <div class="row wrap" style="margin-top: 12px">
              <button class="btn btn-sm" @click="editar(m)"><Pencil :size="14" /> Editar</button>
              <button class="btn btn-sm" @click="m.ativa = !m.ativa"><component :is="m.ativa ? Pause : Play" :size="14" /> {{ m.ativa ? 'Pausar' : 'Retomar' }}</button>
              <button class="btn btn-sm btn-danger" @click="remover(m)"><Trash2 :size="14" /> {{ confirmarRemover === m.id ? 'Confirmar remoção' : 'Remover' }}</button>
            </div>
          </div>
        </div>
      </article>
    </TransitionGroup>

    <p v-if="!estado.medicacoes.length" class="card small muted" style="text-align: center">Nenhuma medicação cadastrada ainda.</p>

    <!-- biblioteca -->
    <Transition name="modal">
      <Modal v-if="etapa === 'biblioteca'" titulo="Adicionar medicação" :subtitulo="`${perfisDaBiblioteca} medicações na biblioteca`" @fechar="fechar">
        <input v-model="busca" placeholder="Buscar por nome, marca ou indicação (ex.: Venvanse, depressão)" autofocus />
        <Transition name="fade" mode="out-in">
          <div v-if="previa" key="previa" class="stack">
            <button class="btn btn-sm btn-ghost" style="justify-self: start" @click="previa = null">‹ Voltar</button>
            <h3 class="row"><MedIcone :perfil="previa" :tamanho="32" /> {{ previa.nome }}</h3>
            <FichaPerfil :perfil="previa" />
            <button class="btn btn-primary" @click="escolher(previa)">Usar esta medicação</button>
          </div>
          <div v-else key="lista" class="biblioteca">
            <TransitionGroup name="lista">
              <div v-for="p in resultados" :key="p.id" class="item-bib" :style="{ '--cor': p.cor }">
                <MedIcone :perfil="p" :tamanho="36" />
                <span style="flex: 1; min-width: 0">
                  <strong class="small">{{ p.nome }}</strong>
                  <span class="tiny faint" style="display: block">{{ p.marcas.slice(0, 3).join(', ') || p.classe }}</span>
                </span>
                <button class="btn btn-sm btn-ghost" @click="previa = p">Ver</button>
                <button class="btn btn-sm" @click="escolher(p)">＋</button>
              </div>
            </TransitionGroup>
            <button class="item-bib novo" @click="etapa = 'personalizada'">
              <span class="icone">✍️</span>
              <span style="flex: 1; text-align: left">
                <strong class="small">Não encontrei: criar personalizada</strong>
                <span class="tiny faint" style="display: block">Informe os tempos de início, pico e duração</span>
              </span>
            </button>
          </div>
        </Transition>
      </Modal>
    </Transition>

    <!-- personalizada -->
    <Transition name="modal">
      <Modal v-if="etapa === 'personalizada'" titulo="Medicação personalizada" subtitulo="Use os dados da bula ou do seu médico" @fechar="fechar">
        <div class="dois">
          <label>Nome <input v-model="custom.nome" placeholder="Ex.: Lamotrigina" /></label>
          <label>Classe <input v-model="custom.classe" placeholder="Ex.: Estabilizador de humor" /></label>
        </div>
        <div class="tres">
          <label>Início (h) <span class="par"><input v-model.number="custom.inicio[0]" type="number" step="0.25" min="0" /><input v-model.number="custom.inicio[1]" type="number" step="0.25" min="0" /></span></label>
          <label>Pico (h) <span class="par"><input v-model.number="custom.pico[0]" type="number" step="0.25" min="0" /><input v-model.number="custom.pico[1]" type="number" step="0.25" min="0" /></span></label>
          <label>Duração (h) <span class="par"><input v-model.number="custom.duracao[0]" type="number" step="0.5" min="0" /><input v-model.number="custom.duracao[1]" type="number" step="0.5" min="0" /></span></label>
        </div>
        <label>Meia-vida (h) <input v-model.number="custom.meiaVida" type="number" step="0.5" min="0.2" /></label>
        <div>
          <p class="small muted" style="font-weight: 600; margin-bottom: 6px">Ícone</p>
          <div class="row wrap" style="gap: 6px">
            <button v-for="e in EMOJIS_MED" :key="e" class="emoji-btn" :class="{ on: custom.emoji === e }" @click="custom.emoji = e">{{ e }}</button>
          </div>
        </div>
        <div>
          <p class="small muted" style="font-weight: 600; margin-bottom: 6px">Características (para checar interações)</p>
          <div class="row wrap" style="gap: 6px">
            <label v-for="t in ETIQUETAS_OPCOES" :key="t.id" class="chip" style="cursor: pointer; display: inline-flex">
              <input v-model="custom.etiquetas" type="checkbox" :value="t.id" style="width: auto" /> {{ t.rotulo }}
            </label>
          </div>
        </div>
        <label class="row" style="display: flex; cursor: pointer">
          <input v-model="custom.terapeutico" type="checkbox" style="width: auto" /> O efeito principal leva semanas (ex.: antidepressivo)
        </label>
        <div v-if="custom.terapeutico" class="dois">
          <label>Começa (semanas) <input v-model.number="custom.semanas[0]" type="number" min="0" /></label>
          <label>até (semanas) <input v-model.number="custom.semanas[1]" type="number" min="0" /></label>
        </div>
        <div class="previa-curva">
          <p class="tiny faint">Prévia de uma dose</p>
          <FichaPerfil :key="JSON.stringify(perfilCustom.efeito) + perfilCustom.pk.meiaVidaH" :perfil="perfilCustom" />
        </div>
        <template #rodape>
          <button class="btn btn-ghost" @click="etapa = 'biblioteca'">Voltar</button>
          <button class="btn btn-primary" :disabled="!custom.nome.trim()" @click="criarPersonalizada">Continuar</button>
        </template>
      </Modal>
    </Transition>

    <!-- formulário -->
    <Transition name="modal">
      <Modal v-if="etapa === 'formulario' && perfilEscolhido" :titulo="editando ? 'Editar medicação' : perfilEscolhido.nome" subtitulo="Dose e horários" @fechar="fechar">
        <div class="dois">
          <label>Nome exibido <input v-model="form.nome" /></label>
          <label>Dose (mg) <input v-model.number="form.doseMg" type="number" min="0" step="any" /></label>
        </div>
        <div v-if="perfilEscolhido.dosesComunsMg.length" class="row wrap" style="gap: 6px">
          <span class="tiny faint">Doses comuns:</span>
          <button v-for="d in perfilEscolhido.dosesComunsMg" :key="d" class="chip" :class="{ on: form.doseMg === d }" @click="form.doseMg = d">{{ d }} mg</button>
        </div>
        <div>
          <p class="small muted" style="font-weight: 600; margin-bottom: 6px">Horários</p>
          <TransitionGroup name="lista" tag="div" class="horarios">
            <div v-for="(_, i) in form.horarios" :key="i" class="row">
              <input v-model="form.horarios[i]" type="time" />
              <button class="btn btn-sm btn-ghost" aria-label="Remover horário" @click="form.horarios.splice(i, 1)">✕</button>
            </div>
          </TransitionGroup>
          <button class="btn btn-sm" style="margin-top: 6px" @click="form.horarios.push('12:00')">＋ Horário</button>
          <p class="tiny faint" style="margin-top: 6px">Sugestão: {{ perfilEscolhido.melhorHorario }}</p>
        </div>
        <label>Início do tratamento <input v-model="form.inicioTratamento" type="date" /></label>
        <div>
          <p class="small muted" style="font-weight: 600; margin-bottom: 6px">Cor</p>
          <div class="row wrap" style="gap: 8px">
            <button v-for="c in CORES_MED" :key="c" class="cor" :class="{ on: form.cor === c }" :style="{ background: c }" :aria-label="`Cor ${c}`" @click="form.cor = c" />
          </div>
        </div>
        <template #rodape>
          <button class="btn btn-ghost" @click="editando ? fechar() : (etapa = 'biblioteca')">{{ editando ? 'Cancelar' : 'Voltar' }}</button>
          <button class="btn btn-primary" :disabled="!form.nome.trim()" @click="salvar">Salvar</button>
        </template>
      </Modal>
    </Transition>
  </div>
</template>

<style scoped>
.med {
  padding: 0;
  overflow: hidden;
  border-left: 4px solid var(--cor);
  transition: box-shadow 0.3s, transform 0.3s var(--ease-spring);
}
.med.inativa {
  opacity: 0.6;
}
.topo {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  flex-wrap: wrap;
}
.icone {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  background: color-mix(in srgb, var(--cor) 16%, transparent);
  flex: none;
  transition: transform 0.4s var(--ease-spring);
}
.med.aberta .icone-med {
  transform: rotate(-8deg) scale(1.08);
}
.seta {
  transition: transform 0.35s var(--ease-out);
  color: var(--text-3);
}
.med.aberta .seta {
  transform: rotate(180deg);
}
.pessoal {
  background: color-mix(in srgb, var(--cor) 16%, transparent);
  color: var(--text);
}
.corpo-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s var(--ease-out);
}
.med.aberta .corpo-wrap {
  grid-template-rows: 1fr;
}
.corpo {
  overflow: hidden;
  padding: 0 18px;
}
.med.aberta .corpo {
  padding-bottom: 18px;
}
.biblioteca {
  display: grid;
  gap: 6px;
}
.item-bib {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  background: var(--surface-2);
  border: 1px solid transparent;
  transition: border-color 0.2s, transform 0.25s var(--ease-spring);
}
.item-bib:hover {
  border-color: var(--cor, var(--primary));
  transform: translateX(3px);
}
.item-bib .icone {
  width: 36px;
  height: 36px;
  font-size: 1.1rem;
}
.item-bib.novo {
  border: 1.5px dashed var(--border);
  background: transparent;
}
.dois {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.tres {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
@media (max-width: 460px) {
  .dois,
  .tres {
    grid-template-columns: 1fr;
  }
}
.par {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
.horarios {
  display: grid;
  gap: 6px;
}
.chip.on {
  background: var(--primary);
  color: #fff;
  border-color: transparent;
}
.chip {
  cursor: pointer;
}
.cor {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid transparent;
  transition: transform 0.3s var(--ease-spring);
}
.cor.on {
  border-color: var(--surface-solid);
  box-shadow: 0 0 0 2px var(--text);
  transform: scale(1.15);
}
.emoji-btn {
  font-size: 1.3rem;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--surface-2);
  transition: transform 0.3s var(--ease-spring);
}
.emoji-btn.on {
  background: var(--primary-soft);
  box-shadow: 0 0 0 2px var(--primary);
  transform: scale(1.1);
}
.previa-curva {
  padding: 12px;
  border-radius: 16px;
  border: 1px dashed var(--border);
}
</style>
