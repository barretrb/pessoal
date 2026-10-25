// Definições de Relações de Discurso do BibleArc (Técnica de John Piper)
// Referência: https://app.biblearc.com/

export const BIBLE_ARC_RELATIONS = [
  {
    category: "Lógica e Fundamento",
    relations: [
      {
        id: "ground",
        name: "Causa / Fundamento (Ground)",
        symbol: "G",
        color: "#3b82f6", // azul
        description: "A proposição principal é sustentada pelo fundamento. Ex: 'Alegrem-se (principal) PORQUE seus nomes estão nos céus (fundamento)'."
      },
      {
        id: "inference",
        name: "Inferência / Conclusão (Inference)",
        symbol: "∴",
        color: "#2563eb",
        description: "Conclusão deduzida a partir de uma premissa. Ex: 'Fostes comprados por alto preço; PORTANTO, glorificai a Deus'."
      },
      {
        id: "purpose",
        name: "Propósito (Purpose)",
        symbol: "Pur",
        color: "#059669", // verde esmeralda
        description: "A intenção ou objetivo com que uma ação é realizada. Ex: 'Eu vim PARA QUE tenham vida'."
      },
      {
        id: "result",
        name: "Resultado / Efeito (Result)",
        symbol: "Res",
        color: "#10b981",
        description: "A consequência real produzida por uma ação. Ex: 'O vento soprou FORTE, DE MODO QUE a casa ruiu'."
      }
    ]
  },
  {
    category: "Contraste e Condição",
    relations: [
      {
        id: "contrast",
        name: "Contraste (Contrast)",
        symbol: "Con",
        color: "#dc2626", // vermelho
        description: "Duas ideias opostas ou excludentes. Ex: 'O salário do pecado é a morte, MAS o dom gratuito de Deus é a vida eterna'."
      },
      {
        id: "concession",
        name: "Concessão (Concession)",
        symbol: "Cnc",
        color: "#d97706", // âmbar
        description: "Uma verdade se sustenta a despeito de um obstáculo. Ex: 'AINDA QUE eu ande pelo vale da sombra, NÃO TEMEREI'."
      },
      {
        id: "condition",
        name: "Condição (Condition)",
        symbol: "If",
        color: "#7c3aed", // violeta
        description: "Uma ação depende do cumprimento de outra. Ex: 'SE permanecerdes em mim, PEDIREIS o que quiserdes'."
      }
    ]
  },
  {
    category: "Desenvolvimento e Explicação",
    relations: [
      {
        id: "progression",
        name: "Série / Progressão (Progression)",
        symbol: "+",
        color: "#6b7280", // cinza
        description: "Passos sucessivos ou sequência de pensamentos. Ex: 'Peçam, e recebereis; busquem, e achareis; batam, e abrir-se-á'."
      },
      {
        id: "explanation",
        name: "Explicação (Explanation)",
        symbol: "Exp",
        color: "#0891b2", // ciano
        description: "Esclarece, define ou amplia a proposição anterior. Ex: 'Isto é o meu mandamento: que vos ameis uns aos outros'."
      },
      {
        id: "question_answer",
        name: "Pergunta & Resposta (Q/A)",
        symbol: "?!",
        color: "#ea580c", // laranja
        description: "Uma pergunta retórica ou doutrinária seguida por sua resposta direta."
      }
    ]
  }
];
