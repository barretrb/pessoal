import { dailyMedia, SHORT_DEVOTIONAL_TRACKS, BIBLE_PROJECT_VIDEOS } from '../src/data/dailyMedia.js';

async function checkYoutubeId(id, name) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    const isOk = res.status === 200;
    let title = '';
    if (isOk) {
      const data = await res.json();
      title = data.title;
    }
    console.log(`[${isOk ? 'OK' : 'FAIL ' + res.status}] ${name} (${id}) -> ${title}`);
    return isOk;
  } catch (e) {
    console.log(`[ERROR] ${name} (${id}) -> ${e.message}`);
    return false;
  }
}

async function runChecks() {
  console.log('--- Checando Músicas Curadas ---');
  for (const [day, m] of Object.entries(dailyMedia)) {
    if (m.music?.youtubeId) {
      await checkYoutubeId(m.music.youtubeId, `Dia ${day} Music: ${m.music.title}`);
    }
    if (m.video?.youtubeId) {
      await checkYoutubeId(m.video.youtubeId, `Dia ${day} Video: ${m.video.title}`);
    }
  }

  console.log('\n--- Checando Catálogo Devocional ---');
  for (const t of SHORT_DEVOTIONAL_TRACKS) {
    await checkYoutubeId(t.youtubeId, `Track: ${t.title}`);
  }

  console.log('\n--- Checando BibleProject Vídeos ---');
  for (const [k, v] of Object.entries(BIBLE_PROJECT_VIDEOS)) {
    await checkYoutubeId(v.youtubeId, `BibleProject ${k}: ${v.title}`);
  }
}

runChecks();
