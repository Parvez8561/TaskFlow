const request = require("supertest");
const app = require("../server");
const db = require("../database");
const {
  getTaskCountPerColumn,
  getTasksByPriority
} = require("../queries");

describe("TaskFlow Backend Tests", () => {
  let testTaskId;
  let originalColumnId;

  afterAll(() => {
    if (testTaskId) {
      db.prepare(
        "DELETE FROM tasks WHERE id = ?"
      ).run(testTaskId);
    }

    db.close();
  });

  test("creating a task with no title should fail", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "",
        description: "Test task",
        priority: "medium",
        column_id: 4
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Title is required"
    );
  });

  test("moving a task should update its column", async () => {
    const existingTask = db
      .prepare(
        "SELECT id, column_id FROM tasks LIMIT 1"
      )
      .get();

    expect(existingTask).toBeDefined();

    testTaskId = existingTask.id;
    originalColumnId = existingTask.column_id;

    const targetColumnId =
      originalColumnId === 4 ? 5 : 4;

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .send({
        column_id: targetColumnId
      });

    expect(response.status).toBe(200);

    const updatedTask = db
      .prepare(
        "SELECT column_id FROM tasks WHERE id = ?"
      )
      .get(testTaskId);

    expect(updatedTask.column_id).toBe(
      targetColumnId
    );

    db.prepare(
      "UPDATE tasks SET column_id = ? WHERE id = ?"
    ).run(originalColumnId, testTaskId);
  });

  test("task count per column query should return column data", () => {
    const results = getTaskCountPerColumn();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    expect(results[0]).toHaveProperty("id");
    expect(results[0]).toHaveProperty("name");
    expect(results[0]).toHaveProperty(
      "task_count"
    );
  });

  test("tasks by priority query should return newest tasks first", () => {
    const results =
      getTasksByPriority("high");

    expect(Array.isArray(results)).toBe(true);

    for (let i = 1; i < results.length; i++) {
      const previousDate = new Date(
        results[i - 1].created_at
      );

      const currentDate = new Date(
        results[i].created_at
      );

      expect(
        previousDate.getTime()
      ).toBeGreaterThanOrEqual(
        currentDate.getTime()
      );
    }
  });
});