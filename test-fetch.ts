import youtubedl from 'youtube-dl-exec';

async function testFetch() {
  const output = await youtubedl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    dumpJson: true,
    noWarnings: true,
    callHome: false,
    noCheckCertificate: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
  });
  
  const format = output.formats.find((f: any) => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4') 
              || output.formats.find((f: any) => f.vcodec !== 'none' && f.acodec !== 'none');
              
  console.log("Direct URL:", format.url.substring(0, 50) + "...");
  
  const res = await fetch(format.url, { headers: { 'Range': 'bytes=0-1000' } });
  console.log("Fetch status:", res.status);
  console.log("Fetch headers:", res.headers);
}
testFetch();
