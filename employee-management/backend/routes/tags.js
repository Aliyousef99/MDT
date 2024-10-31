const express = require('express');
const router = express.Router();
const connection = require('../db');

router.get('/', (req, res) => {
    console.log("GET /tags hit");
    const query = 'SELECT * FROM tags ORDER BY favorite DESC, name ASC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tags:', err.sqlMessage);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Get all tags
router.get('/tags', (req, res) => {
    console.log("GET /tags hit");
    const query = 'SELECT * FROM tags ORDER BY favorite DESC, name ASC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tags:', err.sqlMessage);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});


// Get profiles associated with a specific tag
router.get('/tags/:id/profiles', (req, res) => {
    const { id } = req.params;
    console.log(`Fetching profiles for tag ID: ${id}`);

    const query = `
        SELECT p.id, p.name 
        FROM profiles p
        JOIN profile_tags pt ON p.id = pt.profile_id
        WHERE pt.tag_id = ?
    `;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching profiles for tag:', err.sqlMessage);
            return res.status(500).send(err);
        }

        console.log(`Found profiles: `, results);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No profiles found for this tag' });
        }

        res.json(results);
    });
});

// Get profiles associated with specific tags (multiple tags)
router.get('/tags/profiles', (req, res) => {
    const { ids } = req.query; // Expecting tag IDs as comma-separated values
    const tagIds = ids.split(',');

    const query = `
        SELECT DISTINCT p.id, p.name
        FROM profiles p
        JOIN profile_tags pt ON p.id = pt.profile_id
        WHERE pt.tag_id IN (?)
    `;

    connection.query(query, [tagIds], (err, results) => {
        if (err) {
            console.error('Error fetching profiles for tags:', err.sqlMessage);
            return res.status(500).send(err);
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No profiles found for these tags' });
        }

        res.json(results);
    });
});


// Create a new tag
router.post('/tags', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
    }

    const query = 'INSERT INTO tags (name) VALUES (?)';
    connection.query(query, [name], (err, results) => {
        if (err) {
            console.error('Error creating tag:', err.sqlMessage);
            return res.status(500).json({ error: 'Failed to create tag' });
        }

        res.status(201).json({ id: results.insertId, name, favorite: false });
    });
});

// Get profiles associated with all selected tags
router.post('/tags/profiles', (req, res) => {
    const { tagIds } = req.body; // Expecting an array of tag IDs

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
        return res.status(400).json({ error: 'Tag IDs are required and must be an array' });
    }

    // Query to get profiles that are associated with all the selected tags
    const query = `
        SELECT p.id, p.name
        FROM profiles p
        JOIN profile_tags pt ON p.id = pt.profile_id
        WHERE pt.tag_id IN (?)
        GROUP BY p.id
        HAVING COUNT(DISTINCT pt.tag_id) = ?
    `;

    // The HAVING clause ensures we only get profiles that have all the selected tags
    connection.query(query, [tagIds, tagIds.length], (err, results) => {
        if (err) {
            console.error('Error fetching profiles for tags:', err.sqlMessage);
            return res.status(500).send(err);
        }

        res.json(results);
    });
});

// Update an existing tag (name only)
router.put('/tags/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
    }

    const query = 'UPDATE tags SET name = ? WHERE id = ?';
    connection.query(query, [name, id], (err, results) => {
        if (err) {
            console.error('Error updating tag:', err.sqlMessage);
            return res.status(500).json({ error: 'Failed to update tag' });
        }
        if (results.affectedRows === 0) {
            console.log(`Tag with ID ${id} not found`);
            return res.status(404).json({ error: 'Tag not found' });
        }
        console.log(`Tag with ID ${id} updated successfully`);
        res.status(200).json({ id, name });
    });
});

// Toggle favorite status of a tag
router.post('/tags/:id/favorite', (req, res) => {
    const { id } = req.params;

    const query = 'UPDATE tags SET favorite = NOT favorite WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error toggling favorite status:', err.sqlMessage);
            return res.status(500).json({ error: 'Failed to update favorite status' });
        }
        if (results.affectedRows === 0) {
            console.log(`Tag with ID ${id} not found`);
            return res.status(404).json({ error: 'Tag not found' });
        }
        console.log(`Tag with ID ${id} favorite status toggled`);
        res.status(200).json({ success: true });
    });
});

// Disassociate a tag from a profile (do not delete the tag itself)
router.delete('/employees/:employeeId/tags/:tagId', (req, res) => {
    const { employeeId, tagId } = req.params;

    // This will only remove the association between the profile and the tag
    const query = 'DELETE FROM profile_tags WHERE profile_id = ? AND tag_id = ?';

    connection.query(query, [employeeId, tagId], (err, results) => {
        if (err) {
            console.error('Error removing tag from profile:', err.sqlMessage);
            return res.status(500).json({ error: 'Failed to remove tag from profile' });
        }
        if (results.affectedRows === 0) {
            console.log(`No tag association found for profile ${employeeId} and tag ${tagId}`);
            return res.status(404).json({ error: 'Tag association not found' });
        }
        console.log(`Tag ${tagId} disassociated from profile ${employeeId}`);
        res.status(204).send();
    });
});

router.delete('/tags/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Deleting tag with ID: ${id}`);  // Add this line

    const query = 'DELETE FROM tags WHERE id = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting tag:', err.sqlMessage);
            return res.status(500).json({ error: 'Failed to delete tag' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.status(204).send(); // Send a no-content response
    });
});


module.exports = router;
