import React, { useState, useEffect } from 'react';
import '../styles/EmployeeProfiles.css';
import EmployeeForm from './EmployeeForm';

const EmployeeProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [showTagPopup, setShowTagPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState(null);

    // Fetch all profiles and tags on component mount
    useEffect(() => {
        fetchProfiles();
        fetchTags();
    }, []);

    const fetchProfiles = () => {
        fetch('http://localhost:5000/api/employees')
            .then((res) => res.json())
            .then((data) => setProfiles(data))
            .catch((err) => console.error('Error fetching profiles:', err));
    };

    const fetchTags = () => {
        fetch('http://localhost:5000/api/tags')
            .then((res) => res.json())
            .then((data) => setAvailableTags(data))
            .catch((err) => console.error('Error fetching tags:', err));
    };

    // Fetch a specific profile by its ID when it's selected
// Only fetching the profile details when selectedProfile.id is set (and avoiding re-fetching on state updates)
useEffect(() => {
    if (selectedProfile && selectedProfile.id) {
        fetchProfileDetails(selectedProfile.id);
    }
}, [selectedProfile?.id]);

const fetchProfileDetails = (profileId) => {
    fetch(`http://localhost:5000/api/employees/${profileId}`)
        .then(response => response.json())
        .then(data => {
            setSelectedProfile({
                ...data,
                tags: data.tags || [],
                profileImage: data.profileImage || "",
            });
        })
        .catch(error => console.error('Error fetching profile:', error));
};

    // Handle saving a profile
    const handleSave = () => {
        if (!selectedProfile) return;

        const { id, name, department, position, nationality, email, phone, summary, profileImage } = selectedProfile;

        fetch(`http://localhost:5000/api/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, department, position, nationality, email, phone, summary, profile_image: profileImage }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to update profile');
                return res.json();
            })
            .then(() => handleTagUpdate(id))
            .then(() => {
                // Update the profiles state on the frontend
                setProfiles((prevProfiles) =>
                    prevProfiles.map((profile) => (profile.id === id ? { ...profile, tags: selectedProfile.tags } : profile))
                );
            })
            .catch((error) => console.error('Error updating profile and tags:', error));
    };

    // Handle tag update
    const handleTagUpdate = (id) => {
        return fetch(`http://localhost:5000/api/employees/${id}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags: selectedProfile.tags.map((tag) => tag.id) }),
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to update profile tags');
            return res.json();
        });
    };

    // Handle delete profile
    const handleDeleteProfile = (profile) => {
        setProfileToDelete(profile);
        setShowDeletePopup(true);
    };

    const confirmDeleteProfile = () => {
        if (profileToDelete) {
            fetch(`http://localhost:5000/api/employees/${profileToDelete.id}`, {
                method: 'DELETE',
            })
                .then((res) => {
                    if (res.ok) {
                        setProfiles(profiles.filter((p) => p.id !== profileToDelete.id));
                        setShowDeletePopup(false);
                    } else {
                        console.error('Failed to delete profile');
                    }
                })
                .catch((err) => console.error('Error deleting profile:', err));
        }
    };

    const cancelDelete = () => {
        setProfileToDelete(null);
        setShowDeletePopup(false);
    };

    // Handle clicking on a profile to fetch its details
    const handleProfileClick = (profileId) => {
        fetch(`http://localhost:5000/api/employees/${profileId}`)
            .then((res) => res.json())
            .then((data) => {
                setSelectedProfile({
                    ...data,
                    tags: data.tags || [],
                    profileImage: data.profileImage || '',
                });
            })
            .catch((error) => console.error('Error fetching profile:', error));
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    };

    // Handle image change
    const handleImageChange = (e) => {
        const newProfileImage = e.target.value;
        setSelectedProfile((prevProfile) => ({ ...prevProfile, profileImage: newProfileImage }));
    };

    // Handle tag click
    const handleTagClick = (tag) => {
        const updatedTags = selectedProfile.tags.some((t) => t.id === tag.id)
            ? selectedProfile.tags.filter((t) => t.id !== tag.id)
            : [...selectedProfile.tags, { id: tag.id, name: tag.name }];

        setSelectedProfile((prevProfile) => ({ ...prevProfile, tags: updatedTags }));

        fetch(`http://localhost:5000/api/employees/${selectedProfile.id}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags: updatedTags.map((t) => t.id) }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to update profile tags');
                return res.json();
            })
            .catch((error) => console.error('Error updating profile tags:', error));
    };

    // Handle tag removal
    const handleRemoveTag = (tag) => {
        setSelectedProfile((prevProfile) => ({
            ...prevProfile,
            tags: prevProfile.tags.filter((t) => t.id !== tag.id),
        }));

        fetch(`http://localhost:5000/api/employees/${selectedProfile.id}/tags/${tag.id}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to remove tag from profile');
                return res.json();
            })
            .catch((error) => console.error('Error removing tag from profile:', error));
    };

    // Filter profiles based on the search term
    const filteredProfiles = Array.isArray(profiles)
        ? profiles.filter((profile) => profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || profile.id.toString().includes(searchTerm))
        : [];


