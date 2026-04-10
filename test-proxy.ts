import express from "express";
import youtubedl from "youtube-dl-exec";

const app = express();

app.get("/test-proxy", async (req, res) => {
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  try {
    const output = await youtubedl(url, {
      dumpJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });
    
    const format = output.formats.find((f: any) => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4');
    if (!format) {
      return res.status(404).send("No format");
    }

    const videoUrl = format.url;
    console.log("Got URL:", videoUrl);

    // Proxy the request
    const headers: any = {};
    if (req.headers.range) {
      headers.range = req.headers.range;
    }

    const response = await fetch(videoUrl, { headers });
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      // Convert Web Stream to Node Stream
      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(value);
        }
      };
      pump().catch(err => {
        console.error("Pump error:", err);
        res.end();
      });
    } else {
      res.end();
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
});

app.listen(3001, () => console.log("Test server on 3001"));
