
import { useEffect, useState } from "react";
import API from "./services/api";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const response = await API.get("/tasks");
      setTasks(response.data.tasks);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load tasks."
      );
    }
  };

  useEffect(() => {
    if (user && localStorage.getItem("token")) {
      fetchTasks();
    }
  }, [user]);

  // Registration and Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isLogin) {
        const response = await API.post("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setUser(response.data.user);
        setMessage(response.data.message);
      } else {
        const response = await API.post("/auth/register", {
          name,
          email,
          password,
        });

        setMessage(response.data.message);
        setIsLogin(true);
        setName("");
        setPassword("");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // Add or Update Task
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!taskTitle.trim()) {
      setMessage("Please enter a task title.");
      return;
    }

    try {
      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, {
          title: taskTitle,
          description: taskDescription,
        });

        setMessage("Task updated successfully");
      } else {
        await API.post("/tasks", {
          title: taskTitle,
          description: taskDescription,
        });

        setMessage("Task created successfully");
      }

      setTaskTitle("");
      setTaskDescription("");
      setEditingTask(null);
      await fetchTasks();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to save task."
      );
    }
  };

  // Mark Task as Completed or Pending
  const toggleTask = async (task) => {
    try {
      await API.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      await fetchTasks();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to update task."
      );
    }
  };

  // Edit Task
  const editTask = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setMessage("");
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setMessage("Task deleted successfully");
      await fetchTasks();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete task."
      );
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setTasks([]);
    setTaskTitle("");
    setTaskDescription("");
    setEditingTask(null);
    setEmail("");
    setPassword("");
    setMessage("You have logged out successfully.");
  };

  // Login and Registration Screen
  if (!user) {
    return (
      <div className="app">
        <div className="todo-container">
          <h1>{isLogin ? "Login" : "Create Account"}</h1>

          <p className="subtitle">
            {isLogin
              ? "Login to manage your tasks."
              : "Register to get started."}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}

          <p className="switch-text">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              className="switch-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Task Management Screen
  return (
    <div className="app">
      <div className="todo-container task-container">
        <div className="header">
          <div>
            <h1>My To-Do List</h1>
            <p className="subtitle">Welcome, {user.name}!</p>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <form onSubmit={handleTaskSubmit} className="task-form">
          <input
            type="text"
            placeholder="Enter task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Enter task description (optional)"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows="3"
          />

          <button type="submit">
            {editingTask ? "Update Task" : "Add Task"}
          </button>

          {editingTask && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setEditingTask(null);
                setTaskTitle("");
                setTaskDescription("");
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>

        {message && <p className="message">{message}</p>}

        <div className="task-list">
          {tasks.length === 0 ? (
            <p className="empty-message">
              No tasks yet. Add your first task!
            </p>
          ) : (
            tasks.map((task) => (
              <div className="task-item" key={task._id}>
                <div className="task-details">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                  />

                  <div>
                    <span className={task.completed ? "completed" : ""}>
                      {task.title}
                    </span>

                    {task.description && (
                      <p className="task-description">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    className="edit-button"
                    onClick={() => editTask(task)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteTask(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="task-count">
          Total Tasks: {tasks.length} | Completed:{" "}
          {tasks.filter((task) => task.completed).length}
        </p>
      </div>
    </div>
  );
}

export default App;
