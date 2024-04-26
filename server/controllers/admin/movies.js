const forms = require('forms')
const formFunctions = require('../../functions/forms/file');
const settings = require("../../models/settings")
const levels = require("../../models/levels")
const pagging = require("../../functions/pagging")
const globalModel = require("../../models/globalModel")
const languageModel = require("../../models/languages")
const fileManager = require("../../models/fileManager")
const permission = require("../../models/levelPermissions")
const categoryModel = require("../../models/categories")
const commonFunctions = require("../../functions/commonFunctions")
const castncrewModel = require("../../models/castncrew")
const uniqid = require("uniqid")
const movieModel = require("../../models/movies")
const notifications = require("../../models/notifications")

exports.index = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await movieModel.delete(ids[i], req).then(() => {})
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

    const categories = []
    await categoryModel.findAll(req, { type: "movie" }).then(result => {
        result.forEach(function (doc) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0) {
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })

    const query = { ...req.query }
    let conditionalWhere = ""
    let condition = []
    if (query.title) {
        condition.push(query.title.toLowerCase())
        conditionalWhere += " AND LOWER(movies.title) LIKE CONCAT('%', ?,  '%')"
    }
    if (query.displayname) {
        condition.push(query.displayname.toLowerCase())
        conditionalWhere += " AND LOWER(userdetails.displayname) LIKE CONCAT('%', ?,  '%')"
    }
    if (query.email) {
        condition.push(query.email.toLowerCase())
        conditionalWhere += " AND LOWER(users.email) LIKE CONCAT('%', ?,  '%')"
    }

    if (query.category_id) {
        condition.push(query.category_id)
        conditionalWhere += " AND movies.category_id = ?"
    }

    if (query.subcategory_id) {
        condition.push(query.subcategory_id)
        conditionalWhere += " AND movies.subcategory_id = ?"
    }
    if (query.subsubcategory_id) {
        condition.push(query.subsubcategory_id)
        conditionalWhere += " AND movies.subsubcategory_id = ?"
    }
    if (typeof query.paidfee != "undefined" && query.paidfee.length) {
        
        if(query.paidfee == 0){
            conditionalWhere += " AND movies.price = 0"
        }else{
            conditionalWhere += " AND movies.price > 0"
        }
        
    }
    if (typeof query.rentfee != "undefined" && query.rentfee.length) {
        
        if(query.rentfee == 0){
            conditionalWhere += " AND movies.rent_price = 0"
        }else{
            conditionalWhere += " AND movies.rent_price > 0"
        }
        
    }
    if (query.category) {
        condition.push(query.category)
        conditionalWhere += " AND movies.category = ?"
    }
    if (typeof query.adult != "undefined" && query.adult.length) {
        condition.push(query.adult)
        conditionalWhere += " AND movies.adult = ?"
    }
    if (typeof query.approve != "undefined" && query.approve.length) {
        condition.push(query.approve)
        conditionalWhere += " AND movies.approve = ?"
    }

    if (typeof query.is_locked != "undefined" && query.is_locked.length) {
        condition.push(query.is_locked)
        conditionalWhere += " AND movies.is_locked = ?"
    }
    
    if (typeof query.featured != "undefined" && query.featured.length) {
        condition.push(query.featured)
        conditionalWhere += " AND movies.is_featured = ?"
    }
    if (typeof query.sponsored != "undefined" && query.sponsored.length) {
        condition.push(query.sponsored)
        conditionalWhere += " AND movies.is_sponsored = ?"
    }
    if (typeof query.hot != "undefined" && query.hot.length) {
        condition.push(query.hot)
        conditionalWhere += " AND movies.is_hot = ?"
    }
    conditionalWhere += " AND movies.custom_url != '' "
    conditionalWhere += " AND users.user_id IS NOT NULL "

    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM movies LEFT JOIN users on users.user_id = movies.owner_id  LEFT JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 AND (custom_url IS NOT NULL) " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY movies.movie_id DESC limit ? offset ?"
        let sqlQuery = "SELECT movies.*,userdetails.username,userdetails.displayname FROM movies LEFT JOIN users on users.user_id = movies.owner_id  LEFT JOIN userdetails ON users.user_id = userdetails.user_id  WHERE 1 = 1 AND (custom_url IS NOT NULL) " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render('admin/movies/index', { categories: categories, loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Movies", paggingData: paggingData });
}
exports.approve = async (req, res) => { 
    const id = req.params.id
    if (!id || !req.user) {
        res.send({ error: 1 })
        return
    }
    await globalModel.custom(req, "SELECT * from movies where movie_id = ?", id).then(async result => {
        if (result && result.length) {
            let item = result[0]
            await globalModel.update(req, { approve: !item.approve }, "movies", "movie_id", id).then(() => {
                if (item.owner_id != req.user.user_id && !item.approve) {
                    notifications.insert(req, { owner_id: item.owner_id, type: "movies_admin_approved", subject_type: "users", subject_id: item.owner_id, object_type: "movies", object_id: item.movie_id, insert: true }).then(() => {

                    }).catch(() => {
                        
                    })
                } else if (item.owner_id != req.user.user_id && item.approve) {
                    notifications.insert(req, { owner_id: item.owner_id, type: "movies_admin_disapproved", subject_type: "users", subject_id: item.owner_id, object_type: "movies", object_id: item.movie_id, insert: true }).then(() => {

                    }).catch(() => {

                    })
                }
                res.send({ status: !item.approve })
            })
        } else {
            res.send({ error: 1 })
        }
    })
}
exports.slidershow = async (req, res) => { 
    const id = req.params.id
    if (!id || !req.user) {
        res.send({ error: 1 })
        return
    }
    await globalModel.custom(req, "SELECT * from movies where movie_id = ?", id).then(async result => {
        if (result && result.length) {
            let item = result[0]
            await globalModel.update(req, { show_slider: !item.show_slider }, "movies", "movie_id", id).then(() => {
                
                res.send({ status: !item.show_slider })
            })
        } else {
            res.send({ error: 1 })
        }
    })
}
exports.featured = async (req, res) => {
    const id = req.params.id
    if (!id || !req.user) {
        res.send({ error: 1 })
        return
    }
    await globalModel.custom(req, "SELECT * from movies where movie_id = ?", id).then(async result => {
        if (result && result.length) {
            let item = result[0]
            await globalModel.update(req, { is_featured: !item.is_featured }, "movies", "movie_id", id).then(() => {
                if (item.owner_id != req.user.user_id && !item.is_featured) {
                    notifications.insert(req, { owner_id: item.owner_id, type: "movies_featured", subject_type: "users", subject_id: item.owner_id, object_type: "movies", object_id: item.movie_id, insert: true }).then(() => {

                    }).catch(() => {

                    })
                }
                res.send({ status: !item.is_featured })
            })
        } else {
            res.send({ error: 1 })
        }
    })
}
exports.sponsored = async (req, res) => {
    const id = req.params.id
    if (!id || !req.user) {
        res.send({ error: 1 })
        return
    }
    await globalModel.custom(req, "SELECT * from movies where movie_id = ?", id).then(async result => {
        if (result && result.length) {
            let item = result[0]
            await globalModel.update(req, { is_sponsored: !item.is_sponsored }, "movies", "movie_id", id).then(() => {
                if (item.owner_id != req.user.user_id && !item.is_sponsored) {
                    notifications.insert(req, { owner_id: item.owner_id, type: "movies_sponsored", subject_type: "users", subject_id: item.owner_id, object_type: "movies", object_id: item.movie_id, insert: true }).then(() => {

                    }).catch(() => {

                    })
                }
                res.send({ status: !item.is_sponsored })
            })
        } else {
            res.send({ error: 1 })
        }
    })
}
exports.hot = async (req, res) => {
    const id = req.params.id
    if (!id || !req.user) {
        res.send({ error: 1 })
        return
    }
    await globalModel.custom(req, "SELECT * from movies where movie_id = ?", id).then(async result => {
        if (result && result.length) {
            let item = result[0]
            await globalModel.update(req, { is_hot: !item.is_hot }, "movies", "movie_id", id).then(() => {
                if (item.owner_id != req.user.user_id && !item.is_hot) {
                    notifications.insert(req, { owner_id: item.owner_id, type: "movies_hot", subject_type: "users", subject_id: item.owner_id, object_type: "movies", object_id: item.movie_id, insert: true }).then(() => {

                    }).catch(() => {

                    })
                }
                res.send({ status: !item.is_hot })
            })
        } else {
            res.send({ error: 1 })
        }
    })
}
exports.delete = async (req, res) => {
    const id = req.params.id
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/movies";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    await movieModel.delete(id, req).then(() => {
        res.redirect(backURL)
        return
    })
}



