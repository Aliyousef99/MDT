import React, { useState, useEffect } from 'react';
import '../styles/Announcements.css';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]); // Initialize the announcements state
    const [isCreating, setIsCreating] = useState(false); // For showing the creation modal
    const [newAnnouncementTitle, setNewAnnouncementTitle] = useState(''); // For the announcement title
    const [newAnnouncementContent, setNewAnnouncementContent] = useState(''); // For the announcement content
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // For displaying and editing selected announcement
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // For delete confirmation popout

    // Fetch all announcements on component mount
    useEffect(() => {
        fetch('http://localhost:5000/api/announcements') // Replace with dynamic API URL if needed
            .then(res => res.json())
            .then(data => setAnnouncements(data))
            .catch(err => console.error('Error fetching announcements:', err));
    }, []);

    // Open modal for creating a new announcement
    const openCreateModal = () => {
        setIsCreating(true);
    };

    // Close the modal
    const closeCreateModal = () => {
        setIsCreating(false);
        setNewAnnouncementTitle('');
        setNewAnnouncementContent('');
    };

    // Handle creating a new announcement
    const handleCreateAnnouncement = () => {
        const newAnnouncement = {
            title: newAnnouncementTitle,
            content: newAnnouncementContent,
        };

        // Send a POST request to create a new announcement
        fetch('http://localhost:5000/api/announcements', { // Use the correct API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newAnnouncement), // Dynamic payload from form inputs
        })
        .then(res => res.json())
        .then(data => {
            // Update the announcements state with the new announcement
            setAnnouncements([data, ...announcements]);
            closeCreateModal(); // Close the modal after submission
        })
        .catch(err => console.error('Error creating announcement:', err));
    };

    // Handle clicking on an announcement to view details
    const handleAnnouncementClick = (announcement) => {
        setSelectedAnnouncement(announcement); // Set the clicked announcement as selected
    };

    // Handle saving the edited announcement content
    const handleSaveAnnouncement = () => {
        if (selectedAnnouncement) {
            // Send a PUT request to update the announcement content
            fetch(`http://localhost:5000/api/announcements/${selectedAnnouncement.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedAnnouncement), // Send the updated announcement data
            })
            .then(res => res.json())
            .then(data => {
                // Update the announcements list with the updated announcement
                const updatedAnnouncements = announcements.map(announcement =>
                    announcement.id === data.id ? data : announcement
                );
                setAnnouncements(updatedAnnouncements);
            })
            .catch(err => console.error('Error saving announcement:', err));
        }
    };

    // Handle delete confirmation popout
    const handleDeleteClick = () => {
        setIsConfirmingDelete(true); // Show the confirmation popout
    };

    // Handle the actual deletion of the announcement
    const handleConfirmDelete = () => {
        if (selectedAnnouncement) {
            // Send a DELETE request to remove the announcement
            fetch(`http://localhost:5000/api/announcements/${selectedAnnouncement.id}`, {
                method: 'DELETE',
            })
            .then(() => {
                // Remove the deleted announcement from the list
                const updatedAnnouncements = announcements.filter(
                    announcement => announcement.id !== selectedAnnouncement.id
                );
                setAnnouncements(updatedAnnouncements);
                setSelectedAnnouncement(null); // Return to the list view after deletion
                setIsConfirmingDelete(false); // Close the confirmation popout
            })
            .catch(err => console.error('Error deleting announcement:', err));
        }
    };

    // Handle going back to the list of announcements and refreshing the page
    const handleBackClick = () => {
        setSelectedAnnouncement(null); // Reset selected announcement to show the list
        window.location.reload(); // Refresh the page
    };

    return (
        <div className="announcements-container">
            {/* Display announcement details if one is selected */}
            {selectedAnnouncement ? (
                <div className="announcement-details">
                    <button className="back-button" onClick={handleBackClick}>
                        ← Back
                    </button>
                    <div className="announcement-content">
                        <h3>{selectedAnnouncement.title}</h3>
                        <p className="announcement-date">
                            {new Date(selectedAnnouncement.date_created).toLocaleString('en-US', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZoneName: 'short',
                            })}
                        </p>
                        <textarea
                            className="announcement-textbox"
                            value={selectedAnnouncement.content}
                            onChange={(e) =>
                                setSelectedAnnouncement({
                                    ...selectedAnnouncement,
                                    content: e.target.value,
                                })
                            } // Enable editing of the announcement content
                        />
                        <div className="button-container">
                            <button className="save-button" onClick={handleSaveAnnouncement}>
                                Save
                            </button>
                            <button className="delete-button" onClick={handleDeleteClick}>
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Confirmation popout for deletion */}
                    {isConfirmingDelete && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Are you sure you want to delete this announcement?</h3>
                                <div className="delete-buttons">
                                    <button className="confirm-delete" onClick={handleConfirmDelete}>
                                        Confirm
                                    </button>
                                    <button className="cancel-delete" onClick={() => setIsConfirmingDelete(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Button to open the create modal */}
                    <button onClick={openCreateModal} className="create-announcement-btn">
                        + Create Announcement
                    </button>

                    {/* Modal for creating a new announcement */}
                    {isCreating && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Create New Announcement</h3>
                                <input
                                    type="text"
                                    placeholder="Enter Announcement Title"
                                    value={newAnnouncementTitle}
                                    onChange={(e) => setNewAnnouncementTitle(e.target.value)} // Dynamic title input
                                    className="announcement-input"
                                />
                                <textarea
                                    placeholder="Enter Announcement Content"
                                    value={newAnnouncementContent}
                                    onChange={(e) => setNewAnnouncementContent(e.target.value)} // Dynamic content input
                                    className="announcement-textarea"
                                />
                                <div className="create-buttons">
                                    <button onClick={handleCreateAnnouncement} className="create-button">
                                        Submit
                                    </button>
                                    <button onClick={closeCreateModal} className="cancel-button">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Display list of announcements */}
                    <div className="announcements-list">
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="announcement-card"
                                    onClick={() => handleAnnouncementClick(announcement)} // Handle click to show details
                                >
                                    <h3>{announcement.title}</h3>
                                    <p className="announcement-summary">{announcement.summary}</p>
                                    <p className="announcement-date">
                                        {new Date(announcement.date_created).toLocaleString('en-US', {
                                            weekday: 'short',
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            timeZoneName: 'short',
                                        })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No announcements available.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Announcements;
