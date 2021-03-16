const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userAccount = users.find((user) => user.username === username);

  if (!userAccount) {
    return response.status(404).json({ error: "User not found." });
  }

  request.username = userAccount;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.json(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  };
  username.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request;

  const indexTodo = username.todos.findIndex((todo) => todo.id === id);

  if (indexTodo === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const updatedTodo = {
    ...username.todos[indexTodo],
    title,
    deadline: new Date(deadline),
  };
  username.todos[indexTodo] = updatedTodo;

  return response.json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const indexTodo = username.todos.findIndex((todo) => todo.id === id);

  if (indexTodo === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const updatedTodo = {
    ...username.todos[indexTodo],
    done: true,
  };
  username.todos[indexTodo] = updatedTodo;

  return response.json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const indexTodo = username.todos.findIndex((todo) => todo.id === id);

  if (indexTodo === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }
  username.todos.splice(indexTodo, 1);

  return response.status(204).send();
});

module.exports = app;
