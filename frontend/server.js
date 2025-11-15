const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Proxy /uploads to backend
app.use('/uploads', createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Admin SPA - all routes starting with /admin
app.use('/admin', (req, res, next) => {
  // Skip if it's a static file request
  if (req.path.match(/\.(js|css|map|ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  // Return admin index.html for all other /admin requests
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
});
