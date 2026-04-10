async function testCobalt() {
  try {
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        vQuality: '720'
      })
    });
    const data = await response.json();
    console.log('Cobalt Response:', data);
  } catch (e) {
    console.error('Error:', e);
  }
}
testCobalt();
