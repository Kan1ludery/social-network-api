const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../../utils/authenticateToken");
const connect = require("../dbSafe/db");

router.patch('/updateProfileDescription', authenticateToken, async (req, res) => {
    try {
        const db = await connect();
        const collection = db.collection('users');
        const userId = req.user._id; // Получаем ID из JWT
        let { newDescription } = req.body; // Получаем новое описание из запроса

        // Базовая проверка на максимальное количество символов (например, не более 200 символов)
        const maxCharacters = 200;
        if (newDescription.length > maxCharacters) {
            return res.status(400).json({ error: `Description exceeds maximum character limit of ${maxCharacters}` });
        }

        // Базовая проверка на запрещенные символы (примерно)
        const forbiddenCharacters = /[$^&()+={}[\]"'|\\<>/~`]/g;
        if (forbiddenCharacters.test(newDescription)) {
            const forbiddenChars = [...newDescription.matchAll(forbiddenCharacters)].map(match => match[0]);
            return res.status(400).json({ error: `Description contains forbidden characters: ${forbiddenChars.join(', ')}` });
        }

        const updateQuery = {
            $set: {
                'profile.description': newDescription
            }
        };

        const result = await collection.updateOne(
            { _id: userId },
            updateQuery
        );

        if (result.modifiedCount > 0) {
            res.json({ success: true, newDescription: newDescription });
        } else {
            res.status(404).json({ error: 'Failed to update profile description' });
        }
    } catch (error) {
        console.error('Error updating profile description', error);
        res.status(500).json({ error: 'Error updating profile description' });
    }
});

module.exports = router;
