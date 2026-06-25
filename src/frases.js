// Lista de frases motivacionais para o casal durante a gravidez.
// Podes adicionar, remover ou editar frases livremente nesta lista.
const FRASES = [
  "Cada dia que passa é um dia mais perto de conhecerem o vosso bebé.",
  "Sejam pacientes um com o outro — estão os dois a aprender ao mesmo tempo.",
  "O amor que já sentem por este bebé só vai crescer a partir de agora.",
  "Vocês já são uma equipa fantástica. A família vai sentir isso.",
  "Respirem fundo. Estão a fazer um trabalho incrível.",
  "Cada ecografia, cada pontapé, é uma pequena prova de que tudo está a correr bem.",
  "Não precisam de ter tudo perfeito — só precisam de estar presentes um para o outro.",
  "O cansaço de hoje vai valer a pena quando virem o sorriso dele(a).",
  "São os primeiros a amar este bebé incondicionalmente. Isso já é tudo.",
  "Celebrem as pequenas vitórias — uma checklist riscada, um marco passado.",
  "A casa não precisa de estar perfeita. Só precisa de amor à espera.",
  "Confiem no processo. O corpo da Sara sabe o que está a fazer.",
  "Vocês os dois, juntos, conseguem ultrapassar qualquer imprevisto.",
  "Cada semana que passa, o vosso bebé fica mais perto de vos conhecer.",
  "Guardem este tempo de espera — também é parte bonita da história.",
  "Sejam gentis um com o outro nos dias mais cansados. É normal.",
  "O nervosismo que sentem é só amor a querer sair antes do tempo.",
  "Vão ser excelentes pais. Já o estão a provar todos os dias.",
  "Festejem hoje, mesmo as coisas pequenas. Fazem parte da contagem.",
  "Este capítulo passa rápido — tentem aproveitar também os momentos a dois.",
]

/**
 * Devolve sempre a mesma frase para o mesmo dia do calendário,
 * mudando automaticamente à meia-noite (hora local).
 */
export function fraseDoDia() {
  const hoje = new Date()
  // Número de dias desde uma data fixa, usado como "semente" estável
  const diasDesdeEpoca = Math.floor(hoje.getTime() / (1000 * 60 * 60 * 24))
  const indice = diasDesdeEpoca % FRASES.length
  return FRASES[indice]
}
