// app.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB Atlas connection string
const atlasURI = 'mongodb+srv://user1:howlone0@cluster0.ooburim.mongodb.net/';

// Database connection
mongoose.connect(atlasURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define Schema
const projectSchema = new mongoose.Schema({
  department: String,
  projectName: String,
  projectDetails: String,
  status: String,
  facultyName: String,
  email: String,
  contact: String,
  cabin: String
});

const Project = mongoose.model('Project', projectSchema);

// Route to handle project listings
app.post('/teachlist', async (req, res) => {
  try {
    const projects = req.body;
    await Project.insertMany(projects);
    res.status(201).json({ message: 'Projects added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve files from the 'mjz' directory
app.use(express.static('mjz'));

// Route to serve the 'home.html' file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mjz', 'list.html'));
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
