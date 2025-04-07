const TestModel = require('../models/test.model');
const TestResultModel = require('../models/test-result.model');
const config = require('../config/config');

class TestController {
    static async getTests(req, res) {
        let tests = await TestModel.findAll();
        tests = tests.map(item => ({
            id: item.id,
            name: item.name
        }))
        res.json(tests);
    }

    static async getTest(req, res) {
        const {id} = req.params;
        if (!id) {
            return res.status(400)
                .json({error: true, message: "All parameters should be passed"});
        }

        res.json(await TestModel.findOne(id));
    }

    static async getTestResult(req, res) {
        const {userId} = req.query;
        const {id} = req.params;
        if (!id || !userId) {
            return res.status(400)
                .json({error: true, message: "All parameters should be passed"});
        }

        const testResult = await TestResultModel.find(id, userId);
        if (!testResult) {
            return res.status(404)
                .json({error: true, message: "Not found"});
        }
        res.json(testResult);
    }

    static async getTestResults(req, res) {
        const {userId} = req.query;
        if (!userId) {
            return res.status(400)
                .json({error: true, message: "All parameters should be passed"});
        }

        const testResults = await TestResultModel.findByUserId(userId);
        if (!testResults) {
            return res.status(404)
                .json({error: true, message: "Not found"});
        }
        res.json(testResults);
    }

    static async getTestWithResults(req, res) {
        const {userId} = req.query;
        const {id} = req.params;
        if (!id || !userId) {
            return res.status(400)
                .json({error: true, message: "All parameters should be passed"});
        }

        const test = await TestModel.findOne(id);
        const testResult = await TestResultModel.find(id, userId);
        if (!testResult) {
            return res.status(404)
                .json({error: true, message: "Not found"});
        }
        test.questions.forEach(question => {
            question.answers.forEach(answer => {
                if (testResult.chosen_options.find(option => option === parseInt(answer.id))) {
                    answer.correct = config.rightOptions[parseInt(id)].findIndex(item => item === parseInt(answer.id)) > -1;
                } else if (answer.hasOwnProperty('correct')){
                    delete answer['correct'];
                }
            })
        })

        res.json({test});
    }

    static async passTest(req, res) {
        const {id} = req.params;
        const {userId, results} = req.body;

        if (!id || !userId || !results) {
            return res.status(400)
                .json({error: true, message: "All parameters should be passed"});
        }

        // mocked code without database
        let rightOptions = config.rightOptions[parseInt(id)];

        let score = 0;
        let chosenOptions = [];
        results.forEach(item => {
            const chosenAnswer = parseInt(item['chosenAnswerId']);
            chosenOptions.push(chosenAnswer);
            if (rightOptions.findIndex(option => parseInt(option) === chosenAnswer) > -1) {
                score++;
            }
        });

        const total = rightOptions.length;
        TestResultModel.create({
            user_id: parseInt(userId),
            test_id: parseInt(id),
            score: score,
            total: total,
            chosen_options: chosenOptions
        });

        res.json({score, total});
    }
}

module.exports = TestController;