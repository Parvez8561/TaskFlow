const db = require("./database");

/*
  Query 1:
  Count of tasks per column
*/

const getTaskCountPerColumn = () => {
  return db
    .prepare(`
      SELECT
        columns.id,
        columns.name,
        COUNT(tasks.id) AS task_count
      FROM columns
      LEFT JOIN tasks
        ON tasks.column_id = columns.id
      GROUP BY columns.id, columns.name
      ORDER BY columns.position
    `)
    .all();
};


/*
  Query 2:
  Tasks with a given priority,
  newest first
*/

const getTasksByPriority = (priority) => {
  return db
    .prepare(`
      SELECT
        tasks.id,
        tasks.title,
        tasks.description,
        tasks.priority,
        tasks.created_at,
        columns.name AS column_name
      FROM tasks
      JOIN columns
        ON tasks.column_id = columns.id
      WHERE tasks.priority = ?
      ORDER BY tasks.created_at DESC
    `)
    .all(priority);
};


module.exports = {
  getTaskCountPerColumn,
  getTasksByPriority,
};