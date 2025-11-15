const express = require('express');
const path = require('path');
const app = express();

// Serve static files for admin
app.use('/admin/static', express.static(path.join(__dirname, 'build/admin/static')));

// Serve static files for main frontend
app.use('/static', express.static(path.join(__dirname, 'build/static')));

// Serve admin assets (but not index.html)
app.use('/admin', express.static(path.join(__dirname, 'build/admin'), { index: false }));

// Admin SPA routing - catch all /admin routes and return index.html
app.get(/^\/admin/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build/admin/index.html'));
});

// Serve main frontend static files
app.use(express.static(path.join(__dirname, 'build'), { index: false }));

// Main frontend SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Frontend: http://0.0.0.0:${PORT}/`);
  console.log(`🔧 Admin: http://0.0.0.0:${PORT}/admin/`);
});
