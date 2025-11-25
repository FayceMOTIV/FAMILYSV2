const express = require('express');
const path = require('path');
const app = express();
const PORT = 3005;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// PWA Service Worker
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    self.addEventListener('install', (event) => {
      console.log('Service Worker installing.');
    });
    
    self.addEventListener('activate', (event) => {
      console.log('Service Worker activating.');
    });
  `);
});

// Fallback to index.html for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ PWA running on http://localhost:${PORT}`);
  console.log(`📱 Open on iPhone: https://react-reborn.preview.emergentagent.com:${PORT}`);
});
