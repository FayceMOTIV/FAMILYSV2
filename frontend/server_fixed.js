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

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, 'build/admin')));

// Serve main app static files  
app.use(express.static(path.join(__dirname, 'build')));

// Admin SPA routing
app.use('/admin', (req, res, next) => {
  // If requesting a file with extension, let express.static handle it
  if (req.path.match(/\.(js|css|map|json|ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  // Otherwise send admin index.html
  res.sendFile(path.join(__dirname, 'build/admin/index.html'));
});

// Frontend SPA fallback
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
