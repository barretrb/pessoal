async function findJoao2() {
  const html = await fetch('https://www.youtube.com/results?search_query=BibleProject+Portugues+Visao+Geral+Joao+13-21').then(r => r.text());
  const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
  for (const m of matches.slice(0, 8)) {
    const r = await fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + m[1] + '&format=json');
    if (r.status === 200) {
      const d = await r.json();
      console.log(m[1], '->', d.title);
    }
  }
}
findJoao2();
