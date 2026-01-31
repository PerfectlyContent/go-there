const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// API routes can go here
// app.use('/api', apiRouter);

// All other requests serve the React app (SPA client-side routing)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
