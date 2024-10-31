const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const profilesRoute = require('./routes/profiles');
const licensesRoute = require('./routes/licenses');
const tagsRoute = require('./routes/tags');
const announcementsRoute = require('./routes/announcements');
const reportsRoute = require('./routes/reports');  // Import reports route

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '******',  // Ensure you replace this with your actual MySQL password
    database: 'mdt'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL as id', connection.threadId);
});

const app = express();

// Enable CORS (make sure only one instance is used)
app.use(cors({
    origin: 'http://localhost:3000',  // Allow your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow necessary methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow headers
}));

// Middleware for parsing request bodies
app.use(bodyParser.json());

// Middleware to attach the MySQL connection to each request
app.use((req, res, next) => {
    req.connection = connection;
    next();
});

// Routes
app.use(bodyParser.json());  // Middleware to parse JSON bodies

// Routes must come after body parser
app.use('/api', profilesRoute);
app.use('/api', licensesRoute);
app.use('/api', tagsRoute);
app.use('/api', announcementsRoute);
app.use('/api', reportsRoute);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
