const express = require('express');
const router = express.Router();
const connection = require('../db');

// Fetch all announcements
router.get('/announcements', (req, res) => {
    connection.query('SELECT * FROM announcements ORDER BY date_created DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch announcements' });
        }
        res.json(results);
    });
});

// Create a new announcement
router.post('/announcements', (req, res) => {
    const { title, summary, content } = req.body;
    const query = 'INSERT INTO announcements (title, summary, content, date_created) VALUES (?, ?, ?, NOW())';
    connection.query(query, [title, summary, content], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to create announcement' });
        }
        // Return the newly created announcement with its id
        res.json({ id: results.insertId, title, summary, content, date_created: new Date() });
    });
});

router.put('/announcements/:id', (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const query = 'UPDATE announcements SET content = ? WHERE id = ?';
    connection.query(query, [content, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update announcement' });
        }
        res.json({ id, content, date_created: new Date() });
    });
});


// Delete an announcement by id
router.delete('/announcements/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM announcements WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete announcement' });
        }
        res.json({ message: 'Announcement deleted successfully' });
    });
});

module.exports = router;
