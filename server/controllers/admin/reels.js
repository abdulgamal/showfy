const forms = require('forms')
const dateTime = require('node-datetime')
const formFunctions = require('../../functions/forms/file');
const settings = require("../../models/settings")
const levels = require("../../models/levels")
const pagging = require("../../functions/pagging")
const globalModel = require("../../models/globalModel")
const permission = require("../../models/levelPermissions")
const reelsModel = require("../../models/reels")
const fileManager = require("../../models/fileManager")

exports.index = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                let story = null
                await reelsModel.getReel(req,ids[i]).then(result => {
                    story = result
                }).catch(error => {
                    
                });
                if(story)
                    await reelsModel.deleteReel(req,story).then(_result => {})
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }
    
    const query = { ...req.query }
    let conditionalWhere = ""
    let condition = []
    if (query.title) {
        condition.push(query.title.toLowerCase())
        conditionalWhere += " AND LOWER(reels.title) LIKE CONCAT('%', ?,  '%')"
    }
    if (query.displayname) {
        condition.push(query.displayname.toLowerCase())
        conditionalWhere += " AND LOWER(userdetails.displayname) LIKE CONCAT('%', ?,  '%')"
    }
    if (query.email) {
        condition.push(query.email.toLowerCase())
        conditionalWhere += " AND LOWER(users.email) LIKE CONCAT('%', ?,  '%')"
    }
    
    
    if (typeof query.approve != "undefined" && query.approve.length) {
        condition.push(query.approve)
        conditionalWhere += " AND reels.approve = ?"
    }

    conditionalWhere += " AND users.user_id IS NOT NULL && reels.completed = 1 AND users.active = '1' AND users.approve = '1' "

    let results = []
    let totalCount = 0

    let sql = "SELECT COUNT(*) as totalCount FROM reels LEFT JOIN users on users.user_id = reels.owner_id  LEFT JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY reels.reel_id DESC limit ? offset ?"
        let sqlQuery = "SELECT reels.*,userdetails.username,userdetails.displayname FROM reels LEFT JOIN users on users.user_id = reels.owner_id LEFT JOIN userdetails on userdetails.user_id = reels.owner_id  WHERE 1 = 1 " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render('admin/reels/index', {loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Reels", paggingData: paggingData });
}


exports.deleteReel = async (req, res) => {
    const id = req.params.id
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/reels";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    let story= {}

    if(id){
        await reelsModel.getReel(req,id).then(result => {
            story = result
        }).catch(error => {
            
        });
    }

    await reelsModel.deleteReel(req,story).then(result => {
        res.redirect(backURL)
        return
    })
}

exports.levels = async (req,res) => {
    let level_id = req.params.level_id
    
    let memberLevels = {}
    let flag = ""
    let type = "user"
    await  levels.findAll(req,req.query).then(result => {
         if(result){
             result.forEach(res => {
                 if((!level_id && res.flag == "default")){
                     level_id = res.level_id
                 }
                 if(res.level_id == level_id || (!level_id && res.flag == "default")){
                     flag = res.flag
                     type = res.type
                 }
                 memberLevels[res.level_id] = res.title
             });
         }
    })
    const cacheContent = await permission.getKeyValue(req,level_id)
    //get uploaded file by admin

    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;
    const cssClasses = {
        label :[""],
        field : ["form-group"],
        classes : ["form-control"]
    };
    
    const deleteOptions = {}
    const viewOptions = {}
    const editOptions = {}
    if(type == "admin" || type == "moderator"){
        deleteOptions["2"] = "Yes, allow to delete other users reels."
        editOptions["2"] = "Yes, allow to edit other users reels."
        viewOptions["2"] = "Yes, allow to view private reels of users."
    }
    viewOptions["0"] = "No, do not allow to view reels."
    viewOptions["1"] = "Yes, allow to view reels."
    
    deleteOptions["1"] = "Yes, allow to delete own reels."
    deleteOptions["0"] = "No, do not allow to delete reels."

    editOptions["1"] = "Yes, allow to edit own reels."
    editOptions["0"] = "No, do not allow to edit reels."

    
    let formFields = {
        level_id: fields.string({
            label: "Member Role",
            choices: memberLevels,
            required:true,
            widget: widgets.select({"classes":["select"]}),
            cssClasses: {"field" : ["form-group"],label:['select']},
            value:level_id
        }),       
    }

    if(flag != "public"){
       let formFieldsPublic ={
            create: fields.string({
                choices: {"1" : "Yes, allow to create reels","0" : "No, do not allow to create reels"},
               widget: widgets.select({ "classes": ["select"] }),
                label:"Allow member to create reels",
                fieldsetClasses:"form_fieldset",
                cssClasses: {"field" : ["form-group"]},
                value:cacheContent["reels.create"] ? cacheContent["reels.create"].toString() : 1
            })
        }
        formFields = {...formFields,...formFieldsPublic}
    }

    let formFieldsView ={
        view: fields.string({
            choices: viewOptions,
           widget: widgets.select({ "classes": ["select"] }),
            label:"Allow member to view reels",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:cacheContent["reels.view"] ? cacheContent["reels.view"].toString() : 1
        }),
        
    }
    formFields = {...formFields,...formFieldsView}


    if(flag != "public"){
        let formFields1 = {
            edit: fields.string({
                choices: editOptions,
                widget: widgets.select({ "classes": ["select"] }),
                label:"Allow member to edit created reels",
                fieldsetClasses:"form_fieldset",
                cssClasses: {"field" : ["form-group"]},
                value:cacheContent["reels.edit"] ? cacheContent["reels.edit"].toString() : 1
            }),
            delete: fields.string({
                choices: deleteOptions,
               widget: widgets.select({ "classes": ["select"] }),
                label:"Allow member to delete created reels",
                fieldsetClasses:"form_fieldset",
                cssClasses: {"field" : ["form-group"]},
                value:cacheContent["reels.delete"] ? cacheContent["reels.delete"].toString() : 1
            }),
            
            
           
            
        }
        formFields = {...formFields,...formFields1}
    }
    var reg_form = forms.create(formFields,{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            permission.insertUpdate(req,res,form.data,level_id,"reels").then(result => {
                res.send({success:1,message:"Operation performed successfully.",url:process.env.ADMIN_SLUG+"/reels/levels/"+level_id})
            })
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/reels/levels',{nav:url,reg_form:reg_form,title: "Reels Member Role Settings"});
        }
    });
}

