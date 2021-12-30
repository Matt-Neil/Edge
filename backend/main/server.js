require("dotenv").config();
const express = require("express");
const users = require('./routes/users');
const projects = require('./routes/projects');
const auth = require('./routes/auth');
const { checkUser } = require('./middleware/auth');
const port = process.env.PORT || 8000;
const connectDB = require('./db');
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');

connectDB();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get('*', checkUser);
app.post('*', checkUser);
app.put('*', checkUser);
app.delete('*', checkUser);
app.use('/api/users', users);
app.use('/api/projects', projects);
app.use('/api/auth', auth);

app.listen(port, console.log(`Server running on port ${port}.`));