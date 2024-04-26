var forms = require('forms')
const fs = require('fs');
const download = require('image-downloader');
const s3Upload = require('../../functions/upload').uploadtoS3
var formFunctions = require('../../functions/forms/file');
var commonFunctions = require('../../functions/commonFunctions');
var settings = require("../../models/settings")
var globalModel = require("../../models/globalModel")
const fileManager = require("../../models/fileManager");
const levels = require("../../models/levels")
const permission = require("../../models/levelPermissions")
const avtarsModel = require("../../models/avtars")


exports.newsletter = async (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
//get uploaded file by admin
    const files = { "": "" }

    await fileManager.findAll(req, { "column": "path", "like": "image" }).then(result => {
        result.forEach(res => {
            let url = res.path.split(/(\\|\/)/g).pop()
            files[res.path] = res.orgName
        });
    })
    var reg_form = forms.create({
        
        enable_newsletter: fields.string({
            choices: { 1: 'Yes', 2: 'No'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Enable Newsletter Functionality",
            fieldsetClasses:"form_fieldset",
            required: true,
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"enable_newsletter",1)
        }),


        newsletterlabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to create Mailchimp API key.', replace: [{ 0: '<a href="https://login.mailchimp.com/signup/" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        mailchimp_apikey: fields.string({
            widget: widgets.text({"classes":["form-control"]}),
            label:"Mailchimp API Key",
            cssClasses: cssClasses,
            value:req.loguserallowed ? "****" : settings.getSetting(req,"mailchimp_apikey",'')
        }),
        mailchimp_listId: fields.string({
            widget: widgets.text({"classes":["form-control"]}),
            label:"Mailchimp List ID",
            cssClasses: cssClasses,
            value:req.loguserallowed ? "****" : settings.getSetting(req,"mailchimp_listId",'')
        }),
        newsletter_background_image: fields.string({
            label: "Newsletter Background Image",
            choices: files,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"newsletter_background_image")
        }),
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            delete form.data['newsletterlabel']
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Settings"});
        }
    });
}
exports.settings = (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };

    var reg_form = forms.create({
        maintanance: fields.string({
            choices: { 0: 'Online', 1: 'Offline'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Site Mode",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"maintanance",0)
        }),
        
        maintanance_code: fields.string({ 
            label : "Password" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"maintanance_code",'we3r')
        }),
        man_words_label: fields.string({ 
            widget: widgets.label({content : 'Copy the password before putting site in offline mode.' }),
            cssClasses:{"field" : ["form-group","form-description"]},
        }),
        site_title: fields.string({
            widget: widgets.text({"classes":["form-control"]}),
            label:"Website Title",
            cssClasses: cssClasses,
            value:settings.getSetting(req,"site_title",' My Community')
        }),

        censored_words: fields.string({ 
            label : "Censored Words" ,
            cssClasses:cssClasses,
            widget: widgets.textarea({"classes":["form-control"]}),
            value:settings.getSetting(req,"censored_words","")
        }),
        censored_words_label: fields.string({ 
                widget: widgets.label({content : 'Separate words by commas.' }),
                cssClasses:{"field" : ["form-group","form-description"]},
        }),
        restrict_ips: fields.string({ 
            label : "Ban User with IP" ,
            cssClasses:cssClasses,
            widget: widgets.textarea({"classes":["form-control"]}),
            value:settings.getSetting(req,"restrict_ips","")
        }),
        restrict_ips_label: fields.string({ 
                widget: widgets.label({content : 'Separate IPs by commas.' }),
                cssClasses:{"field" : ["form-group","form-description"]},
        }),
        google_translateapi_key: fields.string({
            label: "Google Language Translate API key.",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: req.loguserallowed ? "****" :  settings.getSetting(req, "google_translateapi_key", '')

        }),
        googleAPIlabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to create Google Translate API key.', replace: [{ 0: '<a href="https://neliosoftware.com/blog/how-to-generate-an-api-key-for-google-translate/" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        image_upload_limit: fields.string({
            label: "Maximum Upload Limit of Image. Enter value in MB (Enter 0 for unlimited.)",
            validators: [validators.integer('Enter integer value only.')],
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "image_upload_limit", '50')
        }),
        site_cdn_url: fields.string({
            label : "Site CDN URL for internal files like css/js",
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value: settings.getSetting(req,"site_cdn_url","")
        }),
        site_images_cdn_url: fields.string({ 
            label : "Site Images CDN URL for external storage",
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value: settings.getSetting(req,"site_images_cdn_url","")
        }),
        site_videos_cdn_url: fields.string({ 
            label : "Site Videos CDN URL for external storage",
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value: settings.getSetting(req,"site_videos_cdn_url","")
        }),
        cdbUrllabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to create CDN Account.', replace: [{ 0: '<a href="https://bunny.net/?ref=z4bwy3mmc4" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        tinymceKey: fields.string({ 
            label : "TinyMce Editor API key" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"tinymceKey","")
        }),
        tinymcelabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to create new TinyMce Editor API key.', replace: [{ 0: '<a href="https://www.tiny.cloud/auth/signup/" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        google_analytics_code: fields.string({ 
            label : "Google Analytics Code" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"google_analytics_code","")
        }),
        google_analytics_code_label: fields.string({ 
            widget: formFunctions.makeClickable({content : '[0] to create Google Analytics Profile ID.',replace: [{ 0: '<a href="https://analytics.google.com/analytics/web/" target="_blank">Click here</a>' }]}),
            cssClasses:{"field" : ["form-group","form-description"]},
        }),
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            delete form.data["maintanance_label"]
            delete form.data["maintanance_code_label"]
            delete form.data["site_title_label"]
            delete form.data["site_description_label"]
            delete form.data["site_keywords_label"]
            delete form.data["site_cdn_url_label"]
            delete form.data["google_analytics_code_label"]
            delete form.data['censored_words_label']
            delete form.data['tinymcelabel']
            delete form.data['restrict_ips_label']
            delete form.data['googleAPIlabel']

            if(!form.data.maintanance_code){
                form.data.maintanance_code = Math.random().toString(36).slice(-5);
            }
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Settings"});
        }
    });
}

