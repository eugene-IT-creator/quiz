const TAFFY = require('taffy');
const tests = TAFFY(require('../data/tests.json')); // TAFFY генерирует внутреннюю базу данных во время работы приложения

class TestModel {
    static async findAll() {
        return tests().get();
    }

    static async findOne(id) {
        return tests({id: parseInt(id)}).first();
    }
}

module.exports = TestModel;