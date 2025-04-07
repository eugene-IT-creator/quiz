const express = require('express');
const cors = require('cors');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes); // Авторизационные роуты
app.use("/api/tests", testRoutes); // Чтобы получать, добавлять, редактировать тесты

app.listen('3000', () =>
    console.log(`Server started`)
)