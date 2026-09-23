# MedTempo 💊⏱️

App pessoal para acompanhar os horários das doses e descobrir **quando cada medicação começa a fazer efeito** no seu dia a dia.

Vem configurado com **Lyberdia 30 mg** (lisdexanfetamina, TDAH) e **Bupropiona 150 mg** (XL, depressão). Dá para adicionar outras medicações da biblioteca ou criar uma personalizada.

## O que ele faz

- **Hoje**: anel animado por medicação com a fase atual (absorvendo → janela de início → subindo → pico → ativo → diminuindo), contagem regressiva até o início previsto, nível estimado no organismo e o gráfico de 24 h com curvas, janelas de início/pico, horário de sono e o marcador "agora".
- **"Já sentiu?"**: quando a medicação entra na janela de início, o app pergunta se você já sentiu o efeito. Cada resposta vira um dado do seu **tempo de início pessoal**, e as previsões seguintes passam a usar esse tempo.
- **Calendário interativo**: navegação por mês com animação (setas, botão Hoje, arrastar no celular e teclado). Pontos mostram doses tomadas e perdidas, ✨ marca os dias com início registrado e há modos de mapa de calor para humor, foco e energia. Ao tocar num dia aparecem a curva, as doses e os registros daquele dia, e dá para lançar doses ou efeitos retroativos.
- **Remédios**: biblioteca com 20 medicações (lisdexanfetamina, bupropiona XL/SR, metilfenidato IR/LA/OROS, atomoxetina, modafinila, ISRS, IRSN, vortioxetina, guanfacina, melatonina, zolpidem, clonazepam, quetiapina e cafeína). Cada ficha traz mecanismo de ação, início, pico, duração, meia-vida, efeito terapêutico em semanas, melhor horário, dicas e alertas, além da curva de uma dose com simulação de refeição.
- **Interações**: mapa de funcionamento do dia (Gantt dos horários planejados), alerta de dose tardia que atrapalha o sono e checagem de interações entre suas medicações e substâncias do dia a dia (álcool, café, vitamina C, antiácidos, IMAO, anticoncepcional, tramadol e cannabis). Também é possível simular uma nova medicação.
- **Padrões**: seu início típico comparado à bula, em jejum e com refeição, duração pessoal, tendência ao longo do tempo, humor, foco e energia por semana (onde aparece o efeito da bupropiona), foco por hora do dia e sintomas mais frequentes.
- Lembretes via notificação do navegador (enquanto o app estiver aberto), tema claro/escuro, exportar/importar JSON e dados de exemplo para explorar.

## Como as curvas são calculadas

Modelo de 1 compartimento com absorção de 1ª ordem (função de Bateman), com o `ka` resolvido a partir do `tmax` de referência e o `ke` a partir da meia-vida. Formulações bifásicas (Ritalina LA, Concerta) usam mais de um pulso de liberação. Doses repetidas se somam por superposição, por isso a bupropiona mostra o acúmulo até o equilíbrio (~8 dias). As janelas de efeito percebido (início, pico, duração) vêm de bula e literatura, são deslocadas pela refeição e, quando há registros, pelo seu início pessoal (mediana).

> ⚠️ Ferramenta educativa e de acompanhamento. As curvas são estimativas e não substituem orientação médica. Nunca ajuste doses por conta própria.

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
