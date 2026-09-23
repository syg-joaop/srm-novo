import type { Gravidade, RegraInteracao, Substancia } from '../types'

/** Substâncias do dia a dia que não são "medicações cadastradas", mas interagem. */
export const SUBSTANCIAS: Substancia[] = [
  { id: 'alcool', nome: 'Álcool', emoji: '🍺', etiquetas: ['alcool'] },
  { id: 'cafe', nome: 'Café / energético', emoji: '☕', etiquetas: ['xantina', 'estimulante-leve'] },
  { id: 'vitamina-c', nome: 'Vitamina C / suco cítrico', emoji: '🍊', etiquetas: ['acidificante'] },
  { id: 'antiacido', nome: 'Antiácido / bicarbonato', emoji: '🧂', etiquetas: ['alcalinizante'] },
  { id: 'imao', nome: 'IMAO (selegilina, tranilcipromina…)', emoji: '⛔', etiquetas: ['imao'] },
  { id: 'anticoncepcional', nome: 'Anticoncepcional hormonal', emoji: '🩷', etiquetas: ['anticoncepcional'] },
  { id: 'tramadol', nome: 'Tramadol', emoji: '💉', etiquetas: ['tramadol', 'serotoninergico', 'reduz-limiar-convulsivo'] },
  { id: 'cannabis', nome: 'Cannabis', emoji: '🌿', etiquetas: ['cannabis'] },
]

export const REGRAS: RegraInteracao[] = [
  {
    id: 'imao',
    a: ['imao'],
    b: ['estimulante', 'noradrenergico', 'dopaminergico', 'serotoninergico'],
    gravidade: 'contraindicada',
    titulo: 'Contraindicada com IMAO',
    descricao:
      'IMAOs impedem a degradação de monoaminas. Somados a estimulantes, bupropiona ou antidepressivos, podem causar crise hipertensiva ou síndrome serotoninérgica.',
    conduta: 'Não associe. Respeite pelo menos 14 dias sem IMAO antes de iniciar.',
  },
  {
    id: 'cyp2d6-anfetamina',
    a: ['inibidor-cyp2d6'],
    b: ['anfetamina'],
    gravidade: 'moderada',
    titulo: 'Bupropiona/fluoxetina aumentam o nível da anfetamina',
    descricao:
      'A dextroanfetamina é parcialmente metabolizada pela CYP2D6. Inibidores fortes dessa enzima, como a bupropiona e a fluoxetina, podem aumentar a exposição e prolongar o efeito do estimulante. Na prática você pode sentir o efeito por mais tempo, mais sensibilidade a ansiedade e dificuldade para dormir.',
    conduta:
      'É uma combinação comum e muitas vezes prescrita em conjunto. Tome ambos pela manhã, acompanhe sono, pressão e frequência cardíaca, e registre no app se o efeito dura mais que o esperado.',
  },
  {
    id: 'cyp2d6-substratos',
    a: ['inibidor-cyp2d6'],
    b: ['substrato-cyp2d6'],
    gravidade: 'moderada',
    titulo: 'Inibição da CYP2D6',
    descricao:
      'A inibição da CYP2D6 eleva o nível de medicamentos metabolizados por essa via. Com atomoxetina, o aumento pode chegar a 6–8 vezes; com vortioxetina e venlafaxina, a dose pode precisar de ajuste.',
    conduta: 'Converse com o médico sobre ajuste de dose e observe efeitos colaterais.',
  },
  {
    id: 'noradrenergicos',
    a: ['estimulante'],
    b: ['reduz-limiar-convulsivo'],
    gravidade: 'moderada',
    titulo: 'Efeito ativador somado',
    descricao:
      'Estimulante e bupropiona aumentam dopamina e noradrenalina. Os efeitos se somam: mais energia e foco, mas também mais chance de insônia, ansiedade, perda de apetite e aumento de pressão e frequência cardíaca. Em raros casos, reduz o limiar convulsivo.',
    conduta: 'Evite doses tardias, mantenha refeições regulares e hidratação, e não passe da dose prescrita.',
  },
  {
    id: 'serotoninergicos',
    a: ['serotoninergico'],
    b: ['serotoninergico'],
    gravidade: 'moderada',
    titulo: 'Risco de síndrome serotoninérgica',
    descricao:
      'Dois agentes serotoninérgicos juntos (por exemplo, anfetamina com ISRS/IRSN, ou tramadol) aumentam o risco, que é raro, de síndrome serotoninérgica: agitação, tremor, sudorese, febre e rigidez.',
    conduta: 'Procure atendimento em caso de febre, tremores ou confusão mental.',
  },
  {
    id: 'limiar',
    a: ['reduz-limiar-convulsivo'],
    b: ['reduz-limiar-convulsivo', 'tramadol'],
    gravidade: 'grave',
    titulo: 'Risco somado de convulsão',
    descricao: 'Bupropiona e tramadol reduzem o limiar convulsivo. Juntos, o risco aumenta de forma significativa.',
    conduta: 'Evite a associação ou use somente com orientação médica.',
  },
  {
    id: 'bupropiona-alcool',
    a: ['reduz-limiar-convulsivo'],
    b: ['alcool'],
    gravidade: 'grave',
    titulo: 'Bupropiona e álcool',
    descricao:
      'Álcool com bupropiona aumenta o risco de convulsões e de efeitos neuropsiquiátricos. Parar de beber de repente, quando o consumo é frequente, também é perigoso.',
    conduta: 'Evite ou reduza ao mínimo o consumo de álcool.',
  },
  {
    id: 'estimulante-alcool',
    a: ['estimulante'],
    b: ['alcool'],
    gravidade: 'moderada',
    titulo: 'Estimulante mascara a embriaguez',
    descricao: 'O estimulante reduz a sensação de embriaguez, levando a beber mais, e sobrecarrega o coração.',
    conduta: 'Evite beber nos dias de uso ou espere o fim do efeito.',
  },
  {
    id: 'anfetamina-acido',
    a: ['anfetamina'],
    b: ['acidificante'],
    gravidade: 'leve',
    titulo: 'Acidificantes reduzem o efeito',
    descricao:
      'Vitamina C, sucos cítricos e refrigerantes ácidos diminuem a absorção e aumentam a eliminação urinária da anfetamina. O efeito pode ficar mais fraco ou mais curto.',
    conduta: 'Deixe 1 h de intervalo entre a dose e suco de laranja ou vitamina C.',
  },
  {
    id: 'anfetamina-alcalino',
    a: ['anfetamina'],
    b: ['alcalinizante'],
    gravidade: 'moderada',
    titulo: 'Alcalinizantes intensificam o efeito',
    descricao:
      'Antiácidos e bicarbonato aumentam a absorção e reduzem a eliminação da anfetamina, prolongando e intensificando o efeito.',
    conduta: 'Evite antiácidos perto da dose do estimulante.',
  },
  {
    id: 'estimulante-cafeina',
    a: ['estimulante', 'noradrenergico'],
    b: ['xantina'],
    gravidade: 'leve',
    titulo: 'Cafeína somada',
    descricao: 'A cafeína soma efeitos: coração acelerado, tremor, ansiedade e insônia.',
    conduta: 'Prefira café só pela manhã e com moderação; registre o café no app para ver o impacto.',
  },
  {
    id: 'sedativos',
    a: ['sedativo'],
    b: ['sedativo', 'alcool'],
    gravidade: 'grave',
    titulo: 'Depressão do SNC somada',
    descricao: 'Sedativos juntos (ou com álcool) aumentam sonolência, lentidão, risco de quedas e depressão respiratória.',
    conduta: 'Evite a combinação sem orientação médica.',
  },
  {
    id: 'estimulante-sedativo',
    a: ['estimulante'],
    b: ['sedativo', 'hipnotico'],
    gravidade: 'atencao',
    titulo: 'Efeitos opostos',
    descricao: 'Um sedativo à noite pode mascarar a insônia causada pelo estimulante, e o estimulante mascara a sedação.',
    conduta: 'Se precisa de ajuda para dormir, revise primeiro o horário do estimulante com o médico.',
  },
  {
    id: 'modafinila-aco',
    a: ['indutor-cyp3a4'],
    b: ['anticoncepcional'],
    gravidade: 'grave',
    titulo: 'Reduz eficácia do anticoncepcional',
    descricao: 'A modafinila induz a CYP3A4 e acelera a eliminação de hormônios contraceptivos.',
    conduta: 'Use método de barreira durante o uso e por 1 mês após parar.',
  },
  {
    id: 'estimulante-cannabis',
    a: ['estimulante', 'noradrenergico'],
    b: ['cannabis'],
    gravidade: 'atencao',
    titulo: 'Cannabis e estimulantes',
    descricao: 'Pode aumentar a frequência cardíaca e a ansiedade, e piora a memória de trabalho, que é o que o tratamento busca melhorar.',
    conduta: 'Observe como você reage e converse com o médico.',
  },
  {
    id: 'melatonina-estimulante',
    a: ['hormonio-sono'],
    b: ['estimulante'],
    gravidade: 'atencao',
    titulo: 'Melatonina e estimulante',
    descricao: 'Não há interação química importante. A melatonina pode ajudar quando o estimulante atrasa o sono.',
    conduta: 'Tome 1 a 2 h antes de dormir.',
  },
]

