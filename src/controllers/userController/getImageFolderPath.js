const path = require("path");
const {loadEnv} = require("../../utils/loadEnv");
loadEnv()

// Функция для получения пути к папке с изображениями
const getImageFolderPath = () => {
    // Проверяем наличие переменной окружения RAILWAY_VOLUME_MOUNT_PATH
    const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH;

    if (!volumePath) {
        // Если переменная не установлена, вернем путь по умолчанию или обработаем ошибку
        throw new Error("RAILWAY_VOLUME_MOUNT_PATH is not set.");
    }

    // Возвращаем путь к папке с изображениями
    return path.join(__dirname, volumePath);
};
module.exports = { getImageFolderPath };