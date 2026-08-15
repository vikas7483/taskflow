import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";
const BOARD_ID = 1;

function App() {
  const [board, setBoard] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    column_id: 1,
    title: "",
    description: "",
    priority: "Medium",
  });

  // Load board from backend
  const loadBoard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/boards/${BOARD_ID}`
      );

      setBoard(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load the TaskFlow board."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, []);

  // Open create task form
  const openCreateForm = (columnId) => {
    setError("");
    setEditingTask(null);

    setFormData({
      column_id: columnId,
      title: "",
      description: "",
      priority: "Medium",
    });

    setShowForm(true);
  };

  // Open edit task form
  const openEditForm = (task) => {
    setError("");
    setEditingTask(task);

    setFormData({
      column_id: task.column_id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
    });

    setShowForm(true);
  };

  // Close modal
  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setError("");
  };

  // Handle form fields
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create / update task
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Frontend validation
    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      if (editingTask) {
        // Update existing task
        await axios.put(
          `${API_URL}/tasks/${editingTask.id}`,
          {
            title: formData.title.trim(),
            description: formData.description,
            priority: formData.priority,
          }
        );
      } else {
        // Create new task
        await axios.post(`${API_URL}/tasks`, {
          column_id: Number(formData.column_id),
          title: formData.title.trim(),
          description: formData.description,
          priority: formData.priority,
        });
      }

      setError("");
      closeForm();
      await loadBoard();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to save the task."
      );
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await axios.delete(
        `${API_URL}/tasks/${taskId}`
      );

      await loadBoard();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to delete the task."
      );
    }
  };

  // Move task
  const moveTask = async (taskId, columnId) => {
    try {
      setError("");

      await axios.patch(
        `${API_URL}/tasks/${taskId}/move`,
        {
          column_id: Number(columnId),
        }
      );

      await loadBoard();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to move the task."
      );
    }
  };

  // Filter tasks by priority
  const getVisibleTasks = (tasks) => {
    if (priorityFilter === "All") {
      return tasks;
    }

    return tasks.filter(
      (task) => task.priority === priorityFilter
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          Loading TaskFlow...
        </div>
      </div>
    );
  }

  // Initial loading error
  if (error && !board) {
    return (
      <div className="app">
        <div className="error-box">
          {error}
        </div>

        <button onClick={loadBoard}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div>
          <h1>TaskFlow</h1>

          <p>
            Simple task management for small teams
          </p>
        </div>

        {/* Priority filter */}
        <div className="filter-area">
          <label htmlFor="priorityFilter">
            Filter:
          </label>

          <select
            id="priorityFilter"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
          >
            <option value="All">
              All Priorities
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>
          </select>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* Board */}
      <main className="board">
        {board?.columns?.map((column) => {
          const visibleTasks =
            getVisibleTasks(column.tasks);

          return (
            <section
              className="column"
              key={column.id}
            >

              {/* Column header */}
              <div className="column-header">

                <div>
                  <h2>{column.name}</h2>

                  <span className="task-count">
                    {visibleTasks.length} task
                    {visibleTasks.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <button
                  className="add-button"
                  onClick={() =>
                    openCreateForm(column.id)
                  }
                >
                  + Add
                </button>
              </div>

              {/* Tasks */}
              <div className="task-list">

                {visibleTasks.length === 0 ? (
                  <div className="empty-column">
                    No tasks
                  </div>
                ) : (
                  visibleTasks.map((task) => (
                    <article
                      className="task-card"
                      key={task.id}
                    >

                      {/* Task title + priority */}
                      <div className="task-top">

                        <h3>
                          {task.title}
                        </h3>

                        <span
                          className={`priority ${task.priority.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>

                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="description">
                          {task.description}
                        </p>
                      )}

                      {/* Task actions */}
                      <div className="task-actions">

                        {/* Move task */}
                        <select
                          value={task.column_id}
                          onChange={(event) =>
                            moveTask(
                              task.id,
                              event.target.value
                            )
                          }
                        >
                          {board.columns.map(
                            (targetColumn) => (
                              <option
                                key={targetColumn.id}
                                value={targetColumn.id}
                              >
                                Move to{" "}
                                {targetColumn.name}
                              </option>
                            )
                          )}
                        </select>

                        {/* Edit */}
                        <button
                          onClick={() =>
                            openEditForm(task)
                          }
                        >
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteTask(task.id)
                          }
                        >
                          Delete
                        </button>

                      </div>
                    </article>
                  ))
                )}

              </div>
            </section>
          );
        })}
      </main>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-backdrop">

          <div className="modal">

            {/* Modal header */}
            <div className="modal-header">

              <h2>
                {editingTask
                  ? "Edit Task"
                  : "Create Task"}
              </h2>

              <button
                type="button"
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            {/* Modal error */}
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Title */}
              <label>
                Title *

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  autoFocus
                />
              </label>

              {/* Description */}
              <label>
                Description

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                  rows="4"
                />
              </label>

              {/* Priority */}
              <label>
                Priority

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>
                </select>
              </label>

              {/* Column */}
              {!editingTask && (
                <label>
                  Column

                  <select
                    name="column_id"
                    value={formData.column_id}
                    onChange={handleInputChange}
                  >
                    {board.columns.map(
                      (column) => (
                        <option
                          key={column.id}
                          value={column.id}
                        >
                          {column.name}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}

              {/* Form buttons */}
              <div className="form-actions">

                <button
                  type="button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;