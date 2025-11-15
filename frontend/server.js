const express = require('express');
const path = require('path');
const app = express();

// Serve uploads directory
app.use('/uploads', express.static('/app/backend/uploads'));

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Admin SPA routing
app.use('/admin', (req, res, next) => {
  if (req.path.match(/\.(js|css|map|ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'build/admin/index.html'));
});

// Frontend SPA fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Frontend: http://0.0.0.0:${PORT}/`);
  console.log(`🔧 Admin: http://0.0.0.0:${PORT}/admin/`);
  console.log(`🖼️ Uploads: Proxied to backend`);
});
