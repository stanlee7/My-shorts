import youtubedl from 'youtube-dl-exec';
import fs from 'fs';

async function testStream() {
  try {
    const subprocess = youtubedl.exec('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      format: 'best[ext=mp4]',
      output: '-'
    });
    
    subprocess.stdout?.pipe(fs.createWriteStream('test.mp4'));
    
    subprocess.on('close', () => {
      console.log('Stream finished');
    });
  } catch (e) {
    console.error('Error:', e);
  }
}
testStream();
