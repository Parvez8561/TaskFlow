const db = require("./database");

const seed = db.transaction(() => {
  // Clear old data
  db.prepare("DELETE FROM tasks").run();
  db.prepare("DELETE FROM columns").run();
  db.prepare("DELETE FROM boards").run();

  // Create board
  const board = db
    .prepare("INSERT INTO boards (name) VALUES (?)")
    .run("TaskFlow Board");

  const boardId = board.lastInsertRowid;

  // Create columns
  const todo = db
    .prepare(`
      INSERT INTO columns (board_id, name, position)
      VALUES (?, ?, ?)
    `)
    .run(boardId, "To Do", 1);

  const inProgress = db
    .prepare(`
      INSERT INTO columns (board_id, name, position)
      VALUES (?, ?, ?)
    `)
    .run(boardId, "In Progress", 2);

  const done = db
    .prepare(`
      INSERT INTO columns (board_id, name, position)
      VALUES (?, ?, ?)
    `)
    .run(boardId, "Done", 3);

  // Create tasks
  db.prepare(`
    INSERT INTO tasks
    (column_id, title, description, priority, position)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    todo.lastInsertRowid,
    "Create project structure",
    "Set up the TaskFlow project structure",
    "high",
    1
  );

  db.prepare(`
    INSERT INTO tasks
    (column_id, title, description, priority, position)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    todo.lastInsertRowid,
    "Design dashboard UI",
    "Create the dashboard interface",
    "medium",
    2
  );

  db.prepare(`
    INSERT INTO tasks
    (column_id, title, description, priority, position)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    inProgress.lastInsertRowid,
    "Build React frontend",
    "Develop the React frontend",
    "high",
    1
  );

  db.prepare(`
    INSERT INTO tasks
    (column_id, title, description, priority, position)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    done.lastInsertRowid,
    "Setup Vite project",
    "Initialize the Vite project",
    "low",
    1
  );
});

seed();

console.log("Database reset and seed data inserted successfully!");

// db.close();