exports.emails = async (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
     
    const files = {"":""}

    await fileManager.findAll(req,{"column":"path","like":"image"}).then(result => {
        result.forEach(res => {
            let url = res.path.split(/(\\|\/)/g).pop()
            files[res.path] = res.orgName
        });
    })

    var reg_form = forms.create({
        contact_email_from: fields.string({
            label:"Contact Form Email",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"contact_email_from",'')
        }),
        
        contact_from_name: fields.string({ 
            label : "From Name" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_from_name",'Site Admin')
        }),
       
        contact_from_address: fields.string({ 
            label : "From Address" ,
            cssClasses:cssClasses,
            widget: widgets.email({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_from_address","admin@site.com")
        }),
        
        welcome_email: fields.string({
            choices: { '1':"Enabled",'0': 'Disabled'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Want to send welcome email to new signup users?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"welcome_email",'0')
        }),
        admin_signup_email: fields.string({
            choices: { '1':"Enabled",'0': 'Disabled'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Notify Admin by email when user signs up?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"admin_signup_email",'0')
        }),
        email_logo: fields.string({
            label: "Select Logo to send in all Emails",
            choices: files,
            required:false,
            widget: widgets.select({"classes":["select"]}),
            cssClasses: {"field" : ["form-group"],label:['select']},
            value:settings.getSetting(req,"email_logo","").toString()
        }),
        email_type: fields.string({
            choices: { 'smtp':"SMTP",'gmail': 'Gmail','gmailxauth2':"Gmail Auth2",'sendgrid':"SendGrid"},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Email Types?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"email_type",'gmail')
        }),
       

        gmail_xauth_email: fields.string({ 
            label : "Email Address" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"gmail_xauth_email","")
        }),
        gmail_xauth_clientid: fields.string({ 
            label : "Client ID" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"gmail_xauth_clientid","")
        }),
        gmail_xauth_clientsecret: fields.string({ 
            label : "Client Secret" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"gmail_xauth_clientsecret","")
        }),
        gmail_xauth_refreshtoken: fields.string({ 
            label : "Refresh Token" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"gmail_xauth_refreshtoken","")
        }),
        
        // sendgrid_username: fields.string({ 
        //     label : "SendGrid Username" ,
        //     cssClasses:cssClasses,
        //     widget: widgets.text({"classes":["form-control"]}),
        //     value:req.loguserallowed ? "****" : settings.getSetting(req,"sendgrid_username","")
        // }),
        sendgrid_password: fields.string({ 
            label : "SendGrid Api Key" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"sendgrid_password",'')
        }),

        email_smtp_host: fields.string({ 
            label : "SMTP Host" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"email_smtp_host","127.0.0.1")
        }),
        email_smtp_port: fields.string({ 
            label : "SMTP Port" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"email_smtp_port",'25')
        }),
        
        email_smtp_username: fields.string({ 
            label : "SMTP Username" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"email_smtp_username","")
        }),
        email_smtp_password: fields.string({ 
            label : "SMTP Password" ,
            cssClasses:cssClasses,
            widget: widgets.password({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"email_smtp_password","")
        }),
        email_smtp_type: fields.string({
            choices: { '0':"No",'1': 'Yes'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Use Secure Connection?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"email_smtp_type","1")
        }),
    },{validatePastFirstError:true});
    
    reg_form.handle(req, {
        success: function (form) {
            delete form.data["contact_email_from_label"]
            delete form.data["contact_from_name_label"]
            delete form.data["contact_from_address_label"]
            delete form.data["email_smtp_port_label"]
            delete form.data['gmailxauth2_label']

            if(!form.data.maintanance_code){
                form.data.maintanance_code = Math.random().toString(36).slice(-5);
            }
            if(!form.data['email_smtp_password'])
                delete form.data['email_smtp_password']
                
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Email Settings"});
        }
    });
}

