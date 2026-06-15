// server.js
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === '/' || path === '/index.html') {
      const indexPath = join(__dirname, 'index.html');
      const file = Bun.file(indexPath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response('index.html no encontrado en ' + indexPath, { status: 404 });
    }
    
    if (path.startsWith('/src/')) {
      const relativePath = path.slice(5);
      const fullPath = join(__dirname, 'src', relativePath);
      const file = Bun.file(fullPath);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    return new Response('404 Not Found', { status: 404 });
  },
});   

console.log('Servidor corriendo en http://localhost:3000');