export const ORDEM_GRAVIDADE: Record<Gravidade, number> = {
  contraindicada: 0,
  grave: 1,
  moderada: 2,
  leve: 3,
  atencao: 4,
}

export const ROTULO_GRAVIDADE: Record<Gravidade, string> = {
  contraindicada: 'Contraindicada',
  grave: 'Grave',
  moderada: 'Moderada',
  leve: 'Leve',
  atencao: 'Atenção',
}

export interface Participante {
  id: string
  nome: string
  emoji: string
  etiquetas: string[]
}

export interface InteracaoEncontrada {
  regra: RegraInteracao
  x: Participante
  y: Participante
}

function casa(p: Participante, lado: string[]) {
  return p.etiquetas.some((e) => lado.includes(e)) || lado.includes(p.id)
}

/** Retorna todas as interações entre os participantes, mais graves primeiro. */
export function encontrarInteracoes(participantes: Participante[]): InteracaoEncontrada[] {
  const achadas: InteracaoEncontrada[] = []
  for (let i = 0; i < participantes.length; i++) {
    for (let j = i + 1; j < participantes.length; j++) {
      const x = participantes[i]
      const y = participantes[j]
      for (const regra of REGRAS) {
        if ((casa(x, regra.a) && casa(y, regra.b)) || (casa(y, regra.a) && casa(x, regra.b))) {
          achadas.push({ regra, x, y })
        }
      }
    }
  }
  return achadas.sort((m, n) => ORDEM_GRAVIDADE[m.regra.gravidade] - ORDEM_GRAVIDADE[n.regra.gravidade])
}