exports.login = async (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');

    var fields = forms.fields;
    var widgets = forms.widgets;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };

    const files = { "": "" }

    await fileManager.findAll(req, { "column": "path", "like": "p8" }).then(result => {
        result.forEach(res => {
            let url = res.path.split(/(\\|\/)/g).pop()
            files[res.path] = res.orgName
        });
    })

    var reg_form = forms.create({
        social_login_fb: fields.string({
            choices: { 1: 'Enabled', 0: 'Disabled'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Facebook Login",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"social_login_fb","0")
        }),
        facebooklabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to learn how to create Facebook API key.', replace: [{ 0: '<a href="'+process.env.PUBLIC_URL+'/Documentation/facebook" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        social_login_fb_apiid: fields.string({
            label:"Facebook API ID",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_fb_apiid",'')
        }),
        social_login_fb_apikey: fields.string({ 
            label : "Facebook App Secret" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_fb_apikey","")
        }),
        social_login_google: fields.string({
            choices: { 1: 'Enabled', 0: 'Disabled'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Google Login",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value: settings.getSetting(req,"social_login_google","0")
        }),
        googlelabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to learn how to create Google API key.', replace: [{ 0: '<a href="'+process.env.PUBLIC_URL+'/Documentation/google" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        social_login_google_apiid: fields.string({
            label:"Google client ID",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_google_apiid",'')
        }),
        social_login_google_apikey: fields.string({ 
            label : "Google client secret" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_google_apikey","")
        }),
        social_login_twitter: fields.string({
            choices: { 1: 'Enabled', 0: 'Disabled'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Twitter Login",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value: settings.getSetting(req,"social_login_twitter","0")
        }),
        twitterlabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to learn how to create Twitter API key.', replace: [{ 0: '<a href="'+process.env.PUBLIC_URL+'/Documentation/twitter" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        social_login_twitter_apiid: fields.string({
            label:"Twitter App Consumer Key",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_twitter_apiid",'')
        }),
        social_login_twitter_apikey: fields.string({ 
            label : "Twitter App Consumer Secret" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_twitter_apikey","")
        }),


        social_login_apple: fields.string({
            choices: { 1: 'Enabled', 0: 'Disabled'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Apple Login",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value: settings.getSetting(req,"social_login_apple","0")
        }),
        applelabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to learn how to create Apple API keys.', replace: [{ 0: '<a href="https://github.com/ananay/apple-auth/blob/master/SETUP.md#create-a-new-app-id" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        social_login_apple_p8: fields.string({
            label: "Private key",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"social_login_apple_p8")
        }),
        applep8: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to Download it.', replace: [{ 0: '<a href="https://developer.apple.com/account/resources/authkeys/list" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        social_login_apple_clientid: fields.string({
            label:"Apple Client ID",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_apple_clientid",'')
        }),

        social_login_apple_teamid: fields.string({
            label:"Apple Team ID",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_apple_teamid",'')
        }),
        social_login_apple_keyid: fields.string({
            label:"Apple Key ID",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"social_login_apple_keyid",'')
        })

    },{validatePastFirstError:true});
    
    reg_form.handle(req, {
        success: function (form) {
            delete form.data['facebooklabel']
            delete form.data['googlelabel']
            delete form.data['twitterlabel']
            delete form.data["applelabel"]
            delete form.data["applep8"]
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Social Login Settings"});
        }
    });
}

exports.pwa = async (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var widgets = forms.widgets;
    var validators = forms.validators;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
    const files = { "": "" }

    await fileManager.findAll(req, { "column": "path", "like": "image" }).then(result => {
        result.forEach(res => {
            let url = res.path.split(/(\\|\/)/g).pop()
            files[res.path] = res.orgName
        });
    })
    var reg_form = forms.create({
        pwa_app_name: fields.string({
            label:"App Name",
            required: true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"pwa_app_name",'')
        }),
        pwa_short_name: fields.string({
            label:"Short Name",
            required: true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"pwa_short_name",'')
        }),
        pwa_app_description: fields.string({
            label:"App Description",
            required: true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.textarea({"classes":["form-control"]}),
            value:settings.getSetting(req,"pwa_app_description",'')
        }),
        pwa_app_theme_color: fields.string({
            label:"App Theme Color",
            required: true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control script_color"]}),
            value:settings.getSetting(req,"pwa_app_theme_color",'')
        }),
        pwa_app_bg_color: fields.string({
            label:"App Background Color",
            required: true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control script_color"]}),
            value:settings.getSetting(req,"pwa_app_bg_color",'')
        }),

        appicons: fields.string({
            widget: formFunctions.makeClickable({ content: '<h2 style="text-align: center;margin: 40px;text-decoration: underline;">App PNG Icons only(* all icons must be of given sizes)</h2>', replace: [] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        
        pwa_icon_sizes_72: fields.string({
            label: "Icon Size 72x72",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"pwa_icon_sizes_72")
        }),

        pwa_icon_sizes_96: fields.string({
            label: "Icon Size 96X96",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"pwa_icon_sizes_96")
        }),
        pwa_icon_sizes_128: fields.string({
            label: "Icon Size 128x128",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"pwa_icon_sizes_128")
        }),
        pwa_icon_sizes_144: fields.string({
            label: "Icon Size 144x144",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"pwa_icon_sizes_144")
        }),
        pwa_icon_sizes_152: fields.string({
            label: "Icon Size 152x152",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"pwa_icon_sizes_152")
        }),
        pwa_icon_sizes_192: fields.string({
            label: "Icon Size 192x192",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"pwa_icon_sizes_192")
        }),
        pwa_icon_sizes_384: fields.string({
            label: "Icon Size 384x384",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"pwa_icon_sizes_384")
        }),
        pwa_icon_sizes_512: fields.string({
            label: "Icon Size 512x512",
            choices: files,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req,"pwa_icon_sizes_512")
        }),
        
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/pwa',{nav:url,reg_form:reg_form,title:"PWA Settings"});
        }
    });
}

