import fs from 'fs';

const joao = JSON.parse(fs.readFileSync('./devocional-biblia/public/biblia/joao.json', 'utf8'));

// Verify total verse counts before and after
import { execSync } from 'child_process';
// Run transform and check
const JOAO_HEADINGS = [
  { ch: 1, vStart: 1, title: 'Prólogo: Cristo, a Palavra eterna' },
  { ch: 1, vStart: 19, title: 'O testemunho de João Batista' },
  { ch: 1, vStart: 29, title: 'Jesus, o Cordeiro de Deus' },
  { ch: 1, vStart: 35, title: 'Os primeiros discípulos' },
  { ch: 1, vStart: 43, title: 'Jesus chama Filipe e Natanael' },

  { ch: 2, vStart: 1, title: 'O casamento em Caná' },
  { ch: 2, vStart: 13, title: 'Jesus purifica o templo' },

  { ch: 3, vStart: 1, title: 'Nicodemos visita Jesus' },
  { ch: 3, vStart: 22, title: 'João Batista exalta Jesus' },
  { ch: 3, vStart: 31, title: 'A superioridade do Filho' },

  { ch: 4, vStart: 1, title: 'A mulher samaritana junto ao poço' },
  { ch: 4, vStart: 27, title: 'Os campos estão prontos para a colheita' },
  { ch: 4, vStart: 39, title: 'Muitos samaritanos creem' },
  { ch: 4, vStart: 43, title: 'Jesus cura o filho de um oficial' },

  { ch: 5, vStart: 1, title: 'Jesus cura um homem no sábado' },
  { ch: 5, vStart: 16, title: 'Jesus afirma ser o Filho de Deus' },
  { ch: 5, vStart: 31, title: 'Testemunhas de Jesus' },

  { ch: 6, vStart: 1, title: 'A primeira multiplicação dos pães' },
  { ch: 6, vStart: 16, title: 'Jesus anda sobre o mar' },
  { ch: 6, vStart: 22, title: 'Jesus, o pão da vida' },
  { ch: 6, vStart: 60, title: 'Muitos discípulos abandonam Jesus' },

  { ch: 7, vStart: 1, title: 'Jesus e seus irmãos' },
  { ch: 7, vStart: 10, title: 'Jesus ensina abertamente no templo' },
  { ch: 7, vStart: 37, title: 'Jesus promete água viva' },
  { ch: 7, vStart: 40, title: 'Divisão e descrença' },

  { ch: 8, vStart: 1, title: 'Uma mulher é pega em adultério' },
  { ch: 8, vStart: 12, title: 'Jesus, a luz do mundo' },
  { ch: 8, vStart: 21, title: 'O povo incrédulo é advertido' },
  { ch: 8, vStart: 31, title: 'Jesus e Abraão' },

  { ch: 9, vStart: 1, title: 'Jesus cura um homem cego de nascença' },
  { ch: 9, vStart: 35, title: 'Cegueira espiritual' },

  { ch: 10, vStart: 1, title: 'O bom pastor e suas ovelhas' },
  { ch: 10, vStart: 22, title: 'Jesus afirma ser o Filho de Deus' },

  { ch: 11, vStart: 1, title: 'A ressurreição de Lázaro' },
  { ch: 11, vStart: 45, title: 'A conspiração para matar Jesus' },

  { ch: 12, vStart: 1, title: 'Jesus é ungido em Betânia' },
  { ch: 12, vStart: 12, title: 'A entrada de Jesus em Jerusalém' },
  { ch: 12, vStart: 20, title: 'Jesus prediz sua morte' },
  { ch: 12, vStart: 37, title: 'A incredulidade do povo' },

  { ch: 13, vStart: 1, title: 'Jesus lava os pés de seus discípulos' },
  { ch: 13, vStart: 18, title: 'Jesus prediz a traição de Judas' },
  { ch: 13, vStart: 31, title: 'Jesus prediz a negação de Pedro' },

  { ch: 14, vStart: 1, title: 'Jesus, o caminho para o Pai' },
  { ch: 14, vStart: 15, title: 'Jesus promete o Espírito Santo' },

  { ch: 15, vStart: 1, title: 'Jesus, a videira verdadeira' },
  { ch: 15, vStart: 18, title: 'Os discípulos de Jesus e o mundo' },

  { ch: 16, vStart: 1, title: 'A perseguição aos discípulos' },
  { ch: 16, vStart: 5, title: 'A obra do Espírito Santo' },
  { ch: 16, vStart: 16, title: 'A tristeza será transformada em alegria' },

  { ch: 17, vStart: 1, title: 'A oração de Jesus' },

  { ch: 18, vStart: 1, title: 'Jesus é traído e preso' },
  { ch: 18, vStart: 13, title: 'Pedro nega Jesus pela primeira vez' },
  { ch: 18, vStart: 19, title: 'O sumo sacerdote interroga Jesus' },
  { ch: 18, vStart: 25, title: 'Pedro nega Jesus pela segunda e terceira vez' },
  { ch: 18, vStart: 28, title: 'O julgamento de Jesus diante de Pilatos' },

  { ch: 19, vStart: 1, title: 'Jesus é açoitado e ridicularizado' },
  { ch: 19, vStart: 17, title: 'A crucificação' },
  { ch: 19, vStart: 28, title: 'A morte de Jesus' },
  { ch: 19, vStart: 38, title: 'O sepultamento de Jesus' },

  { ch: 20, vStart: 1, title: 'A ressurreição' },
  { ch: 20, vStart: 11, title: 'Jesus aparece a Maria Madalena' },
  { ch: 20, vStart: 19, title: 'Jesus aparece a seus discípulos' },
  { ch: 20, vStart: 24, title: 'Jesus aparece a Tomé' },
  { ch: 20, vStart: 30, title: 'Propósito do livro' },

  { ch: 21, vStart: 1, title: 'Epílogo: Jesus aparece a sete discípulos' },
  { ch: 21, vStart: 15, title: 'Jesus restaura Pedro' },
  { ch: 21, vStart: 20, title: 'Jesus e o discípulo amado' },
  { ch: 21, vStart: 24, title: 'Observações finais' }
];

function cleanVerseText(text) {
  let cleaned = text;
  for (const h of JOAO_HEADINGS) {
    const titleRegex = new RegExp(`\\s*${h.title}\\s*$`, 'i');
    cleaned = cleaned.replace(titleRegex, '').trim();
  }
  return cleaned;
}

for (let c = 1; c <= 21; c++) {
  const chStr = String(c);
  const oldVerses = joao[chStr].sections.flatMap(s => s.verses);
  const headingsInCh = JOAO_HEADINGS.filter(h => h.ch === c).sort((a, b) => a.vStart - b.vStart);

  let newSections = [];
  for (let i = 0; i < headingsInCh.length; i++) {
    const currentH = headingsInCh[i];
    const nextH = headingsInCh[i + 1];
    const vEnd = nextH ? nextH.vStart - 1 : 999;
    const sVerses = oldVerses.filter(v => v.number >= currentH.vStart && v.number <= vEnd);
    newSections.push({
      title: currentH.title,
      verses: sVerses
    });
  }

  const newVerses = newSections.flatMap(s => s.verses);
  if (oldVerses.length !== newVerses.length) {
    console.error(`ERROR in Chapter ${c}: old=${oldVerses.length}, new=${newVerses.length}`);
  } else {
    console.log(`Ch ${c} OK: ${newVerses.length} verses across ${newSections.length} sections.`);
  }
}
