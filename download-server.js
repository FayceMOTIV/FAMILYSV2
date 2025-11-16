const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3010;
const FILE_PATH = '/app/familys-mobile-app-final.zip';

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  if (req.url === '/familys-mobile-app.zip' || req.url === '/') {
    const stat = fs.statSync(FILE_PATH);
    
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="familys-mobile-app.zip"',
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*'
    });
    
    const readStream = fs.createReadStream(FILE_PATH);
    readStream.pipe(res);
    
    console.log('✅ File sent');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Download server running on port ${PORT}`);
  console.log(`📥 Download URL: http://localhost:${PORT}/familys-mobile-app.zip`);
});
