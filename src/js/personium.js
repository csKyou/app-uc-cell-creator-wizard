/**
 * Personium
 * Copyright 2016 FUJITSU LIMITED
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * Replace the "***" with a valid Personium domain name
 */
var deployedDomainName = "demo.personium.io";

/*
 * Replace the "***" with a valid cell name where this service is running.
 */
var deployedCellName = "dixonsiu";


/* 
 * Set up necessary URLs for this service.
 * Current setup procedures only support creating a cell within the same Personium server.
 */
var jqueryValidateMessage_ja = "https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.17.0/localization/messages_ja.js";
var rootUrl = ["https://", deployedDomainName, "/"].join("");
var targetRootUrl = rootUrl;
var serviceCellUrl = [rootUrl, deployedCellName, "/"].join("");
var createCellApiUrl = [serviceCellUrl, "__/unitService/user_cell_create"].join("");
var defaultProfileUrl = [serviceCellUrl, "__/defaultProfile.json"].join("");
var HomeApplication = {
    cellUrl: "https://demo.personium.io/HomeApplication/",
    disabledList: ["App"],
    barfilePath: function() {
        return this.cellUrl + '__/HomeApplication.bar';
    },
    targetBoxPath: function() {
        return targetRootUrl + $("#cell_name").val() + '/io_personium_demo_HomeApplication/';
    },
    loginUrl: function() {
        return targetRootUrl + $("#cell_name").val() + '/io_personium_demo_HomeApplication/src/login.html';
    },
    enableInstall: function() {
        return !(_.contains(this.disabledList, $("#cell_type").val()));
    },
    installHomeApplicationBox: function(token) {
        var oReq = new XMLHttpRequest(); // binary
        oReq.open("GET", this.barfilePath());
        oReq.responseType = "arraybuffer";
        oReq.setRequestHeader("Content-Type", "application/zip");
        oReq.onload = function(e) {
            var arrayBuffer = oReq.response;
            var view = new Uint8Array(arrayBuffer);
            var blob = new Blob([view], {"type":"application/zip"});
            $.ajax({
                type: "MKCOL",
                url: HomeApplication.targetBoxPath(),
                data: blob,
                processData: false,
                headers: {
                    'Authorization':'Bearer ' + token, // createCellAPI's token
                    'Content-type':'application/zip'
                }
            }).done(function(data) {
                // domesomething
            }).fail(function(data) {
                var res = JSON.parse(data.responseText);
                alert("An error has occurred.\n" + res.message.value);
            });
        }
        oReq.send();
    }
};

$(document).ready(function(){
    i18next
        .use(i18nextXHRBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: 'en',
            debug: true,
            backend: {
                // load from i18next-gitbook repo
                loadPath: './locales/{{lng}}/translation.json',
                crossDomain: true
            }
        }, function(err, t) {
            initJqueryI18next();
            
            // define your own additionalCallback for each App/screen
            if ((typeof additionalCallback !== "undefined") && $.isFunction(additionalCallback)) {
                additionalCallback();
            }

            updateContent();

            // Special routine for reshowing the rendered contents (originally hidden bare HTML)
            $('#loading_spinner').hide();
            $('#wizardProfile').css('visibility', 'visible');
        });
});

initJqueryI18next = function() {
    // for options see
    // https://github.com/i18next/jquery-i18next#initialize-the-plugin
    jqueryI18next.init(i18next, $, {
        useOptionsAttr: true
    });
};

updateContent = function() {
    // start localizing, details:
    // https://github.com/i18next/jquery-i18next#usage-of-selector-function
    $('[data-i18n]').localize();

    /*
     * Activate the tooltips after i18next has translated the title attributes
     */
    $('[rel="tooltip"]').tooltip();
};

changeLanaguage = function(lang) {
    i18next.changeLanguage(lang, function() {
        setMessagesLanguage(lang);
        updateContent();
    });
}

configureJQueryValidation = function() {
    createExtraRules();

    setMessagesLanguage(i18next.language);

    configureTarget();
};

createExtraRules = function() {
    $.validator.addMethod("cellName", function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,127}$/.test(value);
    }, i18next.t("wizard_pane.cell_info.cell_name.spec"));
    $.validator.addMethod("adminName", function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9][a-zA-Z0-9-_!$*=^`{|}~.@]{0,127}$/.test(value);
    }, i18next.t("wizard_pane.account.admin_name.spec"));
    $.validator.addMethod("adminPassword", function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9-_]{0,}$/.test(value);
    }, i18next.t("wizard_pane.account.password.spec"));
};

setMessagesLanguage = function(lang) {
    switch(lang) {
    case "ja":
    case "ja-JP":
        setMessagesLanguage_ja();
        break;
    default:
        restoreDefaultValidatorMessages();
    }
};

setMessagesLanguage_ja = function() {
    /*
     * Translated default messages for the jQuery validation plugin.
     * Locale: JA (Japanese; 日本語)
     */
    $.extend(
        $.validator.messages,
        {
            required: "このフィールドは必須です。",
            remote: "このフィールドを修正してください。",
            email: "有効なEメールアドレスを入力してください。",
            url: "有効なURLを入力してください。",
            date: "有効な日付を入力してください。",
            dateISO: "有効な日付（ISO）を入力してください。",
            number: "有効な数字を入力してください。",
            digits: "数字のみを入力してください。",
            creditcard: "有効なクレジットカード番号を入力してください。",
            equalTo: "同じ値をもう一度入力してください。",
            extension: "有効な拡張子を含む値を入力してください。",
            maxlength: $.validator.format( "{0} 文字以内で入力してください。" ),
            minlength: $.validator.format( "{0} 文字以上で入力してください。" ),
            rangelength: $.validator.format( "{0} 文字から {1} 文字までの値を入力してください。" ),
            range: $.validator.format( "{0} から {1} までの値を入力してください。" ),
            step: $.validator.format( "{0} の倍数を入力してください。" ),
            max: $.validator.format( "{0} 以下の値を入力してください。" ),
            min: $.validator.format( "{0} 以上の値を入力してください。" )
        }
    );
};

restoreDefaultValidatorMessages = function() {
    $.extend(
        $.validator.messages,
        {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            equalTo: "Please enter the same value again.",
            maxlength: $.validator.format( "Please enter no more than {0} characters." ),
            minlength: $.validator.format( "Please enter at least {0} characters." ),
            rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
            range: $.validator.format( "Please enter a value between {0} and {1}." ),
            max: $.validator.format( "Please enter a value less than or equal to {0}." ),
            min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
            step: $.validator.format( "Please enter a multiple of {0}." ),
            cellName: i18next.t("wizard_pane.cell_info.cell_name.spec"),
            adminName: i18next.t("wizard_pane.account.admin_name.spec"),
            adminPassword: i18next.t("wizard_pane.account.password.spec")
        }
    );
};

configureTarget = function() {
    $validator = $('.wizard-card form').validate({
        rules: {
            cell_name: {
                required: true,
                cellName: true,
                rangelength: [1, 128]
            },
            firstname: {
              required: true,
              minlength: 3
            },
            lastname: {
              required: true,
              minlength: 3
            },
            email: {
              required: true,
              minlength: 3,
            }
        }
    });
};