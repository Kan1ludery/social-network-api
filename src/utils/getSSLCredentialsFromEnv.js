const {loadEnv} = require("./loadEnv");
loadEnv()

const getSSLCredentialsFromEnv = () => {
    const privateKey = process.env.PRIVATE_KEY; // Приватный ключ
    const certificate = process.env.CERTIFICATE; // Основной сертификат


    return {
        key: privateKey,
        cert: certificate,
    };
};


module.exports = {getSSLCredentialsFromEnv};