const express = require('express');
const cors = require('cors');
const app = express();
const tagsRoute = require('.emplyee-management/backend/routes/tags');
const reportsRoute = require('.employee-management/backend/routes/reports');
const announcementsRoute = require('employee-management/backend/routes/announcements.js');

// Initialize sample data (optional, replace with a database if needed)
const employeeProfiles = [];
const employees = [];
const tasks = [];

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());

// Mount external routes
app.use('/api/tags', tagsRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/announcements', announcementsRoute); // Mount announcements route

// Dashboard overview route
app.get('/api/dashboard', (req, res) => {
    const overview = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'Active').length,
        pendingTasks: tasks.filter(t => t.status === 'Pending').length,
    };
    res.json(overview);
});

// Employee routes
app.get('/api/employees', (req, res) => {
    res.json(employeeProfiles);
});

app.get('/api/employees/:id', (req, res) => {
    const employee = employeeProfiles.find(emp => emp.id === parseInt(req.params.id));
    if (employee) {
        res.json(employee);
    } else {
        res.status(404).json({ message: 'Employee not found' });
    }
});

app.post('/api/employees', (req, res) => {
    const { name, department, position, status, contact } = req.body;

    if (!name || !department || !position || !status || !contact) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const newEmployee = {
        id: employeeProfiles.length + 1,
        name,
        department,
        position,
        status,
        contact
    };

    employeeProfiles.push(newEmployee);
    res.status(201).json(newEmployee);
});

// 404 handler for unmatched routes
app.use((req, res) => {
    console.log('URL not found:', req.originalUrl);
    res.status(404).send('Endpoint not found');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
