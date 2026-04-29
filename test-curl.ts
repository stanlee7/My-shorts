import http from 'http';

http.get('http://localhost:3000/api/youtube/stream?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ', (res) => {
  console.log('Status Code:', res.statusCode);
  res.destroy();
});