exports.otp = (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var widgets = forms.widgets;
    var validators = forms.validators;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
    var reg_form = forms.create({
        
        twillio_enable: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Enable",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"twillio_enable","0")
        }),
        otplabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to create Twillio keys .', replace: [{ 0: '<a href="https://www.twilio.com/referral/hlLIcM" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        twillio_sid: fields.string({
            label:"Account SID",
            required:true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"twillio_sid",'')
        }),
        twillio_token: fields.string({
            label:"Auth Token",
            required:true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"twillio_token",'')
        }),
        twillio_phone_number: fields.string({
            label:"Phone Number",
            required:true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"twillio_phone_number",'')
        }),
        
        
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"OTP Phone Verification"});
        }
    });
}
exports.recaptcha = (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var widgets = forms.widgets;
    var validators = forms.validators;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
    var reg_form = forms.create({
        
        recaptcha_enable: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Enable",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"recaptcha_enable","0")
        }),
        otplabel: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to create reCAPTCHA v3 keys .', replace: [{ 0: '<a href="https://www.google.com/recaptcha/intro/v3.html" target="_blank">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        recaptcha_enterprise: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Enabling the reCAPTCHA Enterprise",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"recaptcha_enterprise","0")
        }),
        recaptcha_key: fields.string({
            label:"Google reCaptcha Site Key",
            required:true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"recaptcha_key",'')
        }),
        recaptcha_secret_key: fields.string({
            label:"Google reCaptcha Secret Key",
            required:true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"recaptcha_secret_key",'')
        }),
        
        recaptcha_login_enable: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Enable on Login Page",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"recaptcha_login_enable","0")
        }),
        recaptcha_signup_enable: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Enable on Signup Page",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"recaptcha_signup_enable","0")
        }),
        recaptcha_contactus_enable: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Enable on Contact Us Page",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"recaptcha_contactus_enable","0")
        }),
        recaptcha_forgotpassword_enable: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Enable on Forgot Password Page",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"recaptcha_forgotpassword_enable","0")
        }),
        
        
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Google reCAPTCHA v3 Settings"});
        }
    });
}

