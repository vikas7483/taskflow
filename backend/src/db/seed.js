const db = require("./database");

const existingBoard = db
  .prepare("SELECT id FROM boards LIMIT 1")
  .get();

if (!existingBoard) {
  const boardResult = db
    .prepare("INSERT INTO boards (name) VALUES (?)")
    .run("TaskFlow Board");

  const boardId = boardResult.lastInsertRowid;

  const insertColumn = db.prepare(
    "INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)"
  );

  const todo = insertColumn.run(boardId, "To Do", 1);
  const inProgress = insertColumn.run(boardId, "In Progress", 2);
  const done = insertColumn.run(boardId, "Done", 3);

  const insertTask = db.prepare(`
    INSERT INTO tasks
    (column_id, title, description, priority)
    VALUES (?, ?, ?, ?)
  `);

  insertTask.run(
    todo.lastInsertRowid,
    "Set up TaskFlow",
    "Create the initial project structure",
    "High"
  );

  insertTask.run(
    inProgress.lastInsertRowid,
    "Build backend API",
    "Create the task management endpoints",
    "Medium"
  );

  insertTask.run(
    done.lastInsertRowid,
    "Define database schema",
    "Create Board, Column and Task tables",
    "High"
  );

  console.log("Seed data inserted successfully.");
} else {
  console.log("Seed data already exists.");
}

db.close();