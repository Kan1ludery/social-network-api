require('dotenv').config(); // Загружаем переменные окружения из .env файла

const getSSLCredentialsFromEnv = () => {
    const privateKey = process.env.PRIVATE_KEY; // Приватный ключ
    const certificate = process.env.CERTIFICATE; // Основной сертификат
    const chain = process.env.CHAIN_CERTIFICATE; // Цепочка сертификатов (цепь доверия)

    return {
        key: privateKey,
        cert: certificate,
        ca: chain, // Добавляем цепочку сертификатов к возвращаемому объекту
    };
};


module.exports = {getSSLCredentialsFromEnv};