exports.signup = (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var widgets = forms.widgets;
    var validators = forms.validators;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
    var reg_form = forms.create({
       
        signup_form_lastname: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to enable Last Name on signup form?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"signup_form_lastname","0")
        }),
        signup_form_username: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to enable Username on signup form?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"signup_form_username","0")
        }),
        signup_form_timezone: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to enable Timezone on signup form?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"signup_form_timezone","0")
        }),
        signup_phone_number: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to enable Phone Number on signup form?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"signup_phone_number","0")
        }),
        signup_phone_number_required: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to make Phone Number on signup required?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"signup_phone_number_required","0")
        }),
        
        signup_form_gender: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to enable Gender on signup form?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"signup_form_gender","0")
        }),
        signup_form_image: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to enable Image Upload on signup form?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"signup_form_image","0")
        }),
        signup_form_image_required: fields.string({
            choices: { '1': 'Yes', '0': 'No'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to make Image Upload required on signup form?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"signup_form_image_required","0")
        }),
        
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Signup Settings"});
        }
    });
}


exports.contact = (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var widgets = forms.widgets;
    var validators = forms.validators;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
    var reg_form = forms.create({
        contact_map: fields.string({
            label:"Google Map (* leave empty if you don't want to show map)",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.textarea({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_map",'')
        }),
        contact_address: fields.string({
            label:"Contact Address.",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_address",'')
        }),
        contact_phone: fields.string({
            label:"Contact Phone Number.",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_phone",'')
        }),
        contact_fax: fields.string({
            label:"Contact Fax Number.",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_fax",'')
        }),
        contact_email: fields.string({
            label:"Contact Email Address.",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_email",'')
        }),

        contact_facebook_url: fields.string({
            label:"Facebook URL",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_facebook_url",'')
        }),
        contact_twitter_url: fields.string({
            label:"Twitter URL",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_twitter_url",'')
        }),
        contact_whatsapp_url: fields.string({
            label:"Whatsapp URL",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_whatsapp_url",'')
        }),
        contact_linkedin_url: fields.string({
            label:"Linkedin URL",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_linkedin_url",'')
        }),
        contact_pinterest_url: fields.string({
            label:"Pinterest URL",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"contact_pinterest_url",'')
        }),
        
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Contact Us Settings"});
        }
    });
}

