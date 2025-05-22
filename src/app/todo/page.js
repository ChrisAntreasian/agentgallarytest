"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [completedTodos, setCompletedTodos] = useState([]);

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([...todos, newTodo]);
      setNewTodo("");
    }
  };

  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
    setCompletedTodos(completedTodos.filter((_, i) => i !== index));
  };

  const toggleComplete = (index) => {
    if (completedTodos.includes(index)) {
      setCompletedTodos(completedTodos.filter((i) => i !== index));
    } else {
      setCompletedTodos([...completedTodos, index]);
    }
  };

  return (
    <div className={styles.container}>
      <h1>To-Do List</h1>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul className={styles.todoList}>
        {todos.map((todo, index) => (
          <li
            key={index}
            className={`${styles.todoItem} ${
              completedTodos.includes(index) ? styles.completed : ""
            }`}
          >
            {todo}
            <button onClick={() => toggleComplete(index)}>Complete</button>
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}