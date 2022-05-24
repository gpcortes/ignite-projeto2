const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { request } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
    const {
        username
    } = request.headers;

    const {
        id
    } = request.params;

    const user = (username) ? users.find(user => user.username === username) : users.find(user => user.id === id)

    if (!user) {
        return response.status(404).json({
            message: "User not found"
        })
    };

    request.user = user;

    return next();
}

function checkExistsTodo(request, response, next) {
    const { id } = request.params;

    const todo = request.user.todos.find(todo => todo.id === id);

    if (!todo) {
        return response.status(404).json({
            error: "Todo not found"
        })
    };

    request.todo = todo;

    return next();
};

app.get("/users", (request, response) => {
    return response.json(users);
});

app.post("/users", (request, response) => {
    const {
        name,
        username
    } = request.body;

    const userAlereadyExists = users.some(
        (user) => user.username === username
    )

    if (userAlereadyExists) {
        return response.status(400).json({
            error: "Username already exists"
        })
    }

    const id = uuidv4();

    const user = {
        id: id,
        name: name,
        username: username,
        todos: []
    };

    users.push(user);

    return response.status(201).json(user);
});

app.put("/user/:id", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    const { name, username } = request.body;

    user.name = name;
    user.username = username;

    return response.json(user);
});

app.delete("/user/:id", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    users.splice(users.indexOf(user), 1);

    return response.status(204).send();
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    const {
        title,
        deadline
    } = request.body;

    const id = uuidv4();

    todo = {
        id: id,
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    };

    user.todos.push(todo);

    return response.status(201).json(todo);
});

app.put("/todos/:id", checkExistsUserAccount, checkExistsTodo, (request, response) => {
    const { todo } = request;

    const {
        title,
        deadline
    } = request.body;

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checkExistsUserAccount, checkExistsTodo, (request, response) => {
    const { todo } = request;

    todo.done = !todo.done;

    return response.status(201).json(todo);
});

app.delete("/todos/:id", checkExistsUserAccount, checkExistsTodo, (request, response) => {
    const { todo } = request;

    const { user } = request;

    user.todos.splice(user.todos.indexOf(todo), 1);

    return response.status(204).send();
});

module.exports = app;