exports.s3 = (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var widgets = forms.widgets;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
    var reg_form = forms.create({
        upload_system: fields.string({
            choices: { 's3': 'S3 Storage','wisabi': 'Wasabi Storage', '0': 'Local Storage'},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Storage Type",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"upload_system","0")
        }),
        s3_bucket: fields.string({
            label:"Bucket Name",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"s3_bucket",'')
        }),

       
        s3_access_key: fields.string({ 
            label : "S3 Key" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"s3_access_key","")
        }),
        
        s3_secret_access_key: fields.string({
            label:"S3 Secret Key",
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:req.loguserallowed ? "****" : settings.getSetting(req,"s3_secret_access_key",'')
        }),
        
        s3_region: fields.string({
            widget: widgets.text({"classes":["form-control"]}),
            label:"S3 buket Region",
            cssClasses: {"field" : ["form-group"]},
            value:req.loguserallowed ? "****" : settings.getSetting(req,"s3_region","us-east-1")
        })
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            delete form.data.s3_bucket_name
            delete form.data.s3_access_key_name
            delete form.data.s3_secret_access_key_name
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Storage Settings"});
        }
    });
}

// OPEN AI
exports.aiSettings = (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;
    var cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };

    var reg_form = forms.create({
        
        openai_api_key: fields.string({ 
            label : "OpenAI API Key" ,
            cssClasses:cssClasses,
            required:false,
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"openai_api_key",'')
        }),
        openai_api_key_label: fields.string({ 
            widget: formFunctions.makeClickable({ content: '[0] to create OpenAI API key.', replace: [{ 0: '<a href="https://platform.openai.com/account/api-keys" target="_blank">Click here</a>' }] }),
            cssClasses:{"field" : ["form-group","form-description"]},
        }),
        
        openai_model: fields.string({
            choices: { 'gpt-4':"gpt-4",'gpt-4-0314': 'gpt-4-0314','gpt-4-32k':"gpt-4-32k",'gpt-4-32k-0314':"gpt-4-32k-0314","gpt-3.5-turbo":"gpt-3.5-turbo","gpt-3.5-turbo-0301":"gpt-3.5-turbo-0301"},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Open AI Model",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"openai_model",'gpt-3.5-turbo')
        }),
        openai_image_system: fields.string({ 
            choices:{"1":"Allow Image creation using AI","0":"No don't allow Image creation using AI"},
            label : "Allow OpenAI Image system" ,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: {"field" : ["form-group"]},
            fieldsetClasses:"form_fieldset",
            value:settings.getSetting(req,"openai_image_system","1")
        }),
        openai_description_system: fields.string({
            choices:{"1":"Allow Content description creation using AI","0":"No don't allow Content description creation using AI"},
            label : "Allow OpenAI Content Description system" ,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: {"field" : ["form-group"]},
            fieldsetClasses:"form_fieldset",
            value:settings.getSetting(req,"openai_description_system","1")
        }),
        openai_blog_system: fields.string({ 
            choices:{"1":"Allow Blog creation using AI","0":"No don't allow Blog creation using AI"},
            label : "Allow OpenAI Blog system" ,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: {"field" : ["form-group"]},
            fieldsetClasses:"form_fieldset",
            value:settings.getSetting(req,"openai_blog_system","1")
        }),
        openai_blog_description_count: fields.string({
            required: validators.required('%s is required'),
            validators: [validators.integer('Enter integer value only.')],
            label : "OpenAI Description Word Count for Blog Content. Enter 0 for unlimited.",
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"openai_blog_description_count","10000")
        }),
        openai_image_price: fields.string({
            required: validators.required('%s is required'),
            validators:[validators.regexp(/^[0-9]+\.?[0-9]*$/,'Enter valid price value only.')],
            label : "OpenAI Image Generation Price" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"openai_image_price","0.2")
        }),

        openai_description_price: fields.string({
            required: validators.required('%s is required'),
            validators:[validators.regexp(/^[0-9]+\.?[0-9]*$/,'Enter valid price value only.')],
            label : "OpenAI Content(Description) Generation Price per Word" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"openai_description_price","0.1")
        }),

        openai_blog_price: fields.string({
            required: validators.required('%s is required'),
            validators:[validators.regexp(/^[0-9]+\.?[0-9]*$/,'Enter valid price value only.')],
            label : "OpenAI Blog Generation Price" ,
            cssClasses:cssClasses,
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"openai_blog_price","0.5")
        }),
        openai_blog_price_label: fields.string({ 
            widget: widgets.label({content : 'It includes tags (10 tags), title (100 words), description (10000 words) and 1 image.' }),
            cssClasses:{"field" : ["form-group","form-description"]},
        }),

    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            delete form.data["openai_api_key_label"]
            delete form.data["openai_blog_price_label"]
            
            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/settings/index',{nav:url,reg_form:reg_form,title:"Settings"});
        }
    });
}