exports.castncrew = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                let id = ids[i];
                let existingCastnCrew = {}
                await castncrewModel.findById(id, req, res).then(result => {
                    existingCastnCrew = result
                }).catch(() => {

                });
                if (existingCastnCrew.image) {
                    commonFunctions.deleteImage(req, res, existingCastnCrew.image, "")
                }
                await globalModel.delete(req, "cast_crew_members", "cast_crew_member_id", id).then(async () => {
                    await globalModel.delete(req, "cast_crew", "cast_crew_member_id", id).then(() => {
                        
                    })
                })
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    //get all artists
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }
    

    let results = []
    let totalCount = 0
    let condition = []

    let customWhereCondition = " WHERE type = 'movie'"

    let sql = "SELECT COUNT(*) as totalCount FROM cast_crew_members "+customWhereCondition
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        customWhereCondition += " ORDER BY cast_crew_members.cast_crew_member_id DESC limit ? offset ?"
        let sqlQuery = "SELECT cast_crew_members.* FROM cast_crew_members " + customWhereCondition
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }

    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)

    
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render("admin/movies/cast-crew", { paggingData:paggingData,totalCount:totalCount, results: results, title: "Manage Cast & Crew Members", nav: url })

}
exports.createCastncrew = async (req, res) => {
    const cast_crew_id = req.params.id
    let existingCastnCrew = {}
    //if exists means req from edit page
    if (req.imageError) {
        res.send({ "errors": { 'file': "Error Uploading file." } })
        return
    }
    if (cast_crew_id) {
        await castncrewModel.findById(cast_crew_id, req, res).then(result => {
            existingCastnCrew = result
        }).catch(() => {

        });
    } else {
        if (!req.fileName && req.checkImage) {
            res.send({ "errors": { 'file': "Please select file." } })
            return
        }
    }
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    var fields = forms.fields;
    var widgets = forms.widgets;
   
    var reg_form = forms.create({
        name: fields.string({
            label: "Name",
            required: true,
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: existingCastnCrew.name
        }),
        biography: fields.string({
            label: "Biography",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.textarea({ "classes": ["form-control"] }),
            value: existingCastnCrew.biography
        }),
        birthdate: fields.string({
            label: "Birth Date",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: existingCastnCrew.birthdate
        }),
        gender: fields.string({
            label: "Artist Gender",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: existingCastnCrew.gender
        }),
        deathdate: fields.string({
            label: "Death Date",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: existingCastnCrew.deathdate
        }),
        birthplace: fields.string({
            label: "Birth Place",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: existingCastnCrew.birthplace
        }),

        file: fields.string({
            label: "Upload Photo",
            cssClasses: { "field": ["form-group"] },
            widget: formFunctions.file({ name: "file", value: existingCastnCrew.image ? req.appSettings.imageSuffix + existingCastnCrew.image : "" }),

        })
    }, { validatePastFirstError: true });
    reg_form.handle(req, {
        success: function (form) {
            delete form.data["file"]
            if (req.fileName) {
                form.data["image"] = "/upload/images/movies/cast-crew/" + req.fileName
            }
            if (existingCastnCrew.image && req.fileName) {
                commonFunctions.deleteImage(req, res, existingCastnCrew.image, "cast-crew/movie")
            }
            if (!cast_crew_id) {
                form.data['custom_url'] = uniqid.process('cc')
                globalModel.create(req, form.data, 'cast_crew_members').then(() => {
                })
            } else
                globalModel.update(req, form.data, 'cast_crew_members', 'cast_crew_member_id', cast_crew_id)

            res.send({ success: 1, message: "Operation performed successfully.", url: process.env.ADMIN_SLUG + "/movies/cast-crew" })
        },
        error: function (form) {
            const errors = formFunctions.formValidations(form);
            res.send({ errors: errors });
        },
        other: function () {
            res.render('admin/movies/cast-crew/create', { nav: url, reg_form: reg_form, title: (!cast_crew_id ? "Add" : "Edit") + " Cast & Crew Member" });
        }
    });
}

