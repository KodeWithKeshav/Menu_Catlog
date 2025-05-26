const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const cors = require("cors");
const moment = require('moment');
const app = express();
app.use(express.json());
app.use(cors());
// Middleware setup
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// MongoDB connection
mongoose
  .connect('mongodb+srv://menu:catlog@menu.ypplluk.mongodb.net/Menu', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});
const MenuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  canteen: {
    type: String,
    enum: ['IT', 'MBA', 'Main']
  },
  isAvailable: { type: Boolean, default: false },
  isSpecialToday: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);
const MenuItem =  mongoose.model('MenuItem', MenuItemSchema);
function authenticate(req, res, next) {
  const { userName, userEmail } = req.cookies;
  if (!userName || !userEmail) return res.redirect('/');
  next();
}
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/homepage', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'homepage.html'));
});
app.get('/adduser', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'Accessories', 'registeruser.html'));
});
app.get('/additem', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'additem.html'));
});
app.get('/menucontrol', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'menucontrol.html'));
});
app.get('/viewmenu', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'menuview.html'));
});
// User login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.redirect('/?error=Username does not exist. Please try again.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.cookie('userName', user.name, { maxAge: 3600000, path: '/' });
      res.cookie('userEmail', user.email, { maxAge: 3600000, path: '/' });
      res.redirect('/homepage');
    } else {
      res.redirect('/?error=Incorrect password. Please try again.');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.redirect('/?error=Internal Server Error. Please try again later.');
  }
});
app.post('/register-user', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      email
    });

    await newUser.save();
    res.status(201).send('User registered successfully!');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Failed to register user');
  }
});

const quotes = [
  { content: "Love is our true essence. This love should be awakened in every person.", author: "Sri Mata Amritanandamayi Devi" },
  { content: "Compassion is the language the deaf can hear and the blind can see.", author: "Sri Mata Amritanandamayi Devi" },
  { content: "The first step in spiritual life is to have the darshan of your own true self.", author: "Sri Mata Amritanandamayi Devi" },
  { content: "In this universe, everything has a purpose. The invisible intelligence behind everything is what we call God.", author: "Sri Mata Amritanandamayi Devi" },
  { content: "Happiness depends on how we react to external circumstances.", author: "Sri Mata Amritanandamayi Devi" }
];

app.get('/api/quote', (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  res.json(quotes[randomIndex]);
});
// Get menu for a canteen
app.get('/menu/:canteen', async (req, res) => {
  const menu = await MenuItem.find({ canteen: req.params.canteen, isAvailable: true });
  res.json(menu);
});

// Get all items for admin with filter
app.get('/admin/:canteen', async (req, res) => {
  const menu = await MenuItem.find({ canteen: req.params.canteen });
  res.json(menu);
});

// Toggle item availability
app.post('/toggle', async (req, res) => {
  const { id, isAvailable, isSpecialToday } = req.body;
  await MenuItem.findByIdAndUpdate(id, { isAvailable, isSpecialToday });
  res.json({ success: true });
});

// Add a new item
app.post('/add', async (req, res) => {
  const { name, price, canteen } = req.body;
  const item = new MenuItem({ name, price, canteen });
  await item.save();
  res.json({ success: true });
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));