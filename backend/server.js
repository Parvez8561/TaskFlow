const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/task");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow Backend is running!"
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;