import { useEffect, useState } from 'react'
import './App.css'

const columnNames = ['To Do', 'In Progress', 'Done']

const columnIds = {
  'To Do': 4,
  'In Progress': 5,
  Done: 6,
}

function App() {
  const [columns, setColumns] = useState([])
  const [priority, setPriority] = useState('All')

  const [newTask, setNewTask] = useState('')
  const [newTaskPriority, setNewTaskPriority] =
    useState('medium')

  const [editingTask, setEditingTask] =
    useState(null)

  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] =
    useState('medium')

  const [error, setError] = useState('')

  /* =========================
     LOAD TASKS
  ========================= */

  const loadTasks = async () => {
    try {
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/tasks'
      )

      if (!response.ok) {
        throw new Error(
          'Unable to load tasks from the server.'
        )
      }

      const tasks = await response.json()

      const formattedColumns =
        columnNames.map((name, index) => ({
          id: index + 1,
          title: name,

          tasks: tasks
            .filter(
              (task) =>
                task.column_name === name
            )
            .map((task) => ({
              id: task.id,
              title: task.title,
              description:
                task.description || '',

              priority:
                task.priority
                  .charAt(0)
                  .toUpperCase() +
                task.priority.slice(1),

              created_at:
                task.created_at,
            })),
        }))

      setColumns(formattedColumns)
    } catch (error) {
      console.error(
        'Failed to load tasks:',
        error
      )

      setError(
        'Unable to load tasks. Please make sure the backend server is running.'
      )
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  /* =========================
     ADD TASK
  ========================= */

  const addTask = async () => {
    if (!newTask.trim()) {
      setError(
        'Task title is required.'
      )
      return
    }

    try {
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/tasks',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            title: newTask.trim(),
            description: '',
            priority: newTaskPriority,
            column_id: 4,
          }),
        }
      )

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => ({})
          )

        throw new Error(
          data.error ||
            'Failed to create task.'
        )
      }

      setNewTask('')
      setNewTaskPriority('medium')

      await loadTasks()
    } catch (error) {
      console.error(
        'Failed to add task:',
        error
      )

      setError(
        error.message ||
          'Unable to create task. Please try again.'
      )
    }
  }

  /* =========================
     MOVE TASK
  ========================= */

  const moveTask = async (
    taskId,
    columnName
  ) => {
    try {
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/tasks/' +
          taskId,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            column_id:
              columnIds[columnName],
          }),
        }
      )

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => ({})
          )

        throw new Error(
          data.error ||
            'Failed to move task.'
        )
      }

      await loadTasks()
    } catch (error) {
      console.error(
        'Failed to move task:',
        error
      )

      setError(
        error.message ||
          'Unable to move task. Please try again.'
      )
    }
  }

  /* =========================
     DELETE TASK
  ========================= */

  const deleteTask = async (taskId) => {
    try {
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/tasks/' +
          taskId,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => ({})
          )

        throw new Error(
          data.error ||
            'Failed to delete task.'
        )
      }

      await loadTasks()
    } catch (error) {
      console.error(
        'Failed to delete task:',
        error
      )

      setError(
        error.message ||
          'Unable to delete task. Please try again.'
      )
    }
  }

  /* =========================
     START EDIT
  ========================= */

  const startEdit = (task) => {
    setEditingTask(task)
    setEditTitle(task.title)

    setEditPriority(
      task.priority.toLowerCase()
    )

    setError('')
  }

  /* =========================
     CANCEL EDIT
  ========================= */

  const cancelEdit = () => {
    setEditingTask(null)
    setEditTitle('')
    setEditPriority('medium')
  }

  /* =========================
     SAVE EDIT
  ========================= */

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      setError(
        'Task title is required.'
      )
      return
    }

    try {
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/tasks/' +
          editingTask.id,
        {
          method: 'PATCH',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            title: editTitle.trim(),
            description:
              editingTask.description ||
              '',
            priority: editPriority,
          }),
        }
      )

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => ({})
          )

        throw new Error(
          data.error ||
            'Failed to update task.'
        )
      }

      cancelEdit()

      await loadTasks()
    } catch (error) {
      console.error(
        'Failed to edit task:',
        error
      )

      setError(
        error.message ||
          'Unable to update task. Please try again.'
      )
    }
  }

  /* =========================
     CLOSE ERROR
  ========================= */

  const closeError = () => {
    setError('')
  }

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">

        <div>
          <h1>TaskFlow</h1>

          <p>
            Manage your tasks with ease
          </p>
        </div>

        <div className="controls">

          {/* PRIORITY FILTER */}

          <select
            value={priority}
            onChange={(e) =>
              setPriority(
                e.target.value
              )
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

          {/* NEW TASK */}

          <input
            type="text"
            placeholder="New task..."
            value={newTask}
            onChange={(e) =>
              setNewTask(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTask()
              }
            }}
          />

          {/* NEW TASK PRIORITY */}

          <select
            value={newTaskPriority}
            onChange={(e) =>
              setNewTaskPriority(
                e.target.value
              )
            }
          >
            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </select>

          <button onClick={addTask}>
            + Add Task
          </button>

        </div>

      </header>

      {/* =========================
          ERROR MESSAGE
      ========================= */}

      {error && (
        <div className="error-message">

          <span>{error}</span>

          <button
            onClick={closeError}
            aria-label="Close error"
          >
            ×
          </button>

        </div>
      )}

      {/* =========================
          BOARD
      ========================= */}

      <main className="board">

        {columns.map((column) => {

          const filteredTasks =
            column.tasks.filter(
              (task) =>
                priority === 'All' ||
                task.priority ===
                  priority
            )

          return (
            <section
              className="column"
              key={column.id}
            >

              <div className="column-header">

                <h2>
                  {column.title}
                </h2>

                <span>
                  {filteredTasks.length}
                </span>

              </div>

              <div className="tasks">

                {filteredTasks.map(
                  (task) => (

                    <article
                      className="task-card"
                      key={task.id}
                    >

                      <div className="task-top">

                        <h3>
                          {task.title}
                        </h3>

                        <div className="task-buttons">

                          {/* EDIT */}

                          <button
                            className="edit-btn"
                            onClick={() =>
                              startEdit(task)
                            }
                            title="Edit task"
                          >
                            ✎
                          </button>

                          {/* DELETE */}

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteTask(
                                task.id
                              )
                            }
                            title="Delete task"
                          >
                            ×
                          </button>

                        </div>

                      </div>

                      {/* PRIORITY */}

                      <span
                        className={
                          'priority ' +
                          task.priority.toLowerCase()
                        }
                      >
                        {task.priority}
                      </span>

                      {/* START TASK */}

                      {column.title ===
                        'To Do' && (

                        <button
                          className="task-action"
                          onClick={() =>
                            moveTask(
                              task.id,
                              'In Progress'
                            )
                          }
                        >
                          Start Task
                        </button>

                      )}

                      {/* COMPLETE TASK */}

                      {column.title ===
                        'In Progress' && (

                        <button
                          className="task-action"
                          onClick={() =>
                            moveTask(
                              task.id,
                              'Done'
                            )
                          }
                        >
                          Complete Task
                        </button>

                      )}

                    </article>

                  )
                )}

                {filteredTasks.length ===
                  0 && (

                  <p className="empty">
                    No tasks
                  </p>

                )}

              </div>

            </section>
          )
        })}

      </main>

      {/* =========================
          EDIT MODAL
      ========================= */}

      {editingTask && (

        <div className="modal-overlay">

          <div className="edit-modal">

            <div className="modal-header">

              <h2>
                Edit Task
              </h2>

              <button
                className="modal-close"
                onClick={cancelEdit}
              >
                ×
              </button>

            </div>

            {/* TITLE */}

            <label>
              Task Title
            </label>

            <input
              className="edit-input"
              type="text"
              value={editTitle}
              onChange={(e) =>
                setEditTitle(
                  e.target.value
                )
              }
            />

            {/* PRIORITY */}

            <label>
              Priority
            </label>

            <select
              className="edit-input"
              value={editPriority}
              onChange={(e) =>
                setEditPriority(
                  e.target.value
                )
              }
            >

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>

            </select>

            {/* BUTTONS */}

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={saveEdit}
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default App