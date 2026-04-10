import youtubedl from 'youtube-dl-exec';

async function test() {
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  console.log("Starting yt-dlp...");
  const subprocess = youtubedl.exec(url, {
    format: 'best[ext=mp4]',
    output: '-'
  });
  
  subprocess.stderr?.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  subprocess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
test();
