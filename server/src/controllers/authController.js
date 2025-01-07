require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const JWT_KEY = process.env.JWT_KEY;

exports.getUserPermissions = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ permissions: user.permissions });
};

exports.registerStaff = async (req, res) => {
  const { fullname, username, password, designation, permissions } = req.body;

  if (!fullname || !username || !password || !designation) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    fullname,
    username,
    password: hashedPassword,
    role: 'Staff',
    designation,
    permissions: {
      view: permissions.view || false,
      upload: permissions.upload || false,
      edit: permissions.edit || false,
      delete: permissions.delete || false,
    },
  });

  await newUser.save();
  res.status(201).json({ message: 'Staff registered successfully' });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_KEY);
  return res.status(200).json({ token, role: user.role, username: user.username });
};