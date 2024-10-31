const express = require('express');
const router = express.Router();
const connection = require('../db');

// Create a new employee profile
router.post('/employees', (req, res) => {
    const { id, name, department, position, nationality, email, phone, summary, profile_image } = req.body;

    if (!id || !name || !email) {
        return res.status(400).json({ error: 'ID, Name, and Email are required' });
    }

    const query = `
        INSERT INTO profiles (id, name, department, position, nationality, email, phone, summary, profile_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [id, name, department, position, nationality, email, phone, summary, profile_image], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err.sqlMessage);
            return res.status(500).json({ error: 'Failed to create profile' });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
    });
});

// Get all employee profiles
router.get('/employees', (req, res) => {
    const query = 'SELECT id, name, department, position, nationality, email, phone, summary, profile_image FROM profiles';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching profiles:', err.sqlMessage);
            return res.status(500).send(err);
        }
        res.json(results.map(profile => ({
            ...profile,
            profileImage: profile.profile_image // Map the database field to the frontend property
        })));
    });
});

// Get a specific employee profile
router.get('/employees/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT p.id, p.name, p.department, p.position, p.nationality, p.email, p.phone, p.summary, p.profile_image,
               GROUP_CONCAT(t.id) AS tag_ids, GROUP_CONCAT(t.name) AS tag_names,
               GROUP_CONCAT(pl.license_name) AS license_names, GROUP_CONCAT(pl.expiration_date) AS license_dates
        FROM profiles p
        LEFT JOIN profile_tags pt ON p.id = pt.profile_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        LEFT JOIN profile_licenses pl ON p.id = pl.profile_id
        WHERE p.id = ?
        GROUP BY p.id
    `;
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching profile:', err.sqlMessage);
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        const profile = results[0];
        res.json({
            ...profile,
            tags: profile.tag_ids ? profile.tag_ids.split(',').map((id, index) => ({
                id: parseInt(id, 10),
                name: profile.tag_names.split(',')[index]
            })) : [],
            licenses: profile.license_names ? profile.license_names.split(',').map((name, index) => ({
                name,
                expirationDate: profile.license_dates.split(',')[index]
            })) : []
        });
    });
});

// Update an employee profile
router.put('/employees/:id', (req, res) => {
    console.log('Received data for update:', req.body);

    const { id } = req.params;
    const { name, department, position, nationality, email, phone, summary, profile_image } = req.body;

    const query = `
        UPDATE profiles
        SET name = ?, department = ?, position = ?, nationality = ?, email = ?, phone = ?, summary = ?, profile_image = ?
        WHERE id = ?
    `;

    console.log('Executing query with values:', [name, department, position, nationality, email, phone, summary, profile_image, id]);

    connection.query(query, [name, department, position, nationality, email, phone, summary, profile_image, id], (err, results) => {
        if (err) {
            console.error('Error updating profile:', err.sqlMessage);
            return res.status(500).send(err);
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        console.log('Profile updated successfully:', results);
        res.status(200).json({ id, ...req.body });
    });
});

// Delete an employee profile
router.delete('/employees/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM profiles WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting profile:', err.sqlMessage);
            return res.status(500).send(err);
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        console.log('Profile deleted successfully:', results);
        res.status(204).send();
    });
});


// In routes/profiles.js

// Update tags for a specific profile
router.post('/employees/:id/tags', (req, res) => {
    const { id } = req.params;
    const { tags } = req.body; // Expecting an array of tag IDs

    if (!tags || !Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array' });
    }

    // First, remove all existing tag associations for the profile
    const deleteQuery = 'DELETE FROM profile_tags WHERE profile_id = ?';
    connection.query(deleteQuery, [id], (deleteErr) => {
        if (deleteErr) {
            console.error('Error removing existing tags:', deleteErr.sqlMessage);
            return res.status(500).json({ error: 'Failed to update tags' });
        }

        // Insert the new tag associations
        if (tags.length > 0) {
            const insertQuery = 'INSERT INTO profile_tags (profile_id, tag_id) VALUES ?';
            const values = tags.map(tagId => [id, tagId]);

            connection.query(insertQuery, [values], (insertErr, results) => {
                if (insertErr) {
                    console.error('Error inserting new tags:', insertErr.sqlMessage);
                    return res.status(500).json({ error: 'Failed to update tags' });
                }
                res.status(200).json({ success: true, message: 'Tags updated successfully' });
            });
        } else {
            // If no tags are left, simply return success
            res.status(200).json({ success: true, message: 'Tags updated successfully' });
        }
    });
});

router.post('/employees', (req, res) => {
    const { id, name, department, position, nationality, email, phone, summary, profile_image } = req.body;

    if (!id || !name || !email) {
        return res.status(400).json({ error: 'ID, Name, and Email are required' });
    }

    const query = `
        INSERT INTO profiles (id, name, department, position, nationality, email, phone, summary, profile_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        id, 
        name, 
        department || null,  // Use null if the field is empty
        position || null, 
        nationality || null, 
        email, 
        phone || null, 
        summary || null,  // Use null if no summary is provided
        profile_image || null  // Use null if no image is provided
    ], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err.sqlMessage);
            return res.status(500).json({ error: 'Failed to create profile' });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
    });
});

router.post('/employees/:id/licenses', (req, res) => {
    const { id } = req.params;
    const { licenses } = req.body;

    console.log('Received licenses:', licenses); // Log received licenses
    console.log('Profile ID:', id); // Log profile ID

    if (!licenses || !Array.isArray(licenses)) {
        return res.status(400).json({ error: 'Licenses must be an array' });
    }

    // First, delete existing licenses for this profile
    const deleteQuery = 'DELETE FROM profile_licenses WHERE profile_id = ?';
    connection.query(deleteQuery, [id], (deleteErr) => {
        if (deleteErr) {
            console.error('Error deleting existing licenses:', deleteErr);
            return res.status(500).json({ error: 'Failed to update licenses' });
        }

        // Then, insert the new licenses
        const insertQuery = 'INSERT INTO profile_licenses (profile_id, license_name, expiration_date) VALUES ?';
        const values = licenses.map(license => [id, license.name, license.expirationDate]);

        connection.query(insertQuery, [values], (insertErr, results) => {
            if (insertErr) {
                console.error('Error inserting new licenses:', insertErr);
                return res.status(500).json({ error: 'Failed to update licenses' });
            }

            console.log('Licenses inserted:', results); // Log the result of the insert operation
            res.status(200).json({ success: true, message: 'Licenses updated successfully' });
        });
    });
});

module.exports = router;
