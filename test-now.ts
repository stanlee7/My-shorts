import youtubedl from 'youtube-dl-exec';

async function test() {
  try {
    const output = await youtubedl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      dumpJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });
    console.log("Success");
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
