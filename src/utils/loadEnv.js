const path = require('path');
const dotenv = require('dotenv');

const loadEnv = () => {
    const envPath = path.resolve(__dirname, '../../.env');
    console.log('Текущий рабочий каталог:', envPath);
    return dotenv.config({ path: envPath });
};

module.exports = {loadEnv}