const express = require('express');
const cors = require('cors');

const taskRoutes = require('./routes/task');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: 'https://taskflow-frontend-ltvf.onrender.com'
}));

app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow Backend is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});