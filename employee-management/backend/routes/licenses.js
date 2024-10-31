// routes/licenses.js
const express = require('express');
const router = express.Router();
const connection = require('../db');

// Get all licenses
router.get('/licenses', (req, res) => {
    const query = 'SELECT * FROM licenses';
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Create a new license and associate it with a profile
router.post('/licenses', (req, res) => {
    const { name, profile_id, expiration_date } = req.body;

    // First, insert the license into the licenses table if it doesn't exist
    const licenseInsertQuery = 'INSERT INTO licenses (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)';
    
    connection.query(licenseInsertQuery, [name], (licenseErr, licenseResults) => {
        if (licenseErr) {
            return res.status(500).json({ error: 'Failed to add license' });
        }
        
        const licenseId = licenseResults.insertId; // Get the ID of the inserted license

        // Now, associate the license with the profile in the profile_licenses table
        const profileLicenseQuery = 'INSERT INTO profile_licenses (profile_id, license_id, expiration_date) VALUES (?, ?, ?)';
        
        connection.query(profileLicenseQuery, [profile_id, licenseId, expiration_date], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to associate license with profile' });
            }
            res.status(201).json({ success: true, message: 'License associated with profile successfully' });
        });
    });
});

// Delete a license
router.delete('/licenses/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM licenses WHERE id = ?';
    
    connection.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.sqlMessage });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'License not found' });
        }
        res.status(204).send(); // No content to send back
    });
});

module.exports = router;