exports.deleteCastncrew = async (req, res) => {
    const id = req.params.id
    let existingCastnCrew = {}

    if (id) {
        await castncrewModel.findById(id, req, res).then(result => {
            existingCastnCrew = result
        }).catch(() => {

        });
    }

    if (existingCastnCrew.image) {
        commonFunctions.deleteImage(req, res, existingCastnCrew.image, "")
    }

    globalModel.delete(req, "cast_crew_members", "cast_crew_member_id", id).then(() => {
        globalModel.delete(req, "cast_crew", "cast_crew_member_id", id).then(() => {
            
        })
        res.redirect(process.env.ADMIN_SLUG + "/movies/cast-crew/")
    })

}
exports.getGalleries = async(req,res,next) => {
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }

    let cast_crew_id = req.params.cast_crew_id
    let artists = {}
    await globalModel.custom(req, "SELECT * FROM cast_crew_members where cast_crew_member_id = ?", [cast_crew_id]).then(result => {
        if(result && result[0])
            artists = result[0]
    })

    if(!cast_crew_id || Object.keys(artists) < 1){
        next()
        return
    }
    
    const query = { ...req.query }
    let conditionalWhere = ""
    let condition = []

    condition.push(cast_crew_id)
    conditionalWhere += " where resource_id = ? AND resource_type = 'cast_crew'"

    let results = []
    let totalCount = 0

    let sql = "SELECT COUNT(*) as totalCount FROM photos " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY photos.photo_id DESC limit ? offset ?"
        let sqlQuery = "SELECT photos.* FROM photos " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }

    const paggingData = pagging.create(req, totalCount, page, '', LimitNum,cast_crew_id+"/")

    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render('admin/movies/cast-crew/gallery', { loggedin_id: (req.user ? req.user.user_id : ""),artists:artists, totalCount: totalCount, query: query, nav: url, results: results, title: "Manage "+artists.name+" Gallery Photos", paggingData: paggingData });

}
exports.createGallery = async(req,res) => {
    const cast_crew_id = req.params.cast_crew_id
    const photo_id = req.params.id
    let castnCrew = {}
    await globalModel.custom(req, "SELECT * FROM cast_crew_members where cast_crew_member_id = ?", [cast_crew_id]).then(result => {
        if(result && result[0])
        castnCrew = result[0]
    })

    let existingPhoto = {}
   
    //if exists means req from edit page
    if (req.imageError) {
        res.send({ "errors": { 'file': "Error Uploading file." } })
        return
    }

    if (photo_id) {
        await globalModel.custom(req, "SELECT * FROM photos where photo_id = ?", [photo_id]).then(result => {
            if(result && result[0])
            existingPhoto = result[0]
        })
    } else {
        if (!req.fileName && req.checkImage) {
            res.send({ "errors": { 'file': "Please select file." } })
            return
        }
    }
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    var fields = forms.fields;
    var widgets = forms.widgets;
   
    var reg_form = forms.create({
        name: fields.string({
            label: "Title",
            required: false,
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: existingPhoto.name
        }),
        // description: fields.string({
        //     label: "Description",
        //     cssClasses: { "field": ["form-group"] },
        //     widget: widgets.textarea({ "classes": ["form-control"] }),
        //     value: existingPhoto.description
        // }),
        file: fields.string({
            label: "Upload Photo",
            cssClasses: { "field": ["form-group"] },
            widget: formFunctions.file({ name: "file", value: existingPhoto.image ? req.appSettings.imageSuffix + existingPhoto.image : "" }),

        })
    }, { validatePastFirstError: true });
    reg_form.handle(req, {
        success: function (form) {
            delete form.data["file"]
            if (req.fileName) {
                form.data["image"] = "/upload/images/cast-crew/gallery/" + req.fileName
            }
            form.data["resource_id"] = castnCrew.cast_crew_member_id
            form.data.resource_type = "cast_crew"
            if (existingPhoto.image && req.fileName) {
                commonFunctions.deleteImage(req, res, existingPhoto.image, "artist/cast-crew/photo")
            }
            if (!photo_id) {
                
                globalModel.create(req, form.data, 'photos').then(() => {})
            } else
                globalModel.update(req, form.data, 'photos', 'photo_id', photo_id)

            res.send({ success: 1, message: "Operation performed successfully.", url: process.env.ADMIN_SLUG + "/movies/cast-crew/gallery/"+castnCrew.cast_crew_member_id })
        },
        error: function (form) {
            const errors = formFunctions.formValidations(form);
            res.send({ errors: errors });
        },
        other: function () {
            res.render('admin/movies/cast-crew/createphoto', { nav: url, reg_form: reg_form, title: (!cast_crew_id ? "Add " : "Edit ") + castnCrew.name +" Photos" });
        }
    });
}
exports.deleteGallery = async(req,res) => {
    const id = req.params.id
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/movies";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    await globalModel.custom(req,"DELETE FROM photos WHERE photo_id = ?",[id]).then(() => {
        res.redirect(backURL)
        return
    })
}
exports.soldMovies = async (req,res) => {
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
        conditionalWhere += " AND LOWER(movies.title) LIKE CONCAT('%', ?,  '%')"
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

    let sql = "SELECT COUNT(*) as totalCount FROM transactions INNER JOIN movies on movies.movie_id = transactions.id LEFT JOIN users on users.user_id = transactions.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' AND (transactions.state = 'approved' || transactions.state = 'completed' || transactions.state = 'active') AND ( transactions.type IN ('rent_series_purchase','purchase_series_purchase','rent_movie_purchase','purchase_movie_purchase')  ) " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY transactions.transaction_id DESC limit ? offset ?"
        let sqlQuery = "SELECT transactions.*,userdetails.username,userdetails.displayname,movies.title as movieTitle,movies.custom_url as movie_url,transactions.price as amount FROM transactions INNER JOIN movies on movies.movie_id = transactions.id INNER JOIN users on users.user_id = transactions.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id  WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' AND (transactions.state = 'approved' || transactions.state = 'completed' || transactions.state = 'active') AND transactions.type IN ('rent_series_purchase','purchase_series_purchase','rent_movie_purchase','purchase_movie_purchase')  " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }

    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    res.render('admin/movies/sold-movies', { loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Sold Movies & Series", paggingData: paggingData });

}
exports.deleteSoldMovies = async(req,res) => {
    const id = req.params.id
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/movies";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    await globalModel.custom(req,"DELETE FROM transactions WHERE transaction_id = ?",[id]).then(() => {
        res.redirect(backURL)
        return
    })
}


