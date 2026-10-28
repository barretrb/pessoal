async function testPut() {
  const objId = 'ff808181a09d98f701a17d6ffa0427ae';
  const putRes = await fetch(`https://api.restful-api.dev/objects/${objId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'devocional_sync_DEVOCIONAL-SYNC-RAFAEL',
      data: {
        familyCode: 'DEVOCIONAL-SYNC-RAFAEL',
        updatedAt: new Date().toISOString(),
        test: 'updated successfully!'
      }
    })
  });
  const putJson = await putRes.json();
  console.log('PUT result:', putJson);
}

testPut();
