import React from 'react';

const UserProfile = ({ user }) => {
    return (
        <div className="user-profile">
            <h2>{user.username}</h2>
            <p>Email: {user.email}</p>
            <p>Bio: {user.bio}</p>
        </div>
    );
};

export default UserProfile;