exports.settings = async (req,res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;
    var cssClasses = {
        field : ["form-group"],
        classes : ["form-control"]
    };
    
   
    //get uploaded file by admin
    const files = {"":""}

    await fileManager.findAll(req,{"column":"path","like":"image"}).then(result => {
        result.forEach(res => {
            let url = res.path.split(/(\\|\/)/g).pop()
            files[res.path] = res.orgName
        });
    })


    var reg_form = forms.create({
        enable_reels: fields.string({
            choices: {"1" : "Yes","0" : "No"},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to enable reels feature on your website?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"enable_reels",'1').toString()
        }),        
        video_ffmpeg_path: fields.string({
            label: "FFMPEG Path",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: req.loguserallowed ? "****" : settings.getSetting(req, "video_ffmpeg_path", '')
        }),
        video_ffmpeg_path_label: fields.string({
            widget: widgets.label({ content: 'This will compress, convert, and optimise videos to mp4. Please contact your hosting provider if you can not install FFMPEG.' }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        reels_process_type: fields.string({
            label: "Max Processes Allowed",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "reels_process_type", '1')
        }),
        reels_process_type_label: fields.string({
            widget: widgets.label({ content: 'How many reels can be converted at the same time? Leave 0 for unlimited.' }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        reel_like: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable like feature on reels?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "reel_like", '1').toString()
        }),
        reel_dislike: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable dislike feature on reels?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "reel_dislike", '1').toString()
        }),

        reel_comment: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable comment feature on reels?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "reel_comment", '1').toString()
        }),

        reels_comment_like: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable like feature on reels comment?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "reels_comment_like", '1').toString()
        }),

        reels_comment_dislike: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable dislike feature on reels comment?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "reels_comment_dislike", '1').toString()
        }),

        reel_video_upload: fields.string({
            label:"Video upload size limit(in MB)",
            validators:[validators.integer('Enter integer value only.')],
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"reel_video_upload",'10').toString()
        }),

        reels_default_photo: fields.string({
            label: "Default Photo on Reels",
            choices: files,
            required: false,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "reels_default_photo", "").toString()
        })
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            delete form.data.video_ffmpeg_path_label
            delete form.data.reels_process_type_label

            settings.setSettings(req,form.data)
            res.send({success:1,message:"Setting Saved Successfully."})
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/reels/settings',{nav:url,reg_form:reg_form,title:"Reels Settings"});
        }
    });
}