async function searchYouTube(query) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    // Procura por videoId
    const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
    const candidateIds = [...new Set(matches.map(m => m[1]))];
    
    for (const id of candidateIds.slice(0, 5)) {
      const check = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (check.status === 200) {
        const data = await check.json();
        return { id, title: data.title, author: data.author_name };
      }
    }
  } catch (e) {
    console.error(`Error searching ${query}:`, e.message);
  }
  return null;
}

async function run() {
  const queries = [
    'Regis Danese Faz Um Milagre em Mim clipe',
    'Gabriela Rocha Hosana',
    'Isaias Saad Bondade de Deus',
    'Casa Worship Prodigo',
    'Laura Souguellis A Boa Parte',
    'Gabriel Guedes Porque Ele Vive',
    'Gabriela Rocha Lugar Secreto',
    'Deigma Marques Que Ele Cresca',
    'BibleProject Portugues Lucas',
    'BibleProject Portugues Exodo',
    'BibleProject Portugues Joao'
  ];

  for (const q of queries) {
    const res = await searchYouTube(q);
    console.log(`Query "${q}" =>`, res);
  }
}

run();
