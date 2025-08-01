import puppeteer, { Browser, Page } from 'puppeteer';
import { Server } from 'http';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

declare global {
  var browser: Browser;
  var page: Page;
  var server: Server;
}

beforeAll(async () => {
  // Start a simple HTTP server to serve our files
  const server = http.createServer((req, res) => {
    const url = req.url || '/';
    let filePath = path.join(__dirname, '../../', url === '/' ? 'test.html' : url);
    
    // Serve WASM files with correct MIME type
    if (filePath.endsWith('.wasm')) {
      res.setHeader('Content-Type', 'application/wasm');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200);
      res.end(content);
    } catch (error) {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  
  await new Promise<void>((resolve) => {
    server.listen(3000, () => {
      console.log('Test server running on http://localhost:3000');
      resolve();
    });
  });
  
  global.server = server;
  
  // Launch Puppeteer
  global.browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  global.page = await global.browser.newPage();
  
  // Enable console logging from the page
  global.page.on('console', (msg) => {
    console.log(`PAGE LOG: ${msg.text()}`);
  });
  
  global.page.on('pageerror', (error) => {
    console.error(`PAGE ERROR: ${error.message}`);
  });
}, 30000);

afterAll(async () => {
  if (global.page) {
    await global.page.close();
  }
  if (global.browser) {
    await global.browser.close();
  }
  if (global.server) {
    global.server.close();
  }
});
