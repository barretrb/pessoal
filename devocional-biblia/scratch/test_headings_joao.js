import fs from 'fs';

const joao = JSON.parse(fs.readFileSync('./devocional-biblia/public/biblia/joao.json', 'utf8'));

// List of known/standard section headings in João NVT
const JOAO_HEADINGS = [
  // Ch 1
  { ch: 1, vStart: 1, title: 'Prólogo: Cristo, a Palavra eterna' },
  { ch: 1, vStart: 19, title: 'O testemunho de João Batista' },
  { ch: 1, vStart: 29, title: 'Jesus, o Cordeiro de Deus' },
  { ch: 1, vStart: 35, title: 'Os primeiros discípulos' },
  { ch: 1, vStart: 43, title: 'Jesus chama Filipe e Natanael' },
  // Ch 2
  { ch: 2, vStart: 1, title: 'O casamento em Caná' },
  { ch: 2, vStart: 13, title: 'Jesus purifica o templo' },
  // Ch 3
  { ch: 3, vStart: 1, title: 'Nicodemos visita Jesus' },
  { ch: 3, vStart: 22, title: 'João Batista exalta Jesus' },
  { ch: 3, vStart: 31, title: 'A superioridade do Filho' },
  // Ch 4
  { ch: 4, vStart: 1, title: 'A mulher samaritana junto ao poço' },
  { ch: 4, vStart: 27, title: 'Os campos estão maduros para a colheita' },
  { ch: 4, vStart: 39, title: 'Muitos samaritanos creem' },
  { ch: 4, vStart: 43, title: 'Jesus cura o filho de um oficial' },
  // Ch 5
  { ch: 5, vStart: 1, title: 'Jesus cura um homem no sábado' },
  { ch: 5, vStart: 16, title: 'Jesus afirma ser o Filho de Deus' },
  { ch: 5, vStart: 31, title: 'Testemunhas de Jesus' },
  // Ch 6
  { ch: 6, vStart: 1, title: 'A primeira multiplicação dos pães' },
  { ch: 6, vStart: 16, title: 'Jesus anda sobre o mar' },
  { ch: 6, vStart: 22, title: 'Jesus, o pão da vida' },
  { ch: 6, vStart: 60, title: 'Muitos discípulos abandonam Jesus' },
  // Ch 7
  { ch: 7, vStart: 1, title: 'Jesus e seus irmãos' },
  { ch: 7, vStart: 10, title: 'Jesus ensina abertamente no templo' },
  { ch: 7, vStart: 37, title: 'Jesus promete água viva' },
  { ch: 7, vStart: 40, title: 'Divisão e descrença' },
  // Ch 8
  { ch: 8, vStart: 1, title: 'Uma mulher é pega em adultério' },
  { ch: 8, vStart: 12, title: 'Jesus, a luz do mundo' },
  { ch: 8, vStart: 21, title: 'O povo incrédulo é advertido' },
  { ch: 8, vStart: 31, title: 'Jesus e Abraão' },
  // Ch 9
  { ch: 9, vStart: 1, title: 'Jesus cura um homem cego de nascença' },
  { ch: 9, vStart: 35, title: 'Cegueira espiritual' },
  // Ch 10
  { ch: 10, vStart: 1, title: 'O bom pastor e suas ovelhas' },
  { ch: 10, vStart: 22, title: 'Jesus afirma ser o Filho de Deus' },
  // Ch 11
  { ch: 11, vStart: 1, title: 'A ressurreição de Lázaro' },
  { ch: 11, vStart: 45, title: 'A conspiração para matar Jesus' },
  // Ch 12
  { ch: 12, vStart: 1, title: 'Jesus é ungido em Betânia' },
  { ch: 12, vStart: 12, title: 'A entrada de Jesus em Jerusalém' },
  { ch: 12, vStart: 20, title: 'Jesus prediz sua morte' },
  { ch: 12, vStart: 37, title: 'A incredulidade do povo' },
  // Ch 13
  { ch: 13, vStart: 1, title: 'Jesus lava os pés de seus discípulos' },
  { ch: 13, vStart: 18, title: 'Jesus prediz a traição de Judas' },
  { ch: 13, vStart: 31, title: 'Jesus prediz a negação de Pedro' },
  // Ch 14
  { ch: 14, vStart: 1, title: 'Jesus, o caminho para o Pai' },
  { ch: 14, vStart: 15, title: 'Jesus promete o Espírito Santo' },
  // Ch 15
  { ch: 15, vStart: 1, title: 'Jesus, a videira verdadeira' },
  { ch: 15, vStart: 18, title: 'Os discípulos de Jesus e o mundo' },
  // Ch 16
  { ch: 16, vStart: 1, title: 'A perseguição aos discípulos' },
  { ch: 16, vStart: 5, title: 'A obra do Espírito Santo' },
  { ch: 16, vStart: 16, title: 'A tristeza será transformada em alegria' },
  // Ch 17
  { ch: 17, vStart: 1, title: 'A oração de Jesus' },
  // Ch 18
  { ch: 18, vStart: 1, title: 'Jesus é traído e preso' },
  { ch: 18, vStart: 13, title: 'Pedro nega Jesus pela primeira vez' },
  { ch: 18, vStart: 19, title: 'O sumo sacerdote interroga Jesus' },
  { ch: 18, vStart: 25, title: 'Pedro nega Jesus pela segunda e terceira vez' },
  { ch: 18, vStart: 28, title: 'O julgamento de Jesus diante de Pilatos' },
  // Ch 19
  { ch: 19, vStart: 1, title: 'Jesus é açoitado e ridicularizado' },
  { ch: 19, vStart: 17, title: 'A crucificação' },
  { ch: 19, vStart: 28, title: 'A morte de Jesus' },
  { ch: 19, vStart: 38, title: 'O sepultamento de Jesus' },
  // Ch 20
  { ch: 20, vStart: 1, title: 'A ressurreição' },
  { ch: 20, vStart: 11, title: 'Jesus aparece a Maria Madalena' },
  { ch: 20, vStart: 19, title: 'Jesus aparece a seus discípulos' },
  { ch: 20, vStart: 24, title: 'Jesus aparece a Tomé' },
  { ch: 20, vStart: 30, title: 'Propósito do livro' },
  // Ch 21
  { ch: 21, vStart: 1, title: 'Epílogo: Jesus aparece a sete discípulos' },
  { ch: 21, vStart: 15, title: 'Jesus restaura Pedro' },
  { ch: 21, vStart: 20, title: 'Jesus e o discípulo amado' },
  { ch: 21, vStart: 24, title: 'Observações finais' }
];

console.log(`Total mapped headings for João: ${JOAO_HEADINGS.length}`);
