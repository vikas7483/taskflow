const request = require("supertest");
const app = require("../src/app");

describe("TaskFlow API", () => {
  test("GET /api/boards/1 returns the board", async () => {
    const response = await request(app)
      .get("/api/boards/1");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.board).toBeDefined();
    expect(response.body.columns).toBeDefined();
  });

  test("POST /api/tasks rejects an empty title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "",
        description: "Invalid task",
        priority: "High",
        column_id: 1,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Task title is required"
    );
  });

  test("POST /api/tasks creates a valid task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Automated Test Task",
        description: "Created by Jest",
        priority: "Medium",
        column_id: 1,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.task).toBeDefined();
    expect(response.body.task.title).toBe(
      "Automated Test Task"
    );

    // Clean up test task
    await request(app)
      .delete(`/api/tasks/${response.body.task.id}`);
  });

  test("DELETE /api/tasks/:id deletes a task", async () => {
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({
        title: "Task To Delete",
        description: "Temporary test task",
        priority: "Low",
        column_id: 1,
      });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.task.id;

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });

  test("GET /api/tasks/priority/High returns high priority tasks", async () => {
    const response = await request(app)
      .get("/api/tasks/priority/High");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.tasks)).toBe(true);
  });

  test("GET /api/boards/1/task-counts returns task counts", async () => {
    const response = await request(app)
      .get("/api/boards/1/task-counts");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.counts)).toBe(true);
  });
});