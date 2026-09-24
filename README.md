# MedTempo 💊⏱️

App pessoal para acompanhar os horários das doses e descobrir **quando cada medicação começa a fazer efeito** no seu dia a dia.

Vem configurado com **Lyberdia 30 mg** (lisdexanfetamina, TDAH) e **Bupropiona 150 mg** (XL, depressão). Dá para adicionar outras medicações da biblioteca ou criar uma personalizada.

## O que ele faz

- **Hoje**: cartões com a fase atual de cada medicação (absorção → início → subida → pico → ativo → queda), contagem até o próximo marco e nível em % do pico habitual (uso contínuo).
- **Seu organismo (3D)**: cena em Three.js no topo da tela. Um núcleo vivo (shader com ruído e borda iridescente) é cercado por uma órbita de partículas para cada remédio. A quantidade, a velocidade e o brilho das partículas acompanham o nível na hora escolhida no relógio, e registrar uma dose dispara uma explosão de partículas na cor do remédio. Arraste para girar; o mouse gera paralaxe.
- **Seu dia, hora a hora**: relógio de 24 h interativo. Arraste o ponteiro ou aperte play para ver o dia se desenrolar: cada remédio é um anel cuja espessura acompanha o nível no sangue, partículas orbitam conforme a intensidade, o céu do fundo muda com a hora, e um narrador conta cada evento (dose, janela de início, pico, queda, seus registros, sono). A reprodução desacelera nos eventos; dá para escolher 1×/2×/4× e rever qualquer um dos últimos 7 dias. Abaixo, uma faixa de 24 horas sincronizada com o relógio.
- **"Já sentiu?"**: quando a medicação entra na janela de início, o app pergunta se você já sentiu o efeito. Cada resposta vira um dado do seu **tempo de início pessoal**, e as previsões seguintes passam a usar esse tempo.
- **Calendário interativo**: navegação por mês com animação (setas, botão Hoje, arrastar no celular e teclado). Pontos mostram doses tomadas e perdidas, ✨ marca os dias com início registrado e há modos de mapa de calor para humor, foco e energia. Ao tocar num dia aparecem a curva, as doses e os registros daquele dia, e dá para lançar doses ou efeitos retroativos.
- **Remédios**: biblioteca com 20 medicações (lisdexanfetamina, bupropiona XL/SR, metilfenidato IR/LA/OROS, atomoxetina, modafinila, ISRS, IRSN, vortioxetina, guanfacina, melatonina, zolpidem, clonazepam, quetiapina e cafeína). Cada ficha traz mecanismo de ação, início, pico, duração, meia-vida, efeito terapêutico em semanas, melhor horário, dicas e alertas, além da curva de uma dose com simulação de refeição.
- **Interações**: mapa de funcionamento do dia (Gantt dos horários planejados), alerta de dose tardia que atrapalha o sono e checagem de interações entre suas medicações e substâncias do dia a dia (álcool, café, vitamina C, antiácidos, IMAO, anticoncepcional, tramadol e cannabis). Também é possível simular uma nova medicação.
- **Padrões**: seu início típico comparado à bula, em jejum e com refeição, duração pessoal, tendência ao longo do tempo, humor, foco e energia por semana (onde aparece o efeito da bupropiona), foco por hora do dia e sintomas mais frequentes.
- Lembretes via notificação do navegador (enquanto o app estiver aberto), tema claro/escuro, exportar/importar JSON e dados de exemplo para explorar.

## Como as curvas são calculadas

Modelo de 1 compartimento com absorção de 1ª ordem (função de Bateman), com o `ka` resolvido a partir do `tmax` de referência e o `ke` a partir da meia-vida. Formulações bifásicas (Ritalina LA, Concerta) usam mais de um pulso de liberação. Doses repetidas se somam por superposição, por isso a bupropiona mostra o acúmulo até o equilíbrio (~8 dias). As janelas de efeito percebido (início, pico, duração) vêm de bula e literatura, são deslocadas pela refeição e, quando há registros, pelo seu início pessoal (mediana).

> ⚠️ Ferramenta educativa e de acompanhamento. As curvas são estimativas e não substituem orientação médica. Nunca ajuste doses por conta própria.

## Animações

- **Three.js**: cena 3D do organismo (`src/lib/cena3d.ts`), carregada sob demanda num chunk separado; pausa fora da tela, respeita `prefers-reduced-motion` e tem fallback sem WebGL.
- **GSAP + ScrollTrigger**: título revelado palavra por palavra, entradas em cascata, revelação ao rolar, contadores numéricos e botões magnéticos (`v-magnetico`), em `src/lib/movimento.ts`.
- **Lenis**: rolagem suave com inércia em desktop (desativada em toque e em movimento reduzido).
- **Por aba**: o calendário vira os meses em 3D numa onda célula a célula (no sentido da navegação) e ondula a partir do dia selecionado ao trocar o modo de cor; em Padrões, as barras semanais, o foco por hora e as sparklines se montam conforme a rolagem (scrub) e o marcador "você" desliza até o seu início típico; Remédios e Interações entram em cena ao rolar, e cartões inclinam em 3D seguindo o mouse (`v-inclinar`).
- Seções marcadas com `data-cena` ficam com as animações CSS pausadas até entrarem na tela (`ativarCenas` em `src/lib/movimento.ts`).

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes do modelo farmacocinético e das interações
npm run build      # typecheck + build estático em dist/
npm run preview
```

Os dados ficam só no navegador (localStorage). Não há backend nem conta.

## Estrutura

```
src/
  data/medicamentos.ts   biblioteca de perfis farmacológicos
  data/interacoes.ts     substâncias, regras e verificador de interações
  lib/farmaco.ts         modelo PK, fases do efeito, janelas pessoais
  lib/datas.ts           utilidades de data/hora
  store.ts               estado persistido, consultas e ações
  ui.ts                  navegação e modais
  components/            gráfico do dia, anel de fase, modais, fichas
  views/                 Hoje, Calendário, Remédios, Interações, Padrões
```