exports.changeOrder = async (req, res) => {
    const id = req.body.id
    const nextid = req.body.nextid
    let order = req.body.articleorder
    order = order.split(',')
    if (id || nextid) {
        let categoryData = {}
        await globalModel.custom(req, "SELECT * from categories WHERE category_id = ?", [id]).then(result => {
            categoryData = JSON.parse(JSON.stringify(result));
            categoryData = categoryData[0]
        })

        let categoryType = "", categoryTypeId = ""
        if (categoryData.subcategory_id != 0) {
            categoryType = 'subcategory_id'
            categoryTypeId = categoryData.subcategory_id
        } else if (categoryData.subsubcategory_id != 0) {
            categoryType = 'subsubcategory_id'
            categoryTypeId = categoryData.subsubcategory_id
        } else
            categoryType = 'category_id';

        let categories = []
        if (categoryTypeId) {
            await globalModel.custom(req, "SELECT category_id FROM categories WHERE show_movies = 1 AND " + categoryType + " = ?", [categoryTypeId]).then(results => {
                Object.keys(results).forEach(function (key) {
                    let result = JSON.parse(JSON.stringify(results[key]))
                    categories.push(result.category_id.toString())
                })
            })
        } else {
            await globalModel.custom(req, "SELECT category_id FROM categories WHERE show_movies = 1 AND  subcategory_id = 0 AND subsubcategory_id = 0").then(results => {
                Object.keys(results).forEach(function (key) {
                    let result = JSON.parse(JSON.stringify(results[key]))
                    categories.push(result.category_id.toString())
                })
            })
        }
        const newOrder = order.filter(Set.prototype.has, new Set(categories))
        let orderIndex = newOrder.length + 1
        newOrder.forEach(cat => {
            orderIndex = orderIndex - 1;
            globalModel.custom(req, "UPDATE categories SET `order` = " + orderIndex + " WHERE category_id = " + cat).then(() => {
            })
        })

    }

    res.send(req.body)
}

exports.deleteCategories = async (req, res) => {
    let category_id = req.params.category_id
    let categoryData = {}
    await globalModel.custom(req, "SELECT * from categories WHERE category_id = ?", [category_id]).then(result => {
        categoryData = JSON.parse(JSON.stringify(result));
        categoryData = categoryData[0]
        if (categoryData.subsubcategory_id == 0) {
            if (categoryData.subcategory_id != 0) {
                //select all subsubcategory_id
                globalModel.custom(req, "SELECT * from categories WHERE subsubcategory_id = ?", [categoryData.category_id]).then(result => {
                    result.forEach(cat => {
                        if (cat.image) {
                            commonFunctions.deleteImage(req, res, cat.image, "movies/category")
                        }
                        globalModel.custom(req, "UPDATE movies SET subsubcategory_id = 0 WHERE subsubcategory_id = ?", [cat.category_id])
                    })
                    globalModel.custom(req, "DELETE from categories WHERE subsubcategory_id = ?", [categoryData.category_id]);
                })
            } else {
                //select all subcategory_id
                globalModel.custom(req, "SELECT * from categories WHERE subcategory_id = ?", [categoryData.category_id]).then(result => {
                    result.forEach(cat => {
                        globalModel.custom(req, "SELECT * from categories WHERE subsubcategory_id = ?", [cat.category_id]).then(result => {
                            result.forEach(cat => {
                                if (cat.image) {
                                    commonFunctions.deleteImage(req, res, cat.image, "movies/category")
                                }
                                globalModel.custom(req, "UPDATE movies SET subsubcategory_id = 0 WHERE subsubcategory_id = ?", [cat.category_id])
                            })
                            globalModel.custom(req, "DELETE from categories WHERE subsubcategory_id = ?", [cat.category_id]);
                        })
                        if (cat.image) {
                            commonFunctions.deleteImage(req, res, cat.image, "movies/category")
                        }
                        globalModel.custom(req, "UPDATE movies SET subcategory_id = 0 WHERE subcategory_id = ?", [cat.category_id])
                    })
                    globalModel.custom(req, "DELETE from categories WHERE subcategory_id = ?", [categoryData.category_id]);
                })
            }
        }
    })
    if (categoryData.image) {
        commonFunctions.deleteImage(req, res, categoryData.image, "movies/category")
    }
    await globalModel.delete(req, "categories", "category_id", category_id).then(() => {
        res.redirect(process.env.ADMIN_SLUG + "/movies/categories")
    })
}

