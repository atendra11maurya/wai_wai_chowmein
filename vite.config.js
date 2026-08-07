import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

function saveApiPlugin() {
  return {
    name: 'save-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const targetPath = path.resolve(__dirname, 'src/config/portfolioData.json');
              fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
              
              exec('git add src/config/portfolioData.json && git commit -m "Update portfolio data via inline editor" && git push', { cwd: __dirname }, (error, stdout, stderr) => {
                if (error) {
                  console.error('Git push failed:', error);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: error.message }));
                } else {
                  console.log('Git push success:', stdout);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, message: 'Saved and pushed locally.' }));
                }
              });
            } catch (err) {
              console.error(err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), saveApiPlugin()],
})
