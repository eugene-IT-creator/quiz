import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Check {

    constructor() {
        this.quiz = null;
        this.userInfo = null;
        this.questionElement = null;
        this.labelElement = null;
        this.inputElement = null;
        this.testId = null;
        this.backToResult = null;

        this.routeParams = UrlManager.getQueryParams();

        this.init();
    }

    async init() {

        this.userInfo = Auth.getUserInfo();
        if (!this.userInfo) {
            location.href = '#/';
        }
        if (this.routeParams.id) {
            try {
                this.quiz = await CustomHttp
                    .request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + this.userInfo.userId);

                if (this.quiz) {
                    if (this.quiz.error) {
                        throw new Error(this.quiz.error);
                    }
                    document.getElementById('check-questions');
                    this.finishQuiz();
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }
        location.href = '#/';
    }

    finishQuiz() {
        this.whoDidThisTest();
        this.showAllQuestions();
        this.backToResultLink();
    }

    whoDidThisTest() {
        const checkTitle = document.getElementById('check-title');
        const whoDidThisTest = document.createElement('div')
        whoDidThisTest.className = 'whoDidThisTest';

        whoDidThisTest.innerHTML = '<div>Test completed by <span> ' + this.userInfo.fullName + ', ' + this.userInfo.email + '</span> </div>';

        checkTitle.appendChild(whoDidThisTest);
    }

    showAllQuestions() {
        const allQuestions = this.quiz.test.questions;
        const questionsContainer = document.querySelector('.check-questions');

        allQuestions.forEach((question, index) => {
                this.questionElement = document.createElement('div');
                this.questionElement.className = 'check-question';
                questionsContainer.appendChild(this.questionElement);

                const titleElement = document.createElement('div');
                titleElement.className = 'check-question-title';
                titleElement.innerHTML = `<span>Вопрос ${index + 1}:</span> ${question.question}`;

                this.questionElement.appendChild(titleElement);

                question.answers.forEach((answer) => {

                    const checkQuestionAnswersElement = document.createElement('div');
                    checkQuestionAnswersElement.className = 'check-question-option';

                    // INPUTS
                    const inputId = 'answer-' + answer.id;
                    this.inputElement = document.createElement('input');
                    this.inputElement.className = 'option-answer';
                    this.inputElement.setAttribute('id', inputId);
                    this.inputElement.setAttribute('type', 'radio');
                    this.inputElement.setAttribute('name', 'answer');
                    this.inputElement.setAttribute('value', answer.id);
                    this.inputElement.disabled = true;

                    // LABELS
                    this.labelElement = document.createElement('label');
                    this.labelElement.setAttribute('for', inputId);
                    this.labelElement.innerText = answer.answer;

                    if (answer.correct === false) {
                        this.inputElement.classList.add('check-wrong-answer');
                        this.labelElement.style.color = '#DC3333';
                        this.inputElement.style.border = '6px solid #DC3333';
                    } else if (answer.correct === true) {
                        this.inputElement.classList.add('check-write-answer');
                        this.labelElement.style.color = '#5FDC33';
                        this.inputElement.style.border = '6px solid #5FDC33';
                    }
                    checkQuestionAnswersElement.appendChild(this.inputElement);
                    checkQuestionAnswersElement.appendChild(this.labelElement);
                    this.questionElement.appendChild(checkQuestionAnswersElement);
                })
            }
        )
    }

    backToResultLink() {
        this.backToResult = document.getElementById('back-to-result')
        this.backToResult.onclick = () => {
            location.href = '#/result?id=' + this.routeParams.id;
        }
    }
}
 