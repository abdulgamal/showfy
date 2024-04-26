const forms = require('forms')
const dateTime = require('node-datetime')
const formFunctions = require('../../functions/forms/file');
const settings = require("../../models/settings")
const levels = require("../../models/levels")
const pagging = require("../../functions/pagging")
const globalModel = require("../../models/globalModel")
const permission = require("../../models/levelPermissions")
const commonFunctions = require("../../functions/commonFunctions")


exports.settings = async (req, res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;

    var reg_form = forms.create({
        enable_gifts: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Do you want to enable gifts system?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "enable_gifts", '0').toString()
        }),
        gifts_commission_type: fields.string({
            choices: { "1": "Fixed Price", "2": "Percentage" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Commission Type of gifts?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "gifts_commission_type", '1').toString()
        }),
        gifts_commission_value: fields.string({
            label: "Get Commission from gifts (put 0 if you not want comission.)",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "gifts_commission_value", '')
        }),

    }, { validatePastFirstError: true });
    reg_form.handle(req, {
        success: function (form) {
            
            settings.setSettings(req, form.data)
            res.send({ success: 1, message: "Setting Saved Successfully." })
        },
        error: function (form) {
            const errors = formFunctions.formValidations(form);
            res.send({ errors: errors });
        },
        other: function () {
            res.render('admin/gifts/settings', { nav: url, reg_form: reg_form, title: "Gifts Settings for Videos/Live Streaming" });
        }
    });

}
exports.levels = async (req, res) => {
    let level_id = req.params.level_id
    
    let memberLevels = {}
    let flag = ""
    let type = "user"
    await levels.findAll(req, req.query).then(result => {
        if (result) {
            result.forEach(res => {
                if(res.flag != "public"){
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
                allow: fields.string({
                    choices: {"1" : "Yes, allow","0" : "No, do not allow"},
                   widget: widgets.select({ "classes": ["select"] }),
                    label:"Allow member to get gifts",
                    fieldsetClasses:"form_fieldset",
                    cssClasses: {"field" : ["form-group"]},
                    value:cacheContent["gifts.allow"] ? cacheContent["gifts.allow"].toString() : 1
                })
            }
            formFields = {...formFields,...formFieldsPublic}
    }


    var reg_form = forms.create(formFields, { validatePastFirstError: true });
    reg_form.handle(req, {
        success: function (form) {
            permission.insertUpdate(req, res, form.data, level_id, "gifts").then(() => {
                res.send({ success: 1, message: "Operation performed successfully.", url: process.env.ADMIN_SLUG + "/gifts/levels/" + level_id })
            })
        },
        error: function (form) {
            const errors = formFunctions.formValidations(form);
            res.send({ errors: errors });
        },
        other: function () {
            res.render('admin/gifts/levels', { nav: url, reg_form: reg_form, title: "Gifts Member Role Settings" });
        }
    });
}

exports.createGifts = async (req,res) => {
    const gift_id = req.params.id
    let existingGift= {}
    //if exists means req from edit page
    if(req.imageError){
        res.send({"errors": {'file': "Error Uploading file."}})
        return
    }
    if(gift_id){
        await globalModel.custom(req, "SELECT * from gifts where gift_id = ?", gift_id).then(async result => {
            if (result && result.length) {
                existingGift = result[0]

            }
        });
    }else{
        if(!req.fileName && !gift_id && req.method == "POST"){
            res.send({"errors": {'file': "Please select file."}})
            return
        }
    }
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
        title: fields.string({
            label:"Title",
            required:true,
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:existingGift.title
        }),
        
        file: fields.string({
            label:"Upload Image",
            // required:true,
            cssClasses: {"field" : ["form-group"]},
            widget: formFunctions.file({name:"file",value:req.appSettings['imageSuffix'] && Object.keys(existingGift).length ? req.appSettings['imageSuffix']+existingGift.image : ""}),
            
        }),
        // price
        price: fields.string({
            label:"Coin Price",
            required:true,
            // validators:[validators.integer('Enter integer value only.')],
            cssClasses: {"field" : ["form-group"]},
            widget: widgets.text({"classes":["form-control"]}),
            value:existingGift.price
        }),
    
        approve: fields.string({
            choices: {"1" : "Yes","0" : "No"},
           widget: widgets.select({ "classes": ["select"] }),
            label:"Enable Gift",
            fieldsetClasses:"form_fieldset",
            cssClasses: {"field" : ["form-group"]},
            value:Object.keys(existingGift).length  ? existingGift["approve"].toString() : 1
        }),
    },{validatePastFirstError:true});
    reg_form.handle(req, {
        success: function (form) {
            delete form.data["file"]
            if(req.fileName){
                form.data["image"] = "/upload/images/gifts/"+req.fileName
                if(existingGift.image){
                    commonFunctions.deleteImage(req,res,existingGift.image,"gifts")
                }
            }
            
            if(!gift_id){
                var dt = dateTime.create();
                var formatted = dt.format('Y-m-d H:M:S');
                form.data.creation_date = formatted
                globalModel.create(req,form.data,'gifts').then(result => {
                    res.send({success:1,message:"Operation performed successfully.",url:process.env.ADMIN_SLUG+"/gifts"})
                })
            }else{
                
                globalModel.update(req,form.data,'gifts','gift_id',gift_id).then(result => {
                    res.send({success:1,message:"Operation performed successfully.",url:process.env.ADMIN_SLUG+"/gifts"})
                })
            }
        },
        error: function(form){
            const errors = formFunctions.formValidations(form);
            res.send({errors:errors});
        },
        other: function (form) {
            res.render('admin/slideshow/create',{nav:url,reg_form:reg_form,title:(!gift_id ? "Create" : "Edit")+"  Gift"});
        }
    });
}
exports.deleteGifts = async (req, res) => {
    const id = req.params.id
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/gifts";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    await globalModel.custom(req,"DELETE FROM gifts WHERE gift_id = ?",[id]).then(() => {
        res.redirect(backURL)
        return
    })

}
exports.gifts = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await globalModel.custom(req,"DELETE FROM gifts WHERE gift_id = ?",[ids[i]]).then(() => {
                    
                })
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
        conditionalWhere += " AND LOWER(gifts.title) LIKE CONCAT('%', ?,  '%')"
    }
    
    if (typeof query.approve != "undefined" && query.approve.length) {
        condition.push(query.approve)
        conditionalWhere += " AND gifts.approve = ?"
    }
    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM gifts WHERE 1 = 1  " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY gifts.gift_id DESC limit ? offset ?"
        let sqlQuery = "SELECT gifts.* FROM gifts  WHERE 1 = 1 " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render('admin/gifts/index', {  loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Gifts", paggingData: paggingData });
}
exports.approve = async (req, res) => { 
    const id = req.params.id
    if (!id || !req.user) {
        res.send({ error: 1 })
        return
    }
    await globalModel.custom(req, "SELECT * from gifts where gift_id = ?", id).then(async result => {
        if (result && result.length) {
            let item = result[0]
            console.log(item);
            await globalModel.update(req, { approve: item.approve == 0 ? 1 : 0 }, "gifts", "gift_id", id).then(() => {
                
                res.send({ status: item.approve == 1 ? 0 : 1 })
            })
        } else {
            res.send({ error: 1 })
        }
    })
}
exports.payments = async (req,res) => {
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
        conditionalWhere += " AND LOWER(gifts.title) LIKE CONCAT('%', ?,  '%')"
    }
    if (query.displayname) {
        condition.push(query.displayname.toLowerCase())
        conditionalWhere += " AND LOWER(userdetails.displayname) LIKE CONCAT('%', ?,  '%')"
    }
    if (query.email) {
        condition.push(query.email.toLowerCase())
        conditionalWhere += " AND LOWER(users.email) LIKE CONCAT('%', ?,  '%')"
    }


    conditionalWhere += " AND users.user_id IS NOT NULL "

    let results = []
    let totalCount = 0

    let sql = "SELECT COUNT(*) as totalCount FROM transactions INNER JOIN gifts on gifts.gift_id = transactions.id LEFT JOIN users on users.user_id = transactions.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' AND (transactions.state = 'approved' || transactions.state = 'completed' || transactions.state = 'active') AND ( transactions.type = 'gift'  ) " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY transactions.transaction_id DESC limit ? offset ?"
        let sqlQuery = "SELECT transactions.*,userdetails.username,userdetails.displayname,gifts.title as giftTitle,transactions.price as amount FROM transactions INNER JOIN gifts on gifts.gift_id = transactions.id INNER JOIN users on users.user_id = transactions.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id  WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' AND (transactions.state = 'approved' || transactions.state = 'completed' || transactions.state = 'active') AND transactions.type = 'gift'  " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }

    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render('admin/gifts/payment', { loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Sold Gifts", paggingData: paggingData });

}
exports.deletePayments = async(req,res) => {
    const id = req.params.id
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/payment";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    await globalModel.custom(req,"DELETE FROM transactions WHERE transaction_id = ?",[id]).then(() => {
        res.redirect(backURL)
        return
    })
}