exports.aiLevels = async(req,res,next) => {
    let level_id = req.params.level_id
    
    let memberLevels = {}
    let flag = ""
    await levels.findAll(req, req.query).then(result => {
        if (result) {
            result.forEach(res => {
                if(res.type != "public"){
                    if ((!level_id && res.flag == "default")) {
                        level_id = res.level_id
                    }
                    if (res.level_id == level_id || (!level_id && res.flag == "default")) {
                        flag = res.flag
                        type = res.type
                    }
                    memberLevels[res.level_id] = res.title
                }
            });
        }
    })
    const cacheContent = await permission.getKeyValue(req, level_id)    

    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;

    

    let formFields = {
        level_id: fields.string({
            label: "Member Role",
            choices: memberLevels,
            required: true,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: level_id
        }),
    }

    if (flag != "public") {
           let formFieldsPublic ={
            imagecreate: fields.string({
                    choices: {"1" : "Yes, allow to create images using OpenAI","0" : "No, do not allow to create images using OpenAI"},
                   widget: widgets.select({ "classes": ["select"] }),
                    label:"Allow member to upload create images using OpenAI",
                    fieldsetClasses:"form_fieldset",
                    cssClasses: {"field" : ["form-group"]},
                    value:cacheContent["openai.imagecreate"] ? cacheContent["openai.imagecreate"].toString() : 0
                }),
                blogcreate: fields.string({
                    choices: {"1" : "Yes, allow to create blog using OpenAI","0" : "No, do not allow to create blog using OpenAI"},
                   widget: widgets.select({ "classes": ["select"] }),
                    label:"Allow member to create blog using OpenAI",
                    fieldsetClasses:"form_fieldset",
                    cssClasses: {"field" : ["form-group"]},
                    value:cacheContent["openai.blogcreate"] ? cacheContent["openai.blogcreate"].toString() : 0
                })
            }
            formFields = {...formFields,...formFieldsPublic}
            let formFieldsPublicDesc ={
                descriptioncreate: fields.string({
                    choices: {"1" : "Yes, allow to create description using OpenAI","0" : "No, do not allow to create description using OpenAI"},
                   widget: widgets.select({ "classes": ["select"] }),
                    label:"Allow member to create description using OpenAI",
                    fieldsetClasses:"form_fieldset",
                    cssClasses: {"field" : ["form-group"]},
                    value:cacheContent["openai.descriptioncreate"] ? cacheContent["openai.descriptioncreate"].toString() : 1
                })
            }
            formFields = {...formFields,...formFieldsPublicDesc}
    }

    var reg_form = forms.create(formFields, { validatePastFirstError: true });
    reg_form.handle(req, {
        success: function (form) {
            permission.insertUpdate(req, res, form.data, level_id, "openai").then(() => {
                res.send({ success: 1, message: "Operation performed successfully.", url: process.env.ADMIN_SLUG + "/ai/levels/" + level_id })
            })
        },
        error: function (form) {
            const errors = formFunctions.formValidations(form);
            res.send({ errors: errors });
        },
        other: function () {
            res.render('admin/settings/ai-levels', { nav: url, reg_form: reg_form, title: "OpenAI Member Role Settings" });
        }
    });
}

exports.searchAvtars = async (req) => {
    return await commonFunctions.openAIImage(req,req.query.title,req.query.image_size ?? "1024x1024",req.query.limit ?? 1);
}