exports.categories = async (req, res) => { 
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    //get all categories
    const categories = []
    await categoryModel.findAll(req, { type: "movie" }).then(result => {
        result.forEach(function (doc) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0) {
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })
   
    res.render('admin/movies/categories', {  nav: url, title: "Manage Movies & Series Categories", categories: categories });
}

exports.addCategories = async (req, res) => {
    let category_id = req.params.category_id
    let categoryData = {}
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    if (category_id) {

        await categoryModel.findById(category_id, req, res).then(result => {
            if (result) {
                categoryData = result
            } else {
                res.redirect(process.env.ADMIN_SLUG + "/error")
            }
        })
    }
    
    if (Object.keys(req.body).length === 0 && category_id) {
        res.render("admin/movies/editCategories", {  category_id: category_id, categoryData: categoryData, nav: url, title: "Edit Movie Category" })
        return
    }

    if (req.imageError) {
        res.send({ 'imageError': true })
        return
    }

    categoryData['title'] = req.body.category_name;
    categoryData['slug'] = req.body.slug
    let cat_id = req.body.parent

    if (category_id && categoryData.image && req.fileName) {
        //remove image
        commonFunctions.deleteImage(req, res, categoryData.image, "movies/category")
    }
    if (req.fileName) {
        categoryData["image"] = "/upload/images/categories/movies/" + req.fileName
    }
    let slugExists = false
    await categoryModel.findAll(req, { slug: req.body.slug, type: "movie", category_id: category_id }).then(result => {
        if (result && result.length > 0) {
            slugExists = true
        }
    })
    if (slugExists) {
        res.send({ 'slugError': true })
        return
    }
    let parentId = 0, seprator = "", tableSeprator = "", data = ""
    if (!category_id) {

        if (cat_id != -1) {
            let catData = {}
            await categoryModel.findById(cat_id, req, res).then(result => {
                catData = result
            })
            if (catData.subcategory_id == 0) {
                categoryData['subcategory_id'] = cat_id;
                seprator = '&nbsp;&nbsp;&nbsp;';
                tableSeprator = '-&nbsp;';
                parentId = cat_id;
                await categoryModel.orderNext(req, res, { 'subcat_id': cat_id }).then(result => {
                    categoryData['order'] = result ? result : 1
                })
            } else {
                categoryData['subsubcategory_id'] = cat_id;
                seprator = '3';
                tableSeprator = '--&nbsp;';
                await categoryModel.orderNext(req, res, { 'subsubcat_id': cat_id }).then(result => {
                    categoryData['order'] = result ? result : 1
                })
                parentId = cat_id;
            }
        } else {
            parentId = 0;
            seprator = '';
            await categoryModel.orderNext(req, res, { 'category_id': true }).then(result => {
                categoryData['order'] = result ? result : 1
            })
            tableSeprator = '';
        }
        categoryData["show_movies"] = 1;
    }
    //create category
    let id = ""
    if (!category_id) {
        await globalModel.create(req, categoryData, "categories").then(category => {
            id = category.insertId;
        })
        if (req.fileName) {
            data = '<img  style="height: 50px;width:50px;margin-bottom: 10px;"  src="' + categoryData["image"] + '" />';
        } else {
            data = "---";
        }

        let editCat = '<a class="btn btn-primary btn-xs" href="' + process.env.ADMIN_SLUG + '/movies/categories/add/' + id + '">Edit</a>';
        let deleteCat = ' <a class="btn btn-danger btn-xs" onclick="preDeleteFn(this)" data-id="' + id + '" data-toggle="modal" data-target="#modal-danger">Delete</a>'
        let tableData = '<tr id="categoryid-' + id + '"><td>' + data + '</td><td>' + tableSeprator + req.body.category_name + '<div class="hidden" style="display:none" id="inline_' + id + '"><div class="parent">' + parentId + '</div></div></td><td>' + req.body.slug + '</td><td>' + editCat + deleteCat + '</td></tr>';
        res.send({ 'seprator': seprator, 'tableData': tableData, 'id': id, 'name': req.body.category_name, 'slugError': false })
    } else {
        await globalModel.update(req, categoryData, "categories", "category_id", category_id).then(() => {

            res.send({ success: true })
        })

    }
}

exports.levels = async (req, res) => {
    let level_id = req.params.level_id
    
    let memberLevels = {}
    let flag = ""
    let type = "user"
    await levels.findAll(req, req.query).then(result => {
        if (result) {
            result.forEach(res => {
                if ((!level_id && res.flag == "default")) {
                    level_id = res.level_id
                }
                if (res.level_id == level_id || (!level_id && res.flag == "default")) {
                    flag = res.flag
                    type = res.type
                }
                memberLevels[res.level_id] = res.title
            });
        }
    })
    const cacheContent = await permission.getKeyValue(req, level_id)
    //get uploaded file by admin
    const files = { "": "" }

    await fileManager.findAll(req, { "column": "path", "like": "image" }).then(result => {
        result.forEach(res => {
            files[res.path] = res.orgName
        });
    })

    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;

    const deleteOptions = {}
    const viewOptions = {}
    const editOptions = {}
    if (type == "admin" || type == "moderator") {
        deleteOptions["2"] = "Yes, allow to delete other users movies."
        viewOptions["2"] = "Yes, allow to view private and locked movies of users."
        editOptions["2"] = "Yes, allow to edit everyones movies."
    }
    viewOptions["0"] = "No, do not allow to view movies."
    viewOptions["1"] = "Yes, allow to view movies."

    deleteOptions["1"] = "Yes, allow to delete own movies."
    deleteOptions["0"] = "No, do not allow to delete movies."

    editOptions["1"] = "Yes, allow to edit own movies."
    editOptions["0"] = "No, do not edit movies."

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
                create: fields.string({
                    choices: {"1" : "Yes, allow to upload movies","0" : "No, do not allow to upload movies"},
                   widget: widgets.select({ "classes": ["select"] }),
                    label:"Allow member to upload movies",
                    fieldsetClasses:"form_fieldset",
                    cssClasses: {"field" : ["form-group"]},
                    value:cacheContent["movie.create"] ? cacheContent["movie.create"].toString() : 1
                })
            }
            formFields = {...formFields,...formFieldsPublic}
    }

    let formFieldsView = {
        view: fields.string({
            choices: viewOptions,
            widget: widgets.select({ "classes": ["select"] }),
            label: "Can Member view uploaded movies?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: cacheContent["movie.view"] ? cacheContent["movie.view"].toString() : 1
        }),

    }
    formFields = { ...formFields, ...formFieldsView }



    if (flag != "public") {
        let formFields1 = {
            edit: fields.string({
                choices: editOptions,
                widget: widgets.select({ "classes": ["select"] }),
                label: "Can Member edit uploaded movies?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.edit"] ? cacheContent["movie.edit"].toString() : 1
            }),
            delete: fields.string({
                choices: deleteOptions,
                widget: widgets.select({ "classes": ["select"] }),
                label: "Can Member delete uploaded movies?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.delete"] ? cacheContent["movie.delete"].toString() : 1
            }),
            quota: fields.string({
                label: "No. Of movies member can upload to selected level? Enter 0 for unlimited",
                validators: [validators.integer('Enter integer value only.')],
                cssClasses: { "field": ["form-group"] },
                widget: widgets.text({ "classes": ["form-control"] }),
                value: cacheContent["movie.quota"] ? cacheContent["movie.quota"].toString() : 0
            }),
            storage: fields.string({
                label: "Movies Storage Limit",
                choices: { "1048576": "1 MB", "5242880": "5 MB", "26214400": "25 MB", "52428800": "50 MB", "104857600": "100 MB", "524288000": "50 MB", "1073741824": "1 GB", "2147483648": "2 GB", "5368709120": "5 GB", "10737418240": "10 GB", "0": "Unlimited" },
                required: true,
                widget: widgets.select({ "classes": ["select"] }),
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.storage"] ? cacheContent["movie.storage"].toString() : 0
            }),
            
            embedcode: fields.string({
                choices: { "1": "Yes", "0": "No" },
                widget: widgets.select({ "classes": ["select"] }),
                label: "Do you want to allow Embed Code?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.embedcode"] ? cacheContent["movie.embedcode"].toString() : 0
            }),
            sponsored: fields.string({
                choices: { "1": "Yes", "0": "No" },
                widget: widgets.select({ "classes": ["select"] }),
                label: "Do you want to auto mark Movies as Sponsored?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.sponsored"] ? cacheContent["movie.sponsored"].toString() : 1
            }),
            featured: fields.string({
                choices: { "1": "Yes", "0": "No" },
                widget: widgets.select({ "classes": ["select"] }),
                label: "Do you want to auto mark Movies as Featured?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.featured"] ? cacheContent["movie.featured"].toString() : 1
            }),
            hot: fields.string({
                choices: { "1": "Yes", "0": "No" },
                widget: widgets.select({ "classes": ["select"] }),
                label: "Do you want to auto mark Movies as Hot?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.hot"] ? cacheContent["movie.hot"].toString() : 1
            }),


            auto_approve: fields.string({
                choices: { "1": "Yes", "0": "No" },
                widget: widgets.select({ "classes": ["select"] }),
                label: "Do you want to auto approve movies?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.auto_approve"] ? cacheContent["movie.auto_approve"].toString() : 1
            }),
            // donation: fields.string({
            //     choices: { "1": "Yes", "0": "No" },
            //     widget: widgets.select({ "classes": ["select"] }),
            //     label: "Do you want to enable donation on uploaded movies?",
            //     fieldsetClasses: "form_fieldset",
            //     cssClasses: { "field": ["form-group"] },
            //     value: cacheContent["movie.donation"] ? cacheContent["movie.donation"].toString() : 1
            // }),
            sell_movies: fields.string({
                choices: { "1": "Yes", "0": "No" },
                widget: widgets.select({ "classes": ["select"] }),
                label: "Do you want to allow member to sell uploaded movies?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.sell_movies"] ? cacheContent["movie.sell_movies"].toString() : 1
            }),
            sell_rent_movies: fields.string({
                choices: { "1": "Yes", "0": "No" },
                widget: widgets.select({ "classes": ["select"] }),
                label: "Do you want to allow members to sell movies on rent?",
                fieldsetClasses: "form_fieldset",
                cssClasses: { "field": ["form-group"] },
                value: cacheContent["movie.sell_rent_movies"] ? cacheContent["movie.sell_rent_movies"].toString() : 1
            }),
        }
        formFields = { ...formFields, ...formFields1 }
    }
    var reg_form = forms.create(formFields, { validatePastFirstError: true });
    reg_form.handle(req, {
        success: function (form) {
            permission.insertUpdate(req, res, form.data, level_id, "movie").then(() => {
                res.send({ success: 1, message: "Operation performed successfully.", url: process.env.ADMIN_SLUG + "/movies/levels/" + level_id })
            })
        },
        error: function (form) {
            const errors = formFunctions.formValidations(form);
            res.send({ errors: errors });
        },
        other: function () {
            res.render('admin/movies/levels', { nav: url, reg_form: reg_form, title: "Movies Member Role Settings" });
        }
    });
}

