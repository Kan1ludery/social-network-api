const {v4: uuidv4} = require("uuid");

function generateUId() {
    return uuidv4();
}

module.exports = {generateUId}