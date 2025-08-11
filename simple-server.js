const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const gameFile = path.join(__dirname, 'super-mario-game', 'public', 'simple-mario.html');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/simple-mario.html') {
    fs.readFile(gameFile, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Game file not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Super Mario game server running at http://localhost:${port}`);
  console.log('Open http://localhost:3000 in your browser to play!');
});