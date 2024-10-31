import React, { useState } from 'react';

const EmployeeForm = ({ onProfileCreated }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [nationality, setNationality] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [summary, setSummary] = useState('');  // Optional field
    const [profileImage, setProfileImage] = useState('');  // Optional field
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const newEmployee = {
            id,
            name,
            department,
            position,
            nationality,
            email,
            phone,
            summary,  // Send optional summary
            profile_image: profileImage  // Send optional profile image
        };

        fetch('http://localhost:5000/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEmployee),
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to create profile');
                }
            })
            .then((data) => {
                onProfileCreated(data);
                setMessage('Profile created successfully');
                // Clear the form
                setId('');
                setName('');
                setDepartment('');
                setPosition('');
                setNationality('');
                setEmail('');
                setPhone('');
                setSummary('');
                setProfileImage('');
            })
            .catch((err) => {
                setMessage(err.message);
            });
    };

    return (
        <div className="employee-form">
            <h2>Create Employee Profile</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>ID</label>
                    <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Department</label>
                    <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Position</label>
                    <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Nationality</label>
                    <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Profile</button>
            </form>
        </div>
    );
};

export default EmployeeForm;
