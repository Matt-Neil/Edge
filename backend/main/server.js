require("dotenv").config();
const express = require("express");
const users = require('./routes/users');
const items = require('./routes/items');
const auth = require('./routes/auth');
const images = require('./routes/images');
const global = require('./routes/global')
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
app.use('/images', express.static('images'));

app.get('*', checkUser);
app.post('*', checkUser);
app.put('*', checkUser);
app.delete('*', checkUser);
app.use('/api/users', users);
app.use('/api/items', items);
app.use('/api/auth', auth);
app.use('/api/images', images);
app.use('/api/global', global)

app.listen(port, console.log(`Server running on port ${port}.`));