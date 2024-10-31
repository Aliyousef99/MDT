import React, { useState, useEffect } from 'react';
import '../styles/Tags.css';

const Tags = ({ setCurrentView, setSelectedProfile }) => {
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]); 
    const [newTagName, setNewTagName] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, tagId: null });
    const [showDeleteModal, setShowDeleteModal] = useState(false); 
    const [tagToDelete, setTagToDelete] = useState(null); 
    const [showEditModal, setShowEditModal] = useState(false); 
    const [tagToEdit, setTagToEdit] = useState(null); 
    const [editTagName, setEditTagName] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/tags')
            .then((res) => res.json())
            .then((data) => setTags(data))
            .catch((err) => console.error('Error fetching tags:', err));
    }, []);

    const handleSelectTag = (tag) => {
        const isSelected = selectedTags.some(t => t.id === tag.id);
        const updatedSelectedTags = isSelected
            ? selectedTags.filter(t => t.id !== tag.id)
            : [...selectedTags, tag];

        setSelectedTags(updatedSelectedTags);
        fetchProfilesForTags(updatedSelectedTags);
    };

    const fetchProfilesForTags = (selectedTags) => {
        const tagIds = selectedTags.map(tag => tag.id);
        if (tagIds.length > 0) {
            fetch(`http://localhost:5000/api/tags/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds }),
            })
                .then((res) => res.json())
                .then((data) => setFilteredProfiles(data))
                .catch((err) => console.error('Error fetching profiles for tags:', err));
        } else {
            setFilteredProfiles([]);
        }
    };

    const handleAddTag = () => {
        if (newTagName.trim()) {
            const newTag = { name: newTagName };
            fetch('http://localhost:5000/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTag),
            })
                .then((res) => res.json())
                .then((createdTag) => {
                    setTags([...tags, createdTag]);
                    setNewTagName('');
                })
                .catch((err) => console.error('Error adding tag:', err));
        }
    };

    const handleDeleteTag = () => {
        if (tagToDelete) {
            fetch(`http://localhost:5000/api/tags/${tagToDelete.id}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete tag');
                }
                setTags(tags.filter(tag => tag.id !== tagToDelete.id));
                setShowDeleteModal(false);
            })
            .catch(error => console.error('Error deleting tag:', error));
        }
    };

    const handleEditTag = () => {
        if (tagToEdit && editTagName.trim()) {
            fetch(`http://localhost:5000/api/tags/${tagToEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editTagName }),
            })
            .then((res) => res.json())
            .then(() => {
                setTags(tags.map(tag => (tag.id === tagToEdit.id ? { ...tag, name: editTagName } : tag)));
                setShowEditModal(false);
            })
            .catch((err) => console.error('Error updating tag:', err));
        }
    };

    const handleContextMenu = (event, tagId) => {
        event.preventDefault();
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            tagId: tagId,
        });
    };

    const handleMenuClick = (action) => {
        const { tagId } = contextMenu;
        switch (action) {
            case 'edit':
                const tagToModify = tags.find(tag => tag.id === tagId);
                setTagToEdit(tagToModify);
                setEditTagName(tagToModify.name);
                setShowEditModal(true);
                break;
            case 'favorite':
                handleFavoriteTag(tagId);
                break;
            case 'delete':
                const tagToRemove = tags.find(tag => tag.id === tagId);
                setTagToDelete(tagToRemove);
                setShowDeleteModal(true);
                break;
            default:
                break;
        }
        setContextMenu({ visible: false, x: 0, y: 0, tagId: null });
    };

    const handleFavoriteTag = (tagId) => {
        const tag = tags.find(tag => tag.id === tagId);
        const updatedTag = { ...tag, favorite: !tag.favorite }; 
        fetch(`http://localhost:5000/api/tags/${tagId}/favorite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorite: updatedTag.favorite }),
        })
        .then((res) => {
            if (res.ok) {
                setTags(tags.map(tag => (tag.id === tagId ? updatedTag : tag)));
            } else {
                console.error('Failed to update favorite status');
            }
        })
        .catch((err) => console.error('Error updating favorite status:', err));
    };

    // Sort and filter the tags based on favorites and alphabetically
    const filteredTags = tags
        .filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())) 
        .sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;  
            if (!a.favorite && b.favorite) return 1;   
            return a.name.localeCompare(b.name);       
        });

    return (
        <div className="tags-container" onClick={() => setContextMenu({ visible: false, x: 0, y: 0, tagId: null })}>
            <h2>Tags</h2>
            <div className="add-tag">
                <input
                    type="text"
                    placeholder="New tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                />
                <button onClick={handleAddTag}>Add Tag</button>
            </div>
            <div className="search-tag">
                <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="selected-tags">
                {selectedTags.map(tag => (
                    <div key={tag.id} className="tag-item selected">
                        {tag.name}
                        <button onClick={() => handleSelectTag(tag)}>x</button>
                    </div>
                ))}
            </div>

            <div className="tags-list">
                {filteredTags
                    .filter(tag => !selectedTags.some(t => t.id === tag.id)) 
                    .map(tag => (
                        <div
                            key={tag.id}
                            className={`tag-item ${tag.favorite ? 'favorite' : ''}`}
                            onContextMenu={(e) => handleContextMenu(e, tag.id)}
                            onClick={() => handleSelectTag(tag)}
                        >
                            {tag.name}
                        </div>
                    ))}
            </div>

            {contextMenu.visible && (
                <ul
                    className="context-menu"
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px`, position: 'absolute' }}
                >
                    <li onClick={() => handleMenuClick('favorite')}>Favorite</li>
                    <li onClick={() => handleMenuClick('edit')}>Edit</li>
                    <li onClick={() => handleMenuClick('delete')}>Delete</li>
                </ul>
            )}

            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="modal-content">
                        <h3>Are you sure you want to delete this tag?</h3>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={handleDeleteTag}>Confirm</button>
                            <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="edit-modal">
                    <div className="modal-content">
                        <h3>Edit Tag Name</h3>
                        <input
                            type="text"
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={handleEditTag}>Edit</button>
                            <button className="cancel-button" onClick={() => setShowEditModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="profile-list">
                {filteredProfiles.length > 0 ? (
                    <ul>
                        {filteredProfiles.map(profile => (
                            <li
                                key={profile.id}
                                className="profile-item"
                                onClick={() => {
                                    setSelectedProfile(profile);
                                    setCurrentView('profiles');
                                }}
                            >
                                {profile.name} (ID: {profile.id})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Select a tag to view associated profiles</p>
                )}
            </div>
        </div>
    );
};

export default Tags;
