const NodeCache = require("node-cache");
const myCache = new NodeCache();
const dateTime = require("node-datetime")
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const globalModel = require("../../models/globalModel")
const pagging = require("../../functions/pagging")

exports.downloadBackup = async(req,res,next) => {
    let id = req.params.id;
    let fileType = req.params.type
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/backups";
    let backup = {}
    await globalModel.custom(req,"SELECT * from backups WHERE backup_id = ?",[id]).then(result => {
        backup = JSON.parse(JSON.stringify(result));
        backup = backup[0]
    })
    if(!backup || !fileType) {
       return res.redirect(backURL)
    }
    //zip/sql
    let fileName = "mysql_backup.sql";
    if(fileType == "zip"){
        fileName = "script_backup.zip";
    }
    const file = `${req.serverDirectoryPath}/../backups/${backup.dirname}/${fileName}`;
    res.download(file); 
}
exports.deleteBackup = async(req,res,next,backup_id = null) => {
    let id = backup_id ? backup_id : req.params.id;
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG + "/backups";
    if (!id || !req.user) {
        res.redirect(backURL)
        return
    }
    let backup = {}
    await globalModel.custom(req,"SELECT * from backups WHERE backup_id = ?",[id]).then(result => {
        backup = JSON.parse(JSON.stringify(result));
        backup = backup[0]
    })

    if(backup.dirname){
        fs.rmSync(req.serverDirectoryPath+"/../backups/"+backup.dirname, { recursive: true, force: true });
        await globalModel.custom(req, 'DELETE FROM backups WHERE backup_id = ?', [id]).then(async result => {});
    }
   
    if(!backup_id){
        res.redirect(backURL)
        return
    }
}
exports.backups = async(req,res,next) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await exports.deleteBackup(req,res,next,ids[i]).then(result => {})
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
    let conditionalWhere = " "
    let condition = []

    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM backups" + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY backups.backup_id DESC limit ? offset ?"
        let sqlQuery = "SELECT backups.* FROM backups  " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');

    res.render('admin/backups/index', { loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Backups", paggingData: paggingData });
    
}
var makeDirectory = function(dirPath, mode, callback) {
    //Call the standard fs.mkdir
    fs.mkdir(dirPath, mode, function(error) {
      //When it fail in this way, do the custom steps
      if (error && error.errno === 34) {
        //Create all the parents recursively
        fs.mkdirParent(path.dirname(dirPath), mode, callback);
        //And then the directory
        fs.mkdirParent(dirPath, mode, callback);
      }
      //Manually run the callback since we used our own callback to do all these
      callback && callback(error);
    });
  };

exports.db = async (mysqldump,wstream) => {
    await new Promise( function(resolve, reject) {
        mysqldump.stdout.on('error', (err) => {
            console.log(err)
            reject(2)
        }).pipe(wstream);
        wstream.on('finish', resolve(1));
        wstream.on('error', (err) => {
            console.log(err)
            reject(0)
        });
    });
}
exports.backup = async (req,res) => {
    let backup = 0
    await globalModel.custom(req,"SELECT * from backups WHERE active = ?",[0]).then(result => {
        let results = JSON.parse(JSON.stringify(result));
        if(results && results.length > 0)
        backup = 1
    })
    if(backup == 1){
        return res.send({error:1,message:"Already 1 backup is runing, please wait till it completes."});
    }
    let currentDate = dateTime.create().format("Y-m-d-H-M-S");
    let basePath = req.serverDirectoryPath+"/../backups/";
    let scriptPath = req.serverDirectoryPath+"/../"

    //check backup dir
    if(!fs.existsSync(basePath+currentDate)){
        makeDirectory(basePath+currentDate,'0777');
    }

    let backupID = 0
    //create entry for backup in database
    await globalModel.create(req, {dirname:currentDate,creation_date:dateTime.create().format("Y-m-d H:M:S"),active:0}, "backups").then(result => {
        backupID = result.insertId
    })

    //create database backup
    const wstream = fs.createWriteStream(basePath+currentDate + '/mysql_backup.sql');
    const spawn = require('child_process').spawn;
    let mysqlPath = process.env.MYSQLDUMP
    let options = [
        '-h',
        process.env.DBHOST,
        '-u',
        process.env.DBUSER,
        '-p'+process.env.DBPASSWORD,
        process.env.DBNAME
    ]
    if(!process.env.DBPASSWORD){
        options = [
            '-h',
            process.env.DBHOST,
            '-u',
            process.env.DBUSER,
            process.env.DBNAME
        ]
    }
    const mysqldump = spawn((mysqlPath?mysqlPath:"")+'mysqldump', options);
    
    await exports.db(mysqldump,wstream).then(result => {

    }).catch(err => {

    })

    const output = fs.createWriteStream(basePath+currentDate+"/script_backup.zip");
    const archive = archiver('zip', { zlib: { level: 9 } });
    // new Promise((resolve, reject) => {
        archive.pipe(output);
        //archive.directory(path,false);
        var fileNames = [
            '.babelrc',
            '.env',
            '.npmrc',
            'mysql_backup.sql',
            'app.js',
            'App.test.js',
            'axios-orders.js',
            'axios-site.js',
            'config.js',
            'i18n-server.js',
            'i18n.js',
            'next.config.js',
            'nodemon.json',
            'package.json',
            'package-lock.json',
            'playtubevideo.sql',
            'registerServiceWorker.js',
            'routes.js',
            'serviceWorker.js'
        ];
        var folderNames = [
            'build',
            'components',
            'config',
            'containers',
            'dist',
            'Documentation',
            'hoc',
            'install',
            'media-server',
            'pages',
            'public',
            'scripts',
            'server',
            'shared',
            'store',
            'temporary',
            'utils',
            'validators',
        ]
        for (i = 0; i < fileNames.length; i++) {
            if(fileNames[i] == "mysql_backup.sql"){
                var stream = fs.readFileSync(path.join(basePath+currentDate, fileNames[i]));
                archive.append(stream, { name: fileNames[i] });
            }else{
                var stream = fs.readFileSync(path.join(scriptPath, fileNames[i]));
                archive.append(stream, { name: fileNames[i] });
            }            
        }
        for (i = 0; i < folderNames.length; i++) {
            archive.directory(path.join(scriptPath, folderNames[i]), folderNames[i]);
        }
        output.on('close', (error) => {
            globalModel.update(req, { active: 1 }, "backups", "backup_id", backupID).then(async result => {});
        });
        output.on('error', (err) => {
            globalModel.update(req, { active: 2 }, "backups", "backup_id", backupID).then(async result => {});
        });
        archive.finalize();
        res.send({status:1,message:"Backup will be available in few minutes."});
}

exports.index = async (req, res, next) => {
    const url = req.url
    let dataCounts = {}
    if (url == "/") {
        var cachedData = myCache.get("admin_dashboard_videos")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM videos LEFT JOIN users on users.user_id = videos.owner_id  LEFT JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 AND (custom_url IS NOT NULL) AND videos.custom_url != ''  AND users.user_id IS NOT NULL  ", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.videos = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_videos', result[0].items ? result[0].items : 0, 300)
                } 
            })
        } else {
            dataCounts.videos = cachedData
        }
         cachedData = myCache.get("admin_dashboard_channels")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM channels", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.channels = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_channels', result[0].items ? result[0].items : 0, 350)
                }
            })
        } else {
            dataCounts.channels = cachedData
        }

         cachedData = myCache.get("admin_dashboard_playlist")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM playlists", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.playlists = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_playlist', result[0].items ? result[0].items : 0, 400)
                }
            })
        } else {
            dataCounts.playlists = cachedData
        }

         cachedData = myCache.get("admin_dashboard_users")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM users", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.users = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_users', result[0].items ? result[0].items : 0, 300)
                }
            })
        } else {
            dataCounts.users = cachedData
        }

         cachedData = myCache.get("admin_dashboard_blogs")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM blogs", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.blogs = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_blogs', result[0].items ? result[0].items : 0, 400)
                }
            })
        } else {
            dataCounts.blogs = cachedData
        }

         cachedData = myCache.get("admin_dashboard_advertisements")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM advertisements_user", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.advertisements = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_advertisements', result[0].items ? result[0].items : 0, 500)
                }
            })
        } else {
            dataCounts.advertisements = cachedData
        }

         cachedData = myCache.get("admin_dashboard_reports")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM reports", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.reports = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_reports', result[0].items ? result[0].items : 0, 600)
                }
            })
        } else {
            dataCounts.reports = cachedData
        }

         cachedData = myCache.get("admin_dashboard_subscriptions")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM subscriptions WHERE gateway_profile_id IS NOT NULL AND type = 'member_subscription' AND (status = 'active' || status = 'completed') ", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.subscriptions = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_subscriptions', result[0].items ? result[0].items : 0, 400)
                }
            })
        } else {
            dataCounts.subscriptions = cachedData
        }

         cachedData = myCache.get("admin_dashboard_comments")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM comments", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.comments = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_comments', result[0].items ? result[0].items : 0, 300)
                }
            })
        } else {
            dataCounts.comments = cachedData
        }

         cachedData = myCache.get("admin_dashboard_likes")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM likes WHERE like_dislike = 'like'", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.likes = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_likes', result[0].items ? result[0].items : 0, 320)
                }
            })
        } else {
            dataCounts.likes = cachedData
        }

         cachedData = myCache.get("admin_dashboard_dislikes")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM likes WHERE like_dislike = 'dislike'", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.dislikes = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_dislikes', result[0].items ? result[0].items : 0, 320)
                }
            })
        } else {
            dataCounts.dislikes = cachedData
        }

         cachedData = myCache.get("admin_dashboard_favourites")
        if (!cachedData) {
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM favourites", []).then(results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    dataCounts.favourites = result[0].items ? result[0].items : 0
                    myCache.set('admin_dashboard_favourites', result[0].items ? result[0].items : 0, 320)
                }
            })
        } else {
            dataCounts.favourites = cachedData
        }
        let statsData = {}
        var cachedDataUser = myCache.get("admin_dashboard_statsusers")
        //get users stats this year
        let match = { "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0 }
        let condition = []
        var d = new Date();
        const start = d.getFullYear() + "-01-01 00:00:00"
        const end = d.getFullYear() + "-12-31 23:59:00"
        condition.push(start)
        condition.push(end)
        if (!cachedDataUser) {
            let sql = ""
            sql += "SELECT COUNT(*) as items,creation_date FROM users WHERE creation_date >= ? AND creation_date <= ?  "
            sql += " GROUP BY DATE_FORMAT(creation_date,'%m')"
            req.getConnection(function (err, connection) {
                connection.query(sql, condition, function (err, results, fields) {
                    if (results) {
                        const resultArray = {}
                        const finalArray = []
                        Object.keys(results).forEach(function (key) {
                            let result = JSON.parse(JSON.stringify(results[key]))
                            const H = dateTime.create(result.creation_date).format('n')
                            resultArray[H] = result.items
                        })
                        Object.keys(match).forEach(function (key) {
                            let monthArray = []
                            monthArray.push(key)
                            if (resultArray[key]) {
                                monthArray.push(resultArray[key])
                            } else {
                                monthArray.push(0)
                            }
                            finalArray.push(monthArray)
                        });
                         myCache.set("admin_dashboard_statsusers",finalArray,300)
                         statsData.users = finalArray
                    }
                })
            });
        }else{
            statsData.users = cachedDataUser
        }
        
        //get videos
        var cachedDataVideos = myCache.get("admin_dashboard_statsvideos")
        if (!cachedDataVideos) {
            let sql = ""
            sql += "SELECT COUNT(*) as items,creation_date FROM videos WHERE custom_url != ''  AND creation_date >= ? AND creation_date <= ?  "
            sql += " GROUP BY DATE_FORMAT(creation_date,'%m')"
            req.getConnection(function (err, connection) {
                connection.query(sql, condition, function (err, results, fields) {
                    if (results) {
                        const resultArray = {}
                        const finalArray = []
                        Object.keys(results).forEach(function (key) {
                            let result = JSON.parse(JSON.stringify(results[key]))
                            const H = dateTime.create(result.creation_date).format('n')
                            resultArray[H] = result.items
                        })
                        Object.keys(match).forEach(function (key) {
                            let monthArray = []
                            monthArray.push(key)
                            if (resultArray[key]) {
                                monthArray.push(resultArray[key])
                            } else {
                                monthArray.push(0)
                            }
                            finalArray.push(monthArray)
                        });
                         myCache.set("admin_dashboard_statsvideos",finalArray,300)
                         statsData.videos = finalArray
                    }
                })
            });
        }else{
            statsData.videos = cachedDataVideos
        }
        //get channels
        var cachedDataChannels= myCache.get("admin_dashboard_statschannels")
        if (!cachedDataChannels) {
            let sql = ""
            sql += "SELECT COUNT(*) as items,creation_date FROM channels WHERE creation_date >= ? AND creation_date <= ?  "
            sql += " GROUP BY DATE_FORMAT(creation_date,'%m')"
            req.getConnection(function (err, connection) {
                connection.query(sql, condition, function (err, results, fields) {
                    if (results) {
                        const resultArray = {}
                        const finalArray = []
                        Object.keys(results).forEach(function (key) {
                            let result = JSON.parse(JSON.stringify(results[key]))
                            const H = dateTime.create(result.creation_date).format('n')
                            resultArray[H] = result.items
                        })
                        Object.keys(match).forEach(function (key) {
                            let monthArray = []
                            monthArray.push(key)
                            if (resultArray[key]) {
                                monthArray.push(resultArray[key])
                            } else {
                                monthArray.push(0)
                            }
                            finalArray.push(monthArray)
                        });
                         myCache.set("admin_dashboard_statschannels",finalArray,300)
                         statsData.channels = finalArray
                    }
                })
            });
        }else{
            statsData.channels = cachedDataChannels
        }
        //get blogs
        var cachedDataBlogs = myCache.get("admin_dashboard_statsblogs")
        if (!cachedDataBlogs) {
            let sql = ""
            sql += "SELECT COUNT(*) as items,creation_date FROM blogs WHERE creation_date >= ? AND creation_date <= ?  "
            sql += " GROUP BY DATE_FORMAT(creation_date,'%m')"
            req.getConnection(function (err, connection) {
                connection.query(sql, condition, function (err, results, fields) {
                    if (results) {
                        const resultArray = {}
                        const finalArray = []
                        Object.keys(results).forEach(function (key) {
                            let result = JSON.parse(JSON.stringify(results[key]))
                            const H = dateTime.create(result.creation_date).format('n')
                            resultArray[H] = result.items
                        })
                        Object.keys(match).forEach(function (key) {
                            let monthArray = []
                            monthArray.push(key)
                            if (resultArray[key]) {
                                monthArray.push(resultArray[key])
                            } else {
                                monthArray.push(0)
                            }
                            finalArray.push(monthArray)
                        });
                         myCache.set("admin_dashboard_statsblogs",finalArray,300)
                         statsData.blogs = finalArray
                    }
                })
            });
        }else{
            statsData.blogs = cachedDataBlogs
        }
        

        let recentContents = {}

        //recent users
        var cachedDataUserRecent = myCache.get("admin_dashboard_recentusers")
        if (!cachedDataUserRecent) {
            await globalModel.custom(req, "SELECT *,IF(userdetails.avtar IS NULL OR userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar FROM users LEFT JOIN userdetails ON userdetails.user_id = users.user_id ORDER BY users.user_id DESC LIMIT 5 ", []).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.users = result
                    myCache.set('admin_dashboard_recentusers', result , 300)
                }
            })
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM users WHERE approve = ?", [0]).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.unapprovedusers = result[0].items
                    myCache.set('admin_dashboard_unapprovedusers', result[0].items , 300)
                }
            })
        } else {
            recentContents.users = cachedDataUserRecent
            recentContents.unapprovedusers = myCache.get("admin_dashboard_unapprovedusers")
        }

        //recent channels
        var cachedDataChannelRecent = myCache.get("admin_dashboard_recentchannels")
        if (!cachedDataChannelRecent) {
            await globalModel.custom(req, "SELECT *,IF(channels.image IS NULL || channels.image = '','" + req.appSettings['channel_default_photo'] + "',channels.image) as image FROM channels ORDER BY channels.channel_id DESC LIMIT 5 ", []).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.channels = result
                    myCache.set('admin_dashboard_recentchannels', result , 350)
                }
            })
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM channels WHERE approve = ?", [0]).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.unapprovedchannels = result[0].items
                    myCache.set('admin_dashboard_unapprovedchannels', result[0].items , 350)
                }
            })
        } else {
            recentContents.channels = cachedDataChannelRecent
            recentContents.unapprovedchannels = myCache.get("admin_dashboard_unapprovedchannels")
        }


        //recent blogs
        var cachedDataBlogRecent = myCache.get("admin_dashboard_recentblogs")
        if (!cachedDataBlogRecent) {
            await globalModel.custom(req, "SELECT *,IF(blogs.image IS NULL || blogs.image = '','" + req.appSettings['blog_default_photo'] + "',blogs.image) as image FROM blogs ORDER BY blogs.blog_id DESC LIMIT 5 ", []).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.blogs = result
                    myCache.set('admin_dashboard_recentblogs', result , 400)
                }
            })
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM blogs WHERE approve = ?", [0]).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.unapprovedblogs = result[0].items
                    myCache.set('admin_dashboard_unapprovedblogs', result[0].items , 400)
                }
            })
        } else {
            recentContents.blogs = cachedDataBlogRecent
            recentContents.unapprovedblogs = myCache.get("admin_dashboard_unapprovedblogs")
        }

        //recent playlists
        var cachedDataPlaylistRecent = myCache.get("admin_dashboard_recentplaylists")
        if (!cachedDataPlaylistRecent) {
            await globalModel.custom(req, "SELECT *,IF(playlists.image IS NULL || playlists.image = '','" + req.appSettings['playlist_default_photo'] + "',playlists.image) as image FROM playlists ORDER BY playlists.playlist_id DESC LIMIT 5 ", []).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.playlists = result
                    myCache.set('admin_dashboard_recentplaylists', result , 400)
                }
            })
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM playlists  WHERE approve = ?", [0]).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.unapprovedplaylists = result[0].items
                    myCache.set('admin_dashboard_unapprovedplaylists', result[0].items , 400)
                }
            })
        } else {
            recentContents.playlists = cachedDataPlaylistRecent
            recentContents.unapprovedplaylists = myCache.get("admin_dashboard_unapprovedplaylists")
        }

        //recent reports
        var cachedDataReportRecent = myCache.get("admin_dashboard_recentreports")
        if (!cachedDataReportRecent) {
            await globalModel.custom(req, "SELECT *,reportmessages.description as message_desc FROM reports LEFT JOIN reportmessages ON reportmessages.reportmessage_id = reports.reportmessage_id ORDER BY reports.report_id DESC LIMIT 5 ", []).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.reports = result
                    myCache.set('admin_dashboard_recentreports', result , 500)
                }
            })
        } else {
            recentContents.reports = cachedDataReportRecent
        }

        //recent videos
        var cachedDataVideosRecent = myCache.get("admin_dashboard_recentvideos")
        if (!cachedDataVideosRecent) {
            await globalModel.custom(req, 'SELECT *,IF(videos.image IS NULL || videos.image = "","' + req.appSettings['video_default_photo'] + '",videos.image) as image  FROM videos WHERE videos.custom_url IS NOT NULL ORDER BY videos.video_id DESC LIMIT 5 ', []).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.videos = result
                    myCache.set('admin_dashboard_recentvideos', result , 300)
                }
            })
            await globalModel.custom(req, "SELECT COUNT(*) as items FROM videos WHERE videos.custom_url != ''  AND  approve = ?", [0]).then(async results => {
                const result = JSON.parse(JSON.stringify(results));
                if (result && result.length) {
                    recentContents.unapprovedvideos = result[0].items
                    myCache.set('admin_dashboard_unapprovedvideos', result[0].items , 300)
                }
            })
        } else {
            recentContents.videos = cachedDataVideosRecent
            recentContents.unapprovedvideos = myCache.get("admin_dashboard_unapprovedvideos")
        }
        var NumAbbr = require('number-abbreviate')
        var numAbbr = new NumAbbr()
        var timeago = require("node-time-ago")
        var striptags = require("striptags")
        res.render('admin/dashboard/dashboard', {striptags:striptags,timeago:timeago,admin_slug: process.env.ADMIN_SLUG,recentContents:recentContents,statsData:statsData, numAbbr: numAbbr, dataCounts: dataCounts, nav: url, title: "Dashboard" })
    } else {
        next();
    }
}