async function testApis() {
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  
  // Test 1: noembed (only gives metadata)
  // Test 2: https://co.wuk.sh/api/json (Cobalt new API?)
  try {
    const res = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    console.log('Cobalt new:', await res.text());
  } catch(e) {}
}
testApis();