exports.settings = async (req, res) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    var fields = forms.fields;
    var validators = forms.validators;
    var widgets = forms.widgets;


    //get uploaded file by admin
    const files = { "": "" }

    await fileManager.findAll(req, { "column": "path", "like": "image" }).then(result => {
        result.forEach(res => {
            files[res.path] = res.orgName
        });
    })

    let allLaguages = await languageModel.spokenLanguages()

    let languages = {}
    allLaguages.forEach(language => {
        languages[language.code] = language.name
    })

    var reg_form = forms.create({
        enable_movie: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Do you want to enable movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "enable_movie", '0').toString()
        }),
       
        movie_tmdb_api_key: fields.string({
            label: "TMDB API Key",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: req.loguserallowed ? "****" : settings.getSetting(req, "movie_tmdb_api_key", '')
        }),

        movie_tmdb_language: fields.string({
            label: "TMDB Language",
            choices: languages,
            required: false,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_tmdb_language", "en").toString()
        }),
        movie_tmdb_language_label: fields.string({
            widget: widgets.label({ content: 'In what language should content be fetched from TMDB.' }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        movie_tmdb_owner: fields.string({
            widget: widgets.text({ "classes": ["form-control"] }),
            label: "Enter Owner ID which you want to associate for impoted movies/series?",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_tmdb_owner", '1').toString()
        }),
        movie_tmdb_adult: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Allow Adult Content to fetched from TMDB?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_tmdb_adult", '0').toString()
        }),


        multiple_movies_series: fields.string({
            widget: formFunctions.makeClickable({ content: '[0] to learn how to import movies/series in bulk.', replace: [{ 0: '<a href="javascript:;" data-toggle="modal" data-target="#modal-tmdb">Click here</a>' }] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        
        movie_upload_movies_type: fields.string({
            label: "Select videos conversion types from below upload types",
            choices: { "360": "360p", "480": "480p",'720':"720p","1080":"1080p","2048":"2048p","4096":"4096p" },
            cssClasses: { "field": ["form-group"] },
            widget: widgets.multipleCheckbox({ "classes": ["form-control-checkbox"] }),
            value:  settings.getSetting(req, "movie_upload_movies_type", '').split(",")
        }),
        movie_upload_movies_type_label: fields.string({
            widget: widgets.label({ content: 'Choose from above setting in which format you want to upload movies & series videos on your website. If you enable higher resolution movies than your server must be that much capable to convert those resolution movies.' }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),



        movie_conversion_type: fields.string({
            label: "Convert movies & series video speed",
            choices: { "ultrafast": "Ultrafast", "superfast": "Superfast",'veryfast':"Veryfast",'faster':"Faster",'fast':"Fast",'medium':"Medium",'slow':"Slow",'slower':"Slower",'veryslow':"Veryslow" },
            widget: widgets.select({ "classes": ["select"] }),
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_conversion_type", 'ultrafast')
        }),

        movie_conversion_type_label: fields.string({
            widget: widgets.label({ content: 'Using a slower preset gives you better compression, or quality per filesize, whereas faster presets give you worse compression and higher filesize.' }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        // movie_player_type: fields.string({
        //     choices: { "videojs": "Video JS Player", "element": "Media Element JS Player" },
        //     widget: widgets.select({ "classes": ["select"] }),
        //     label: "Video Player",
        //     fieldsetClasses: "form_fieldset",
        //     cssClasses: { "field": ["form-group"] },
        //     value: settings.getSetting(req, "movie_player_type", 'element').toString()
        // }),
        movie_process_type: fields.string({
            label: "Max Processes Allowed",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "movie_process_type", '1')
        }),
        movie_process_type_label: fields.string({
            widget: widgets.label({ content: 'How many videos can be converted at the same time? Leave 0 for unlimited.' }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        
        movie_upload_limit: fields.string({
            label: "Maximum Upload Limit of video in movies & series. Enter value in MB (Enter 0 for unlimited.)",
            validators: [validators.integer('Enter integer value only.')],
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "movie_upload_limit", '0')
        }),


        // movie_advanced_grid: fields.string({
        //     choices: { "1": "Yes", "0": "No" },
        //     widget: widgets.select({ "classes": ["select"] }),
        //     label: "Show movies/series advanced grid on browse pages",
        //     fieldsetClasses: "form_fieldset",
        //     cssClasses: { "field": ["form-group"] },
        //     value: settings.getSetting(req, "movie_advanced_grid", '0').toString()
        // }),
        movie_favourite: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable Favourite feature on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_favourite", '1').toString()
        }),
        // movie_donation: fields.string({
        //     choices: { "1": "Yes", "0": "No" },
        //     widget: widgets.select({ "classes": ["select"] }),
        //     label: "Enable donation feature on movies & series?",
        //     fieldsetClasses: "form_fieldset",
        //     cssClasses: { "field": ["form-group"] },
        //     value: settings.getSetting(req, "movie_donation", '1').toString()
        // }),
        // movie_donation_label: fields.string({
        //     widget: widgets.label({ content: 'Enabling this feature user can request for donation on uploaded movies' }),
        //     cssClasses: { "field": ["form-group", "form-description"] },
        // }),
        movie_sell: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Allow user to sell movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_sell", '1').toString()
        }),
        movie_commission_type: fields.string({
            choices: { "1": "Fixed Price", "2": "Percentage" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Commission Type of sell movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_commission_type", '1').toString()
        }),
        movie_commission_value: fields.string({
            label: "Get Commission from sell movies & series (put 0 if you not want comission.)",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "movie_commission_value", '')
        }),

        movie_rent: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Allow user to rent movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_rent", '1').toString()
        }),
        movie_commission_rent_type: fields.string({
            choices: { "1": "Fixed Price", "2": "Percentage" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Commission Type of rent movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_commission_rent_type", '1').toString()
        }),
        movie_commission_rent_value: fields.string({
            label: "Get Commission from rent movies & series (put 0 if you not want comission.)",
            cssClasses: { "field": ["form-group"] },
            widget: widgets.text({ "classes": ["form-control"] }),
            value: settings.getSetting(req, "movie_commission_rent_value", '')
        }),

        movie_watchlater: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable Watch Later Feature on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_watchlater", '1').toString()
        }),
        movie_like: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable like feature on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_like", '1').toString()
        }),
        movie_dislike: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable dislike feature on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_dislike", '1').toString()
        }),

        movie_comment: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable comment feature on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_comment", '1').toString()
        }),

        movie_comment_like: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable like feature on movies & series comment?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_comment_like", '1').toString()
        }),

        movie_comment_dislike: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable dislike feature on movies & series comment?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_comment_dislike", '1').toString()
        }),

        movie_rating: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable rating feature on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_rating", '1').toString()
        }),

        movie_featured: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable featured label on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_featured", '1').toString()
        }),

        movie_sponsored: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable sponsored label on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_sponsored", '1').toString()
        }),

        movie_hot: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable hot label on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_hot", '1').toString()
        }),



        movie_adult: fields.string({
            choices: { "1": "Yes", "0": "No" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable adult marking on movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_adult", '1').toString()
        }),
        movie_default_photo: fields.string({
            label: "Default Photo on movies & series",
            choices: files,
            required: false,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_default_photo", "").toString()
        }),
        episode_default_photo: fields.string({
            label: "Default Photo on Episode",
            choices: files,
            required: false,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "episode_default_photo", "").toString()
        }),
        seasons_default_photo: fields.string({
            label: "Default Photo on Seasons",
            choices: files,
            required: false,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "seasons_default_photo", "").toString()
        }),
        movie_category_default_photo: fields.string({
            label: "Default Photo on movies & series Category",
            choices: files,
            required: false,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "movie_category_default_photo", "").toString()
        }),
        cast_crew_default_photo: fields.string({
            label: "Default Photo on Cast & Crew Members",
            choices: files,
            required: false,
            widget: widgets.select({ "classes": ["select"] }),
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_default_photo", "").toString()
        }),

        movie_cnt_label: fields.string({
            widget: formFunctions.makeClickable({ content: '<h2 style="text-align: center;margin: 40px;text-decoration: underline;">Movie Cast & Crew Members Settings</h2>', replace: [] }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),

        cast_crew_member: fields.string({
            choices: { "1": "Enabled", "0": "Disabled" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable Cast & Crew functionality in movies & series?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_member", '1').toString()
        }),

        cast_crew_member_label: fields.string({
            widget: widgets.label({ content: 'If you enable this feature then user are able to select Cast & Crew in the movies & series.' }),
            cssClasses: { "field": ["form-group", "form-description"] },
        }),
        cast_crew_member_rating: fields.string({
            choices: { "1": "Enabled", "0": "Disabled" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable rating functionality in Cast & Crew?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_member_rating", '1').toString()
        }),
        cast_crew_member_favourite: fields.string({
            choices: { "1": "Enabled", "0": "Disabled" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable favourite feature on Cast & Crew?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_member_favourite", '1').toString()
        }),

        cast_crew_member_like: fields.string({
            choices: { "1": "Enabled", "0": "Disabled" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable like feature on Cast & Crew?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_member_like", '1').toString()
        }),
        cast_crew_member_dislike: fields.string({
            choices: { "1": "Enabled", "0": "Disabled" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable dislike feature on Cast & Crew?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_member_dislike", '1').toString()
        }),

        cast_crew_member_comment: fields.string({
            choices: { "1": "Enabled", "0": "Disabled" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable comment feature on Cast & Crew?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_member_comment", '1').toString()
        }),

        cast_crew_member_comment_like: fields.string({
            choices: { "1": "Enabled", "0": "Disabled" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable like feature on comment in Cast & Crew?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_member_comment_like", '1').toString()
        }),

        cast_crew_member_comment_dislike: fields.string({
            choices: { "1": "Enabled", "0": "Disabled" },
            widget: widgets.select({ "classes": ["select"] }),
            label: "Enable dislike feature on comment Cast & Crew?",
            fieldsetClasses: "form_fieldset",
            cssClasses: { "field": ["form-group"] },
            value: settings.getSetting(req, "cast_crew_member_comment_dislike", '1').toString()
        }),

    }, { validatePastFirstError: true });
    reg_form.handle(req, {
        success: function (form) {

            if(form.data['movie_commission_type'] == "1"){
                if(parseFloat(form.data['movie_commission_value']) < 0){
                    res.send({ "errors": { 'movie_commission_value': "Please enter valid value." } })
                    return
                }
            }else if(form.data['movie_commission_type'] == "2"){
                if(parseFloat(form.data['movie_commission_value']) > 99.99 || parseFloat(form.data['movie_commission_value']) < 0){
                    //error
                    res.send({ "errors": { 'movie_commission_value': "Please enter valid value." } })
                    return
                }
            }

            if(form.data['movie_commission_rent_type'] == "1"){
                if(parseFloat(form.data['movie_commission_rent_value']) < 0){
                    res.send({ "errors": { 'movie_commission_rent_value': "Please enter valid value." } })
                    return
                }
            }else if(form.data['movie_commission_rent_type'] == "2"){
                if(parseFloat(form.data['movie_commission_rent_value']) > 99.99 || parseFloat(form.data['movie_commission_rent_value']) < 0){
                    //error
                    res.send({ "errors": { 'movie_commission_rent_value': "Please enter valid value." } })
                    return
                }
            }


            delete form.data["movie_upload_label"]
            delete form.data["movie_tmdb_language_label"]
            delete form.data["multiple_movies_series"]

                        
            delete form.data["movie_ffmpeg_path_label"]
            delete form.data["movie_donation_label"]
            delete form.data["cast_crew_member_label"]
            delete form.data["artist_cnt_label"]
            form.data['movie_commission_value'] = parseFloat(form.data['movie_commission_value'])
            settings.setSettings(req, form.data)
            res.send({ success: 1, message: "Setting Saved Successfully." })
        },
        error: function (form) {
            const errors = formFunctions.formValidations(form);
            res.send({ errors: errors });
        },
        other: function () {
            res.render('admin/movies/settings', { nav: url, reg_form: reg_form, title: "Movies & Series Settings" });
        }
    });
}




