const express = require("express");
const router = express.Router();
const path = require('path')
const {loadEnv} = require("../../utils/loadEnv");
const {getImageFolderPath} = require("./getImageFolderPath");
loadEnv()
// Указываем абсолютный путь к папке с изображениями
// const imageFolderPath = path.join(__dirname, '../../uploads'); // Это предполагает, что папка 'uploads' находится в директории роутера

router.get('/uploads/:fileName', (req, res) => {
    const imageFolderPath = getImageFolderPath()
    console.log(imageFolderPath)
    const fileName = req.params.fileName;
    const imagePath = path.join(imageFolderPath, fileName); // Путь к изображению
    res.sendFile(imagePath);
});

module.exports = router