return (
        <div className="profiles-container">
            <div className="header-buttons-container">
                <button 
                    className="toggle-form-btn" 
                    onClick={() => setShowForm(!showForm)}
                >
                    +
                </button>
                <button 
                    className="save-btn" 
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>
            <div className="employee-list">
                <h2>Profiles</h2>
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <ul>
                    {filteredProfiles.map((profile) => (
                        <li key={profile.id} className="profile-item">
                            <div className="profile-info" onClick={() => handleProfileClick(profile.id)}>
                                <span className="employee-name">{profile.name}</span>
                                <span className="employee-id">ID: {profile.id}</span>
                            </div>
                            <button 
                                className="delete-btn" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProfile(profile);
                                }}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>

                {showDeletePopup && (
                    <div className="delete-popup">
                        <div className="popup-header">
                            <h2>Confirm Delete</h2>
                            <button className="close-popup-btn" onClick={cancelDelete}>x</button>
                        </div>
                        <div className="popup-content">
                            <p>Are you sure you want to delete the profile of {profileToDelete.name}?</p>
                            <button className="confirm-btn" onClick={confirmDeleteProfile}>Confirm</button>
                            <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
            <div className="employee-details">
                {selectedProfile ? (
                    <>
                        <div className="profile-header">
                            <div className="profile-image-section">
                                <img 
                                    src={selectedProfile.profileImage} 
                                    alt="Profile" 
                                    className="profile-image" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/150";
                                    }}
                                />
                                <input
                                    type="text"
                                    value={selectedProfile.profileImage}
                                    onChange={handleImageChange}
                                    placeholder="Paste image URL here"
                                    className="image-url-input"
                                />
                            </div>
                            <div className="profile-info">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={selectedProfile.name}
                                    onChange={handleInputChange}
                                    className="editable-field"
                                />
                                <label>Department:</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={selectedProfile.department}
                                    onChange={handleInputChange}
                                    className="editable-field"
                                />
                                <label>Position:</label>
                                <input
                                    type="text"
                                    name="position"
                                    value={selectedProfile.position}
                                    onChange={handleInputChange}
                                    className="editable-field"
                                />
                                <label>Nationality:</label>
                                <input
                                    type="text"
                                    name="nationality"
                                    value={selectedProfile.nationality}
                                    onChange={handleInputChange}
                                    className="editable-field"
                                />
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={selectedProfile.email}
                                    onChange={handleInputChange}
                                    className="editable-field"
                                />
                                <label>Phone:</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={selectedProfile.phone}
                                    onChange={handleInputChange}
                                    className="editable-field"
                                />
                            </div>
                        </div>
                        <div className="profile-summary-section">
                            <h3>Summary</h3>
                            <div className="summary-margin">
                                <div className="summary-padding">
                                    <textarea
                                        value={selectedProfile.summary}
                                        name="summary"
                                        onChange={handleInputChange}
                                        className="summary-box"
                                        rows="6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="profile-tags-section">
                            <h3>Tags</h3>
                            <button 
                                className="add-tag-btn"
                                onClick={() => setShowTagPopup(true)}
                            >
                                +
                            </button>
                            <div className="profile-tags">
                                {selectedProfile.tags.map(tag => (
                                    <div key={tag.id} className="tag-item">
                                        {tag.name}
                                        <button
                                            className="remove-tag-btn"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Select a profile to see details</p>
                )}
            </div>
            {showForm && (
                <div className="form-container open">
                    <button 
                        className="close-form-btn" 
                        onClick={() => setShowForm(false)}
                    >
                        x
                    </button>
                    <EmployeeForm onProfileCreated={(newProfile) => {
                        setProfiles([...profiles, newProfile]);
                        setShowForm(false);
                    }} />
                </div>
            )}

            {showTagPopup && (
                <div className="tag-popup">
                    <div className="tag-popup-header">
                        <h2>Select Tags</h2>
                        <button 
                            className="close-popup-btn"
                            onClick={() => setShowTagPopup(false)}
                        >
                            x
                        </button>
                    </div>
                    <div className="tag-popup-content">
                        {availableTags.map(tag => (
                            <div
                                key={tag.id}
                                className={`tag-item ${selectedProfile.tags.some(t => t.id === tag.id) ? 'selected' : ''}`}
                                onClick={() => handleTagClick(tag)}
                            >
                                {tag.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};

export default EmployeeProfiles;
