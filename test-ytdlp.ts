import youtubedl from 'youtube-dl-exec';

async function testYtDlp() {
  try {
    const output = await youtubedl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      dumpJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });
    console.log('Success:', output.title);
  } catch (e) {
    console.error('Error:', e);
  }
}
testYtDlp();
