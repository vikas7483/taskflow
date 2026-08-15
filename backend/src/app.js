const express = require("express");
const cors = require("cors");
const db = require("./db/database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TaskFlow API is running"
  });
});

app.get("/api/boards/:boardId", (req, res) => {
  const boardId = Number(req.params.boardId);

  if (!Number.isInteger(boardId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid board ID"
    });
  }

  try {
    const board = db
      .prepare("SELECT id, name FROM boards WHERE id = ?")
      .get(boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    const columns = db
      .prepare(`
        SELECT id, name, position
        FROM columns
        WHERE board_id = ?
        ORDER BY position
      `)
      .all(boardId);

    const tasks = db
      .prepare(`
        SELECT
          id,
          column_id,
          title,
          description,
          priority,
          created_at
        FROM tasks
        WHERE column_id IN (
          SELECT id FROM columns WHERE board_id = ?
        )
        ORDER BY created_at DESC
      `)
      .all(boardId);

    const result = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id)
    }));

    res.json({
      success: true,
      board,
      columns: result
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load board"
    });
  }
});

app.get("/api/tasks/priority/:priority", (req, res) => {
  const { priority } = req.params;

  const validPriorities = ["Low", "Medium", "High"];

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be Low, Medium, or High"
    });
  }

  try {
    // Required database query: tasks by priority, newest first
    const tasks = db
      .prepare(`
        SELECT
          id,
          column_id,
          title,
          description,
          priority,
          created_at
        FROM tasks
        WHERE priority = ?
        ORDER BY created_at DESC
      `)
      .all(priority);

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks"
    });
  }
});

app.post("/api/tasks", (req, res) => {
  const {
    column_id,
    title,
    description = null,
    priority = "Medium"
  } = req.body;

  // Backend validation is required by the assignment.
  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Task title is required"
    });
  }

  const validPriorities = ["Low", "Medium", "High"];

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be Low, Medium, or High"
    });
  }

  if (!Number.isInteger(Number(column_id))) {
    return res.status(400).json({
      success: false,
      message: "Valid column_id is required"
    });
  }

  try {
    const column = db
      .prepare("SELECT id FROM columns WHERE id = ?")
      .get(column_id);

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found"
      });
    }

    const result = db
      .prepare(`
        INSERT INTO tasks
        (column_id, title, description, priority)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        column_id,
        title.trim(),
        description,
        priority
      );

    const task = db
      .prepare(`
        SELECT id, column_id, title, description, priority, created_at
        FROM tasks
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create task"
    });
  }
});

app.put("/api/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);

  const {
    title,
    description = null,
    priority = "Medium"
  } = req.body;

  if (!Number.isInteger(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID"
    });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Task title is required"
    });
  }

  const validPriorities = ["Low", "Medium", "High"];

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be Low, Medium, or High"
    });
  }

  try {
    const existingTask = db
      .prepare("SELECT id FROM tasks WHERE id = ?")
      .get(taskId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?
      WHERE id = ?
    `).run(
      title.trim(),
      description,
      priority,
      taskId
    );

    const task = db
      .prepare(`
        SELECT id, column_id, title, description, priority, created_at
        FROM tasks
        WHERE id = ?
      `)
      .get(taskId);

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update task"
    });
  }
});

app.patch("/api/tasks/:id/move", (req, res) => {
  const taskId = Number(req.params.id);
  const { column_id } = req.body;

  if (!Number.isInteger(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID"
    });
  }

  if (!Number.isInteger(Number(column_id))) {
    return res.status(400).json({
      success: false,
      message: "Valid column_id is required"
    });
  }

  try {
    const task = db
      .prepare("SELECT id FROM tasks WHERE id = ?")
      .get(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const column = db
      .prepare("SELECT id FROM columns WHERE id = ?")
      .get(column_id);

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Target column not found"
      });
    }

    db.prepare(`
      UPDATE tasks
      SET column_id = ?
      WHERE id = ?
    `).run(column_id, taskId);

    const updatedTask = db
      .prepare(`
        SELECT id, column_id, title, description, priority, created_at
        FROM tasks
        WHERE id = ?
      `)
      .get(taskId);

    res.json({
      success: true,
      message: "Task moved successfully",
      task: updatedTask
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to move task"
    });
  }
});

app.delete("/api/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID"
    });
  }

  try {
    const result = db
      .prepare("DELETE FROM tasks WHERE id = ?")
      .run(taskId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete task"
    });
  }
});

// Required database query: count tasks per column.
app.get("/api/boards/:boardId/task-counts", (req, res) => {
  const boardId = Number(req.params.boardId);

  if (!Number.isInteger(boardId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid board ID"
    });
  }

  try {
    const counts = db
      .prepare(`
        SELECT
          c.id AS column_id,
          c.name AS column_name,
          COUNT(t.id) AS task_count
        FROM columns c
        LEFT JOIN tasks t ON t.column_id = c.id
        WHERE c.board_id = ?
        GROUP BY c.id, c.name
        ORDER BY c.position
      `)
      .all(boardId);

    res.json({
      success: true,
      counts
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get task counts"
    });
  }
});

module.exports = app;