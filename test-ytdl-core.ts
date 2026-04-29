import ytdl from '@distube/ytdl-core';

async function test() {
  try {
    const info = await ytdl.getInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
    console.log("Success:", format.url.substring(0, 50) + "...");
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
