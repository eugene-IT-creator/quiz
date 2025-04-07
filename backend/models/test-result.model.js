const TAFFY = require('taffy');
const testResults = TAFFY(require('../data/test-results.json'));

class TestResultModel {
    static async create(data) {
        const testResultsItem = testResults({
            user_id: data.user_id,
            test_id: data.test_id,
        });
        if (testResultsItem.first()) {
            return testResultsItem.update(data);
        } else {
            testResults.insert(data);

            console.log(testResults({user_id: parseInt(data.user_id), test_id: parseInt(data.test_id)}).first());
        }
    }

    static async find(id, userId) {
        return testResults({test_id: parseInt(id), user_id: parseInt(userId)}).first();
    }

    static async findByUserId(userId) {
        const models = testResults({user_id: parseInt(userId)}).get();
        return models.map(item => ({
            score: item.score,
            testId: item.test_id,
            total: item.total,
            userId: item.user_id
        }));
    }
}

module.exports = TestResultModel;