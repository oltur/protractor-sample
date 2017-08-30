var until = require('selenium-webdriver').until;
var url = require('url');

var loginModel = require('../models/login-model.js').getInstance();
var mainPageModel = require('../models/main-page-model.js').getInstance();

var testData = require('../json/test-data.json');

class Helpers {

    constructor(d, o) {
        this.d = d;
        this.o = o;
    }

    getStartPage() {
        let t = this.getAbsoluteUrl(testData.startPage);
        return t;
    }

    getAbsoluteUrl(relativeUrl) {
        let t = url.resolve(testData.baseUrl, relativeUrl);
        return t;
    }

    getHandler(currentSpec, handler) {
        return handler;
    }

    findAndClick(by, root) {
        return this.findAndWaitForVisible(by, root).then(elem => elem.click());
    }

    findAndSendKeys(by, keys, root) {
        return this.findAndWaitForVisible(by, root).then(elem => elem.sendKeys(keys));
    }

    findAndExpectTextContain(by, textContain, root) {
        return this.findAndWaitForVisible(by, root).then(elem => expect(elem.getText()).toContain(textContain));
    }

    findAndWaitForVisible(by, root) {
        return (root ? root : this.d).findElement(by).then(elem => {
            return this.d.wait(until.elementIsVisible(elem)).then(() => Promise.resolve(elem));
        });
    }

    prepareMainPage() {
        let result =
            this.login()
                .then(() => {
                    this.o.log("Verifying ListTitle");
                    return this.findAndExpectTextContain(by.id(mainPageModel.ListTitle), ' Top Offers')
                });
        return result;
    }

    login() {
        this.o.log('Finding iframeForm');
        let result =
            this.d.findElement(by.id(loginModel.iframeForm))
                .then(elem => {
                    this.o.log('Switching to iframeForm');
                    return this.d.switchTo().frame(elem)
                })
                .then(() => {
                    this.o.log("Filling Email");
                    return this.findAndSendKeys(by.id(loginModel.Email), testData.accessData.userName)
                })
                .then((elem) => {
                    this.o.log("Filling PasswordLogin");
                    return this.findAndSendKeys(by.id(loginModel.PasswordLogin), testData.accessData.password);
                })
                .then((elem) => {
                    this.o.log("Clicking SignInButton");
                    return this.findAndClick(by.id(loginModel.SignInButton))
                })
                .then((elem) => {
                    this.o.log("Clicking ContinueButton");
                    return this.findAndClick(by.id(loginModel.ContinueButton));
                })
                .then((elem) => {
                    this.o.log("Switching to default context");
                    return this.d.switchTo().defaultContent();
                })
                .then(() => {
                    this.d.sleep(5000);
                    this.o.log("Clicking StartShoppingBtn");
                    return this.findAndClick(by.className(loginModel.StartShoppingBtn));
                })
        return result;
    }
}

exports.getInstance = (d, o) => new Helpers(d, o);