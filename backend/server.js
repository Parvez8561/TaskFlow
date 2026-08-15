const express = require('express');
const cors = require('cors');

const taskRoutes = require('./routes/task');
require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://taskflow-frontend-ltvf.onrender.com'
}));

app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});