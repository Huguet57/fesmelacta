const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to set response headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Routes
// Specific file route
app.use('/models', express.static(path.join(__dirname, 'models')));

// Handles any requests that don't match the ones above (i.e., React app)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});