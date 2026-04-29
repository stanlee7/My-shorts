import http from 'http';

http.get('http://localhost:3000/api/youtube/stream?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let dataLen = 0;
  res.on('data', (chunk) => {
    dataLen += chunk.length;
    if (dataLen > 100000) {
      console.log('Received some data, destroying connection.');
      res.destroy();
    }
  });
  
  res.on('end', () => {
    console.log('Response ended. Total data:', dataLen);
  });
}).on('error', (e) => {
  console.error('Got error:', e.message);
});