exports.aiAvtars = async(req,res,next) => {
    let searchResults;
    let searchError;
    if(req.query && req.query.title){
        let data = await exports.searchAvtars(req)
        if(data.status){
            searchResults = data.data
        }else{
            searchError = data.message
        }
    }

    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    let avtarts = null
    await avtarsModel.findAll(req, {type:"avtars"}).then(result => {
        if (result) {
            avtarts = result
        }
    }) 
    res.render('admin/settings/avtars', {adminLink:process.env.ADMIN_SLUG,searchError:searchError,searchResults:searchResults, nav: url, title: "OpenAI Avtars",results:avtarts,isCover:false,query:req.query });
}
exports.aiCovers = async(req,res,next) => {
    let searchResults;
    let searchError;
    if(req.query && req.query.title){
        let data = await exports.searchAvtars(req)
        if(data.status){
            searchResults = data.data
        }else{
            searchError = data.message
        }
    }

    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    let avtarts = null
    await avtarsModel.findAll(req, {type:"covers"}).then(result => {
        if (result) {
            avtarts = result
        }
    }) 
    res.render('admin/settings/avtars', {adminLink:process.env.ADMIN_SLUG,searchError:searchError,searchResults:searchResults, nav: url, title: "OpenAI Covers",results:avtarts,isCover:true,query:req.query });
}

exports.aiImportImages = async(req,res,next) => {
    const images = req.body.images
    const isCover = req.body.isCover == "false" ? false : true;
    const imagesData = JSON.parse(images)
    let response = {isValid:true}
    for(var i = 0;i<imagesData.length;i++){
        let fileName = imagesData[i].image_url
        // download image on local and upload on s3/wasabi if enabled
        const imageName = Date.now() + '_' + Math.random().toString(36).substring(7) + '.png';
        let image_path = req.serverDirectoryPath + `/public/upload/images/${isCover ? "cover-ai" : "avtar-ai"}/` + imageName;
        if(!fs.existsSync(req.serverDirectoryPath + `/public/upload/images/${isCover ? "cover-ai" : "avtar-ai"}`))
            fs.mkdirSync(req.serverDirectoryPath + `/public/upload/images/${isCover ? "cover-ai" : "avtar-ai"}`, { recursive: true,mode:'0777' });

        let options = {
            url: fileName,
            dest: image_path
        } 
        await download.image(options)
            .then(async ({ filename, image }) => {
                if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                    await s3Upload(req,  image_path, image_path.replace(req.serverDirectoryPath + '/public', '')).then(result => {
                        //remove local file
                        commonFunctions.deleteImage(req, "", image_path, 'user/ai')
                    }).catch(err => {
                    })
                }
                let data = {}
                data["path"] = image_path.replace(req.serverDirectoryPath + '/public', '')
                data["enable"] = 1;
                data.type = isCover ? "covers" : "avtars"
                await globalModel.create(req, data, 'user_avtar_images').then(result => {
                });
            }).catch((err) => {
                response = {isValid:0,message:err.message}
            })
    }
    res.send(response)
}

exports.UploadAIImagesDirect = async(req,res,next) => {
    if(req.imageError){
        res.status(200).send({error:1,message:"Error in uploading file."})
    }else{
        let isCover = req.params.type == "true" ? true : false
        const imagename = req.fileName;
        let data = {}
        data["path"] = `/upload/images/${isCover ? "cover-ai" : "avtar-ai"}/${imagename}`
        data["enable"] = 1;
        data.type = isCover ? "covers" : "avtars"
        await globalModel.create(req, data, 'user_avtar_images').then(result => {
        });
        res.status(200).send({error:0,message:"File uploaded successfully"})
    }
}

exports.aiDeleteImage = async(req,res,next) => {
    const id = req.params.id
    let existingArtist = {}
    if (parseInt(id) > 0) {
        await avtarsModel.findById(id, req, res).then(result => {
            existingArtist = result
        }).catch(() => {

        });
    }
    if(Object.keys(existingArtist).length == 0){
        next();
        return;
    }
    let backURL = req.header('Referer') || (existingArtist.type == "covers" ? process.env.ADMIN_SLUG + "/ai/covers" : process.env.ADMIN_SLUG + "/ai/avtars");

    if (existingArtist.path) {
        commonFunctions.deleteImage(req, res, existingArtist.path, "ai/image")
    }

    globalModel.delete(req, "user_avtar_images", "avtar_id", parseInt(id)).then(() => {
        res.redirect(backURL)
    })
}