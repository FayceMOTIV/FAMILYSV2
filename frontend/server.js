const express = require('express');
const path = require('path');
const app = express();

// Serve admin panel under /admin
app.use('/admin', express.static(path.join(__dirname, 'build/admin')));

// Handle admin SPA routing
app.use('/admin', (req, res, next) => {
  // If request is for a file (has extension), let static middleware handle it
  if (req.path.includes('.')) {
    return next();
  }
  // Otherwise return admin index.html for SPA routing
  res.sendFile(path.join(__dirname, 'build/admin/index.html'));
});

// Serve main frontend
app.use(express.static(path.join(__dirname, 'build')));

// Handle frontend SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Frontend: http://0.0.0.0:${PORT}/`);
  console.log(`Admin: http://0.0.0.0:${PORT}/admin/`);
});
