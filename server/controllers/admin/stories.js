const forms = require('forms')
const dateTime = require('node-datetime')
const formFunctions = require('../../functions/forms/file');
const settings = require("../../models/settings")
const levels = require("../../models/levels")
const pagging = require("../../functions/pagging")
const globalModel = require("../../models/globalModel")
const permission = require("../../models/levelPermissions")
const storiesModel = require("../../models/stories")

exports.background = async (req,res) => {

    if(req.imageError){
        res.status(200).send({error:1,message:"Error in uploading file."})
    }else if(req.fileName){
        const imagename = req.fileName;
        await globalModel.create(req,{file:"/upload/images/stories/background/"+imagename,creation_date:dateTime.create().format('Y-m-d H:M:S')},'stories_attachments').then(async result => {
            globalModel.update(req,{order:result.insertId},"stories_attachments","attachment_id",result.insertId)
            return res.redirect(process.env.ADMIN_SLUG + "/stories/background")
        })
        return;
    }

    let LimitNum = 1000;
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

    let results = []
    let totalCount = 0

    let sql = "SELECT COUNT(*) as totalCount FROM stories_attachments  WHERE 1 = 1 " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY stories_attachments.order DESC limit ? offset ?"
        let sqlQuery = "SELECT stories_attachments.* FROM stories_attachments WHERE 1 = 1 " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render('admin/stories/background', {totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Background Images", paggingData: paggingData });

}

exports.index = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                let story = null
                await storiesModel.getStory(req,ids[i]).then(result => {
                    story = result
                }).catch(error => {
                    
                });
                if(story)
                    await storiesModel.deleteStory(req,story).then(_result => {})
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
        conditionalWhere += " AND LOWER(stories.title) LIKE CONCAT('%', ?,  '%')"
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
        conditionalWhere += " AND stories.approve = ?"
    }

    conditionalWhere += " AND users.user_id IS NOT NULL AND stories.completed = 1 AND users.active = '1' AND users.approve = '1'"

    let results = []
    let totalCount = 0

    let sql = "SELECT COUNT(*) as totalCount FROM stories LEFT JOIN users on users.user_id = stories.owner_id  LEFT JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY stories.story_id DESC limit ? offset ?"
        let sqlQuery = "SELECT stories.*,userdetails.username,userdetails.displayname FROM stories LEFT JOIN users on users.user_id = stories.owner_id LEFT JOIN userdetails on userdetails.user_id = stories.owner_id  WHERE 1 = 1 " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render('admin/stories/index', {loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Stories", paggingData: paggingData });
}

exports.approve = async (req, res) => {
    const id = req.params.id
    if (!id || !req.user) {
        res.send({ error: 1 })
        return
    }
    await globalModel.custom(req, "SELECT * from stories_attachments where attachment_id = ?", id).then(async result => {
        if (result && result.length) {
            let item = result[0]
            await globalModel.update(req, { approve: !item.approve }, "stories_attachments", "attachment_id", id).then(async result => {
                res.send({ status: !item.approve })
            })
        } else {
            res.send({ error: 1 })
        }
    })
}

exports.delete = async (req, res) => {
    const id = req.params.id
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/stories";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    await storiesModel.deleteBackgroundImage(id,req).then(result => {
        res.redirect(backURL)
        return
    })
}
exports.deleteStory = async (req, res) => {
    const id = req.params.id
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/stories";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    let story= {}

    if(id){
        await storiesModel.getStory(req,id).then(result => {
            story = result
        }).catch(error => {
            
        });
    }

    await storiesModel.deleteStory(req,story).then(result => {
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
    if(type == "admin" || type == "moderator"){
        deleteOptions["2"] = "Yes, allow to delete other users Stories."
        viewOptions["2"] = "Yes, allow to view private Stories of users."
    }
    viewOptions["0"] = "No, do not allow to view Stories."
    viewOptions["1"] = "Yes, allow to view Stories."
    
    deleteOptions["1"] = "Yes, allow to delete own Stories."
    deleteOptions["0"] = "No, do not allow to delete Stories."

    
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
                choices: {"1" : "Yes, allow to create Stories","0" : "No, do not allow to create Stories"},
               widget: widgets.select({ "classes": ["select"] }),
                label:"Allow member to create Stories",
                fieldsetClasses:"form_fieldset",
                cssClasses: {"field" : ["form-group"]},
                value:cacheContent["stories.create"] ? cacheContent["stories.create"].toString() : 1
            })
        }
        formFields = {...formFields,...formFieldsPublic}
    }

    let formFieldsView ={
        view: fields.string({
            choices: viewOptions,
           widget: widgets.select({ "classes": ["select"] }),
            label:"Allow member to view Stories",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:cacheContent["stories.view"] ? cacheContent["stories.view"].toString() : 1
        }),
        
    }
    formFields = {...formFields,...formFieldsView}


    if(flag != "public"){
        let formFields1 = {
            
            delete: fields.string({
                choices: deleteOptions,
               widget: widgets.select({ "classes": ["select"] }),
                label:"Allow member to delete created Stories",
                fieldsetClasses:"form_fieldset",
                cssClasses: {"field" : ["form-group"]},
                value:cacheContent["stories.delete"] ? cacheContent["stories.delete"].toString() : 1
            }),
            
            // auto_approve: fields.string({
            //     choices: {"1" : "Yes, auto approve stories","0" : "No, do not auto approve stories"},
            //    widget: widgets.select({ "classes": ["select"] }),
            //     label:"Auto Approve Stories",
            //     fieldsetClasses:"form_fieldset",
            //     cssClasses: {"field" : ["form-group"]},
            //     value:cacheContent["stories.auto_approve"] ? cacheContent["stories.auto_approve"].toString() : 1
            // }),
            // allow_message: fields.string({
            //     choices: {"1" : "Yes, allow messages","0" : "No, do not allow messages"},
            //    widget: widgets.select({ "classes": ["select"] }),
            //     label:"Allow Messages on Stories",
            //     fieldsetClasses:"form_fieldset",
            //     cssClasses: {"field" : ["form-group"]},
            //     value:cacheContent["stories.allow_message"] ? cacheContent["stories.allow_message"].toString() : 1
            // }),
            allowed_types: fields.string({
                label: "Stories Type allowed",
                choices: { "image": "Image Stories", "video": "Video Stories",'music':"Audio Stories" },
                cssClasses: { "field": ["form-group"] },
                widget: widgets.multipleCheckbox({ "classes": ["form-control-checkbox"] }),
                value:cacheContent["stories.allowed_types"] ? cacheContent["stories.allowed_types"].split(",") : ["image",'video','music']
            }),

            
        }
        formFields = {...formFields,...formFields1}
    }
    var reg_form = forms.create(formFields,{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            permission.insertUpdate(req,res,form.data,level_id,"stories").then(result => {
                res.send({success:1,message:"Operation performed successfully.",url:process.env.ADMIN_SLUG+"/stories/levels/"+level_id})
            })
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/stories/levels',{nav:url,reg_form:reg_form,title: "Stories Member Role Settings"});
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
    // const files = {"":""}

    // await fileManager.findAll(req,{"column":"path","like":"image"}).then(result => {
    //     result.forEach(res => {
    //         let url = res.path.split(/(\\|\/)/g).pop()
    //         files[res.path] = res.orgName
    //     });
    // })


    var reg_form = forms.create({
        enable_stories: fields.string({
            choices: {"1" : "Yes","0" : "No"},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to enable stories feature on your website?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"enable_stories",'1').toString()
        }),        

        // stories_message: fields.string({
        //     choices: {"1" : "Yes","0" : "No"},
        //     widget: widgets.select({ "classes": ["select"] }),
        //     label:"Do you want to enable messages feature on stories?",
        //     fieldsetClasses:"form_fieldset",
        //     cssClasses: {"field" : ["form-group"]},
        //     value:settings.getSetting(req,"stories_message",'1').toString()
        // }),
        stories_audio_image: fields.string({
            choices: {"1" : "Yes","0" : "No"},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to make image upload mandatory in audio stories?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"stories_audio_image",'1').toString()
        }),
        stories_video_image: fields.string({
            choices: {"1" : "Yes","0" : "No"},
            widget: widgets.select({ "classes": ["select"] }),
            label:"Do you want to make image upload mandatory in video stories?",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:settings.getSetting(req,"stories_video_image",'1').toString()
        }),

        stories_duration: fields.string({
            label:"Stories Duration(in Days)",
            validators:[validators.integer('Enter integer value only.')],
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"stories_duration",'1').toString()
        }),
        stories_delay: fields.string({
            label:"Delay Time for Photos(in Seconds)",
            validators:[validators.integer('Enter integer value only.')],
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"stories_delay",'5').toString()
        }),

        stories_video_upload: fields.string({
            label:"Video upload size limit(in MB)",
            validators:[validators.integer('Enter integer value only.')],
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"stories_video_upload",'10').toString()
        }),
        stories_audio_upload: fields.string({
            label:"Audio upload size limit(in MB)",
            validators:[validators.integer('Enter integer value only.')],
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:settings.getSetting(req,"stories_audio_upload",'5').toString()
        }),

        story_like: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable like feature on stories?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "story_like", '1').toString()
        }),
        story_dislike: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable dislike feature on stories?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "story_dislike", '1').toString()
        }),

        story_comment: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable comment feature on stories?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "story_comment", '1').toString()
        }),

        story_comment_like: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable like feature on stories comment?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "story_comment_like", '1').toString()
        }),

        story_comment_dislike: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable dislike feature on stories comment?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "story_comment_dislike", '1').toString()
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
            res.render('admin/stories/settings',{nav:url,reg_form:reg_form,title:"Stories Settings"});
        }
    });
}