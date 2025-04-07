import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Test {
    constructor() {
        this.quiz = null;

        this.questionTitleElement = null;
        this.optionsElement = null;
        this.progressBarElement = null;

        this.currentQuestionIndex = 1;

        this.prevButtonElement = null;
        this.nextButtonElement = null;
        this.passButtonElement = null;

        this.testId = null;
        this.userResult = [];

        this.routeParams = UrlManager.getQueryParams();

        sessionStorage.setItem('testId', this.testId);

        this.init();
    }

    async init() {
        if (this.routeParams.id) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id); // Загрузка нужного теста

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.quiz = result;
                    this.startQuiz();
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    startQuiz() {
        console.log(this.quiz);
        // PRE-TITLE
        document.getElementById('pre-title').innerText = this.quiz.name;
        // PROGRESS BAR
        this.progressBarElement = document.getElementById('progress-bar');


        this.questionTitleElement = document.getElementById('title');
        this.optionsElement = document.getElementById('options');

        // BUTTONS ON CLICK
        this.nextButtonElement = document.getElementById('next');
        this.nextButtonElement.onclick = this.move.bind(this, 'next');

        this.passButtonElement = document.getElementById('pass');
        this.passButtonElement.onclick = this.move.bind(this, 'pass');

        this.prevButtonElement = document.getElementById('prev');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev');

        this.prepareProgressBar();

        this.showQuestion();

        // TIMER
        const timerElement = document.getElementById('timer');
        let seconds = 59;
        this.interval = setInterval(function () {
            seconds--;
            timerElement.innerText = seconds;
            if (seconds === 0) {
                clearInterval(this.interval);
                this.complete();
            }
        }.bind(this), 1000);
    }

    prepareProgressBar() {
        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement = document.createElement('div');
            itemElement.className = 'test-progress-bar-item ' + (i === 0 ? 'active' : '');

            const itemCircleElement = document.createElement('div');
            itemCircleElement.className = 'test-progress-bar-item-circle';

            const itemTextElement = document.createElement('div');
            itemTextElement.className = 'test-progress-bar-item-text';
            itemTextElement.innerText = 'Question ' + (i + 1);

            itemElement.appendChild(itemCircleElement);
            itemElement.appendChild(itemTextElement);

            this.progressBarElement.appendChild(itemElement);
        }
    }

    showQuestion() {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        this.questionTitleElement.innerHTML = '<span>Question ' + this.currentQuestionIndex
            + ':</span> ' + activeQuestion.question;

        this.optionsElement.innerHTML = '';

        const that = this;

        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);

        activeQuestion.answers.forEach(answer => {
            const optionElement = document.createElement('div');
            optionElement.className = 'test-question-option';

            // INPUTS
            const inputId = 'answer-' + answer.id;
            const inputElement = document.createElement('input');
            inputElement.className = 'option-answer';
            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'answer');
            inputElement.setAttribute('value', answer.id);

            // SHOW CHOSEN ANSWER AS A DOT WHEN GO BACK TO THE PREV. QUESTION
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked');
            }


            inputElement.onchange = function () {
                that.chosenAnswer();
            }

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', inputId);
            labelElement.innerText = answer.answer;

            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);

            this.optionsElement.appendChild(optionElement);

        });

        if (chosenOption && chosenOption.chosenAnswerId) {
            this.nextButtonElement.removeAttribute('disabled');
        } else {
            this.nextButtonElement.setAttribute('disabled', 'disabled')
        }

        if (this.currentQuestionIndex === this.quiz.questions.length) {
            this.nextButtonElement.innerText = 'Done';

        } else {
            this.nextButtonElement.innerText = 'Next';
        }

        // BUTTON "BACK" DISABLED
        if (this.currentQuestionIndex > 1) {
            this.prevButtonElement.removeAttribute('disabled');
        } else {
            this.prevButtonElement.setAttribute('disabled', 'disabled');
        }
    }

    chosenAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
    }

    move(action) {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];

        // GET ID OF CHOSEN ANSWER
        const chosenAnswer = Array.from(document.getElementsByClassName('option-answer'))
            .find(element => element.checked);

        let chosenAnswerId = null;
        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        // ALREADY ANSWERED THE QUESTION OR NOT (AVOID SAVING IT TWICE OR MORE)
        const existingResult = this.userResult.find(item => item.questionId === activeQuestion.id);
        if (existingResult) {
            existingResult.chosenAnswerId = chosenAnswerId;
        } else {
            // SAVE CHOSEN ID OF AN ANSWER
            this.userResult.push({
                questionId: activeQuestion.id,
                chosenAnswerId: chosenAnswerId
            })
            // SESSION STORAGE
            sessionStorage.setItem('results', JSON.stringify(this.userResult));
        }

        // BUTTONS: GO TO NEXT OR SKIP QUESTION
        if (action === 'next' || action === 'pass') {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval);
            this.complete();
            return;
        }
        // PROGRESS BAR
        Array.from(this.progressBarElement.children).forEach((item, index) => {
            const currentItemIndex = index + 1;
            item.classList.remove('complete');
            item.classList.remove('active');

            if (currentItemIndex === this.currentQuestionIndex) {
                item.classList.add('active');
            } else if (currentItemIndex < this.currentQuestionIndex) {
                item.classList.add('complete');
            }
        })

        this.showQuestion();
    }

    async complete() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '/#';
        }
        try {
            const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/pass', 'POST', {
                userId: userInfo.userId,
                results: this.userResult,
            });

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                // SESSION STORAGE
                sessionStorage.setItem('score', result.score);
                sessionStorage.setItem('total', result.total);

                location.href = '#/result?id=' + this.routeParams.id;
            }
        } catch (e) {
            console.log(e);
        }
    }
}
