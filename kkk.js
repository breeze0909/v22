const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bcrypt =require('bcrypt');
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
  cabin: String,
  stu_app: { type: Boolean, default: false },
  teach_app: { type: Boolean, default: false },
 // Flag to indicate student application
});

const userschema = new mongoose.Schema({
email : String,
password: String


});
const Project = mongoose.model('Project', projectSchema);
const User = mongoose.model('User' , userschema);
const Teach = mongoose.model('Teach' , userschema);
// Route to handle search for project listings
app.get('/searcho', async (req, res) => {
  try {
    const projects = await Project.find({ stu_app: true });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
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
// Route to handle searching for projects based on selected department
app.get('/search', async (req, res) => {
  const department = req.query.department; // Extract department from query parameters
  
  try {
    // Find projects based on the selected department
    const projects = await Project.find({ department: department });
    
    // Send the projects as a JSON response
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import necessary modules and define your app

// Route to handle project approval
app.post('/approve/:projectId', async (req, res) => {
    const projectId = req.params.projectId;

    try {
        // Find the project by ID and update the teach_app flag to true
        const project = await Project.findByIdAndUpdate(projectId, { teach_app: true }, { new: true });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Send a success response
        res.json({ message: 'Project approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Assuming you are using Express.js for your server

// Route to handle fetching notifications for projects with both stu_app and teach_app as true
app.get('/notifications', async (req, res) => {
    try {
        // Find projects where both stu_app and teach_app are true
        const projects = await Project.find({ stu_app: true, teach_app: true });

        // Send the projects as a JSON response
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to handle student application
app.post('/apply', async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    project.stu_app = true; // Set student application flag to true
    await project.save();
    res.json({ message: 'Student applied successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { email, password, type } = req.body;

    if (type === 'student') {
      // Check if user with email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        email,
        password: hashedPassword
      });

      await newUser.save();
      return res.status(201).json({ message: 'User registered successfully', redirectUrl: '/stu.html' });
    } else if (type === 'teacher') {
      // Check if user with email already exists
      const existingTeacher = await Teach.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new teacher
      const newTeacher = new Teach({
        email,
        password: hashedPassword
      });

      await newTeacher.save();
      return res.status(201).json({ message: 'Teacher registered successfully', redirectUrl: '/teach.html' });
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email exists in the User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If the email exists in the User collection, verify the password
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      if (isPasswordValid) {
        // Password is correct, redirect to the student dashboard
        return res.status(200).json({ message: 'Login successful', redirectUrl: '/stu.html' });
      } else {
        // Password is incorrect
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }

    // Check if the email exists in the Teach collection
    const existingTeacher = await Teach.findOne({ email });
    if (existingTeacher) {
      // If the email exists in the Teach collection, verify the password
      const isPasswordValid = await bcrypt.compare(password, existingTeacher.password);
      if (isPasswordValid) {
        // Password is correct, redirect to the teacher dashboard
        return res.status(200).json({ message: 'Login successful', redirectUrl: '/teach.html' });
      } else {
        // Password is incorrect
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }

    // If the email doesn't exist in either collection, return error
    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


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

// Ser
// Serve files from the 'mjz' directory
app.use(express.static('mjz'));

// Route to serve the 'home.html' file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mjz', 'home.html'));
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
