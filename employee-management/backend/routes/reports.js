const express = require('express');
const router = express.Router();
const connection = require('../db');

// Fetch all reports
router.get('/reports', (req, res) => {
    connection.query(`
        SELECT r.*, GROUP_CONCAT(t.name) AS tags
        FROM reports r
        LEFT JOIN report_tags rt ON r.id = rt.report_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        GROUP BY r.id
        ORDER BY r.date_created DESC;
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch reports' });
        res.json(results);
    });
});

// Create a new report with tags
router.post('/reports', (req, res) => {
    console.log(req.body);  // Log the incoming request body

    const { title, content, tags } = req.body;
    const query = 'INSERT INTO reports (title, content, date_created) VALUES (?, ?, NOW())';

    connection.query(query, [title, content], (err, results) => {
        if (err) {
            console.error('Failed to create report:', err);
            return res.status(500).json({ error: 'Failed to create report' });
        }

        const reportId = results.insertId;
        if (tags && tags.length > 0) {
            const tagQuery = 'INSERT INTO report_tags (report_id, tag_id) VALUES ?';
            const values = tags.map(tagId => [reportId, tagId]);

            connection.query(tagQuery, [values], (tagErr) => {
                if (tagErr) {
                    console.error('Failed to associate tags:', tagErr);
                    return res.status(500).json({ error: 'Failed to associate tags' });
                }
                res.json({ id: reportId, title, content, tags });
            });
        } else {
            res.json({ id: reportId, title, content, tags: [] });
        }
    });
});

// Add new tags to an existing report
router.put('/reports/:id/tags', (req, res) => {
    const reportId = req.params.id;
    const { tags } = req.body;

    if (!tags || tags.length === 0) {
        return res.status(400).json({ error: 'No tags provided' });
    }

    // First, remove existing tags associated with the report (optional based on your requirement)
    const deleteQuery = 'DELETE FROM report_tags WHERE report_id = ?';
    connection.query(deleteQuery, [reportId], (err) => {
        if (err) {
            console.error('Failed to delete previous tags:', err);
            return res.status(500).json({ error: 'Failed to update tags' });
        }

        // Insert the new tags for the report
        const insertQuery = 'INSERT INTO report_tags (report_id, tag_id) VALUES ?';
        const values = tags.map(tagId => [reportId, tagId]);

        connection.query(insertQuery, [values], (tagErr) => {
            if (tagErr) {
                console.error('Failed to associate new tags:', tagErr);
                return res.status(500).json({ error: 'Failed to associate new tags' });
            }
            res.json({ success: true, message: 'Tags updated successfully' });
        });
    });
});

// Update a report by ID (including content and tags)
router.put('/reports/:id', (req, res) => {
    const { id } = req.params;
    const { content, tags } = req.body;

    const query = 'UPDATE reports SET content = ? WHERE id = ?';
    connection.query(query, [content, id], (err, results) => {
        if (err) {
            console.error('Failed to update report:', err);
            return res.status(500).json({ error: 'Failed to update report' });
        }

        if (tags && tags.length > 0) {
            const deleteQuery = 'DELETE FROM report_tags WHERE report_id = ?';
            const insertQuery = 'INSERT INTO report_tags (report_id, tag_id) VALUES ?';
            const values = tags.map(tagId => [id, tagId]);

            // Delete old tags and insert new ones
            connection.query(deleteQuery, [id], (deleteErr) => {
                if (deleteErr) {
                    console.error('Failed to delete old tags:', deleteErr);
                    return res.status(500).json({ error: 'Failed to delete old tags' });
                }

                connection.query(insertQuery, [values], (insertErr) => {
                    if (insertErr) {
                        console.error('Failed to insert new tags:', insertErr);
                        return res.status(500).json({ error: 'Failed to insert new tags' });
                    }

                    res.json({ id, content, tags });
                });
            });
        } else {
            res.json({ id, content, tags: [] });
        }
    });
});


// Delete a report by ID
router.delete('/reports/:id', (req, res) => {
    const reportId = req.params.id;

    // First, delete the tags associated with the report (if applicable)
    const deleteTagsQuery = 'DELETE FROM report_tags WHERE report_id = ?';
    connection.query(deleteTagsQuery, [reportId], (tagErr) => {
        if (tagErr) {
            console.error('Failed to delete associated tags:', tagErr);
            return res.status(500).json({ error: 'Failed to delete associated tags' });
        }

        // Now delete the report itself
        const deleteReportQuery = 'DELETE FROM reports WHERE id = ?';
        connection.query(deleteReportQuery, [reportId], (err, results) => {
            if (err) {
                console.error('Failed to delete report:', err);
                return res.status(500).json({ error: 'Failed to delete report' });
            }
            res.json({ success: true, message: 'Report deleted successfully' });
        });
    });
});




module.exports = router;
