import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import youtubedl from "youtube-dl-exec";
import path from "path";

// Cache for YouTube direct URLs to avoid running yt-dlp on every range request
const urlCache = new Map<string, { directUrl: string, expires: number }>();

async function getDirectUrl(youtubeUrl: string): Promise<string> {
  const cached = urlCache.get(youtubeUrl);
  if (cached && cached.expires > Date.now()) {
    return cached.directUrl;
  }

  const output = await youtubedl(youtubeUrl, {
    dumpJson: true,
    noWarnings: true,
    callHome: false,
    noCheckCertificate: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
  });
  
  const format = output.formats.find((f: any) => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4') 
              || output.formats.find((f: any) => f.vcodec !== 'none' && f.acodec !== 'none');
              
  if (!format || !format.url) {
    throw new Error("No suitable format found");
  }

  // Cache for 2 hours
  urlCache.set(youtubeUrl, { directUrl: format.url, expires: Date.now() + 2 * 60 * 60 * 1000 });
  return format.url;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route to stream YouTube video
  app.get("/api/youtube/stream", async (req, res) => {
    const url = req.query.url as string;
    
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    try {
      const directUrl = await getDirectUrl(url);

      // Proxy the request to the direct URL
      const headers: any = {};
      if (req.headers.range) {
        headers.range = req.headers.range;
      }

      const response = await fetch(directUrl, { headers });
      
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
          console.error("Stream pump error:", err);
          res.end();
        });
      } else {
        res.end();
      }

    } catch (error: any) {
      console.error("YouTube proxy error:", error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process YouTube video" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
