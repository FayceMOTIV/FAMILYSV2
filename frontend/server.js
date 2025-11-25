const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  logLevel: 'silent'
}));

// Serve uploads directory
app.use('/uploads', express.static('/app/backend/uploads'));

// Serve main app static files with cache control
app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res, path) => {
    // Cache busting pour éviter les problèmes de cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Frontend SPA fallback - DOIT être en dernier
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Frontend: http://0.0.0.0:${PORT}/`);
  console.log(`🔧 Admin: http://0.0.0.0:${PORT}/admin/`);
  console.log(`🖼️ Uploads: Served from backend`);
  console.log(`🔌 API: Proxied to backend:8001`);
});
