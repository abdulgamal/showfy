const forms = require('forms')
const formFunctions = require('../../functions/forms/file');
var settings = require("../../models/settings")

exports.push = async(req,res) => {

    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;
    const cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };

    var reg_form = forms.create({
        enable_pushnotification: fields.string({
            label: "Enable Push Notifications",
            choices: {'1':"Yes",'0':"No"},
            required:true,
            widget: widgets.select({"classes":["select"]}),
            cssClasses: {"field" : ["form-group"],label:['select']},
            value:settings.getSetting(req,"enable_pushnotification","0").toString()
        }),
        desc_label: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to create new api keys.', replace: [{ 0: '<a href="https://onesignal.com/" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        oneSignal_app_id: fields.string({
            label: "OneSignal APP ID",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "oneSignal_app_id", '').toString()
        }),
        oneSignal_restapi_key: fields.string({
            label: "OneSignal REST API Key",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "oneSignal_restapi_key", '').toString()
        }),
        
    });

    reg_form.handle(req, {
        success: function (form) {
            delete form.data.desc_label
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/mobileapps/index',{nav:url,reg_form:reg_form,title: "Manage OneSignal Push Notifications"});
        }
    });

}

exports.token = async(req,res) => {
    
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;
    const cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };

    var reg_form = forms.create({
        
        api_token: fields.string({
            label: "Api Token",
            required: true,
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "api_token", '').toString()
        }),
        api_token_label: fields.string({
            widget: widgets.label({ content: 'Use this token to connect your app to web server.' }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        
    });

    reg_form.handle(req, {
        success: function (form) {
            delete form.data.api_token_label
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/mobileapps/index',{nav:url,reg_form:reg_form,title: "Manage Api Token"});
        }
    });

}