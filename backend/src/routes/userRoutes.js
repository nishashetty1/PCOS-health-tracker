const express = require('express');
const router = express.Router();
const users = require('../data/users');

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Get a specific user
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json(user);
});

// Add a new user
router.post('/', (req, res) => {
  const { name, email, age, weight, height } = req.body;
  
  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }
  
  // Create new user
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email,
    age: age || null,
    weight: weight || null,  // Added weight property
    height: height || null,  // Added height property
    registeredDate: new Date().toISOString().split('T')[0]
  };
  
  console.log('Creating new user with:', newUser);
  
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update a user
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, age, weight, height } = req.body;
  
  // Find the user
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // If updating email, check it's not already used by another user
  if (email && email !== users[userIndex].email) {
    if (users.some(u => u.email === email && u.id !== userId)) {
      return res.status(409).json({ message: 'Email already in use by another user' });
    }
  }
  
  // Update user properties
  const updatedUser = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    age: age !== undefined ? age : users[userIndex].age,
    weight: weight !== undefined ? weight : users[userIndex].weight,
    height: height !== undefined ? height : users[userIndex].height
  };
  
  console.log('Updating user to:', updatedUser);
  
  // Save updated user
  users[userIndex] = updatedUser;
  
  res.json(updatedUser);
});

module.exports = router;