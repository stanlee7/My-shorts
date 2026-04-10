import youtubedl from 'youtube-dl-exec';

async function testYtDlpUrl() {
  try {
    const output = await youtubedl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      dumpJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });
    
    // Find a format with both video and audio (e.g., mp4)
    const format = output.formats.find((f: any) => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4');
    console.log('Direct URL:', format ? format.url : 'No combined format found');
  } catch (e) {
    console.error('Error:', e);
  }
}
testYtDlpUrl();
