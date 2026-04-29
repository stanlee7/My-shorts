import youtubedl from 'youtube-dl-exec';

async function testFormat() {
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
              
  console.log('Selected format:', {
    ext: format.ext,
    vcodec: format.vcodec,
    acodec: format.acodec,
    format_id: format.format_id,
    resolution: format.resolution
  });
}
testFormat();
