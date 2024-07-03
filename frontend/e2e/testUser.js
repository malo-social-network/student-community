const fs = require('fs');
const path = require('path');

function getTestUser() {
    const data = fs.readFileSync(path.join(__dirname, 'testUser.json'), 'utf8');
    return JSON.parse(data);
}

module.exports = { getTestUser };
