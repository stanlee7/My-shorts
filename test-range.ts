import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/youtube/stream?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  headers: {
    'Range': 'bytes=100000-200000'
  }
};

http.get(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let dataLen = 0;
  res.on('data', (chunk) => {
    dataLen += chunk.length;
  });
  
  res.on('end', () => {
    console.log('Response ended. Total data:', dataLen);
  });
}).on('error', (e) => {
  console.error('Got error:', e.message);
});
