const express = require("express");
const db = require("../database");

const router = express.Router();

/* =========================
   GET ALL TASKS
========================= */

router.get("/", (req, res) => {
  try {
    const sql =
      "SELECT tasks.id, tasks.title, tasks.description, tasks.priority, " +
      "tasks.position, columns.name AS column_name " +
      "FROM tasks " +
      "JOIN columns ON tasks.column_id = columns.id " +
      "ORDER BY columns.position, tasks.position";

    const tasks = db.prepare(sql).all();

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch tasks"
    });
  }
});


/* =========================
   CREATE TASK
========================= */

router.post("/", (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      column_id
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Title is required"
      });
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        error: "Priority must be low, medium, or high"
      });
    }

    const column = db
      .prepare(
        "SELECT id, name FROM columns WHERE id = ?"
      )
      .get(column_id);

    if (!column) {
      return res.status(404).json({
        error: "Column not found"
      });
    }

    const lastTask = db
      .prepare(
        "SELECT MAX(position) AS maxPosition " +
        "FROM tasks WHERE column_id = ?"
      )
      .get(column_id);

    const position =
      (lastTask.maxPosition || 0) + 1;

    const result = db
      .prepare(
        "INSERT INTO tasks " +
        "(column_id, title, description, priority, position) " +
        "VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        column_id,
        title.trim(),
        description || "",
        priority,
        position
      );

    res.status(201).json({
      id: result.lastInsertRowid,
      title: title.trim(),
      description: description || "",
      priority,
      position,
      column_name: column.name
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create task"
    });
  }
});


/* =========================
   MOVE TASK
   To Do → In Progress
   In Progress → Done
========================= */

router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { column_id } = req.body;

    const column = db
      .prepare(
        "SELECT id FROM columns WHERE id = ?"
      )
      .get(column_id);

    if (!column) {
      return res.status(404).json({
        error: "Column not found"
      });
    }

    const task = db
      .prepare(
        "SELECT id FROM tasks WHERE id = ?"
      )
      .get(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    const lastTask = db
      .prepare(
        "SELECT MAX(position) AS maxPosition " +
        "FROM tasks WHERE column_id = ?"
      )
      .get(column_id);

    const position =
      (lastTask.maxPosition || 0) + 1;

    db.prepare(
      "UPDATE tasks " +
      "SET column_id = ?, position = ? " +
      "WHERE id = ?"
    ).run(
      column_id,
      position,
      id
    );

    res.json({
      message: "Task moved successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to move task"
    });
  }
});


/* =========================
   EDIT TASK
   Update title, description,
   and priority
========================= */

router.patch("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Title is required"
      });
    }

    if (
      !["low", "medium", "high"].includes(priority)
    ) {
      return res.status(400).json({
        error: "Priority must be low, medium, or high"
      });
    }

    const task = db
      .prepare(
        "SELECT id FROM tasks WHERE id = ?"
      )
      .get(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    db.prepare(
      "UPDATE tasks " +
      "SET title = ?, description = ?, priority = ? " +
      "WHERE id = ?"
    ).run(
      title.trim(),
      description || "",
      priority,
      id
    );

    res.json({
      message: "Task edited successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to edit task"
    });
  }
});


/* =========================
   DELETE TASK
========================= */

router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const task = db
      .prepare(
        "SELECT id FROM tasks WHERE id = ?"
      )
      .get(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    db.prepare(
      "DELETE FROM tasks WHERE id = ?"
    ).run(id);

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete task"
    });
  }
});


module.exports = router;