// Импортируем модуль для выполнения HTTP-запросов (Axios)
const axios = require('axios');

// Функция для получения данных из API и вывода нужного поля
async function fetchData() {
    try {
        const response = await axios.get('http://localhost:3000/api/users'); // URL
        const data = response.data;

        // Перебираем каждый объект в массиве и выводим поле "name"
        data.forEach(obj => {
            const name = obj.name;
            console.log(name);
        });
    } catch (error) {
        console.error('Произошла ошибка при получении данных из API:', error);
    }
}

// Вызываем функцию для получения и обработки данных
fetchData();
