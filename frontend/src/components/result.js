import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Result {

    constructor() {
        this.checkResultLink = null;
        this.quiz = null;
        this.userResult = [];
        this.routeParams = UrlManager.getQueryParams();

        this.init();

        this.checkResult();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        if (this.routeParams.id) {
            try {
                const result = await CustomHttp
                    .request(config.host + '/tests/' + this.routeParams.id + '/result?userId=' + userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    document.getElementById('result-score').innerText = result.score + '/' + result.total;
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }
        location.href = '#/';
    }

    async checkResult() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        if (this.routeParams.id) {
            try {
                const result = await CustomHttp
                    .request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + userInfo.userId);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.checkResultLink = document.getElementById('check-result');
                    this.checkResultLink.onclick = () => {
                        location.href = '#/check-result?id=' + this.routeParams.id;
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}
