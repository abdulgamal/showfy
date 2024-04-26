const { validationResult } = require("express-validator");
const fieldErrors = require("../../functions/error");
const errorCodes = require("../../functions/statusCodes");
const constant = require("../../functions/constant");
const globalModel = require("../../models/globalModel");
const commonFunction = require("../../functions/commonFunctions");
const permissionModel = require("../../models/levelPermissions");
const ffmpeg = require("fluent-ffmpeg");
const s3Upload = require("../../functions/upload").uploadtoS3;
const resize = require("../../functions/resize");
const dateTime = require("node-datetime");
const path = require("path");
const uniqid = require("uniqid");
const videoModel = require("../../models/videos");
const socketio = require("../../socket");
const notifications = require("../../models/notifications");
const privacyModel = require("../../models/privacy");
const categoryModel = require("../../models/categories");
const notificationModel = require("../../models/notifications");
const channelVideosModel = require("../../models/channelvideos");
const artistModel = require("../../models/artists");
const axios = require("axios");
const settingModel = require("../../models/settings");
const async = require("async");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const moment = require("moment");

exports.autoDeleteVideos = async (req, data) => {
  return new Promise(async function (resolve) {
    if (data.active != 2)
      await globalModel.update(
        req,
        { active: 2 },
        "tools_delete_videos",
        "delete_video_id",
        data.delete_video_id
      );

    let level_id = data.level_id;
    let category_id = data.category_id;
    let subcategory_id = data.subcategory_id;
    let subsubcategory_id = data.subsubcategory_id;
    let tags = data.tags;
    let time_interval = data.time_interval;
    let time_duration = data.time_duration;

    let lastProcessVideoID = data.last_process_video_id;

    let condition = [];
    let sql =
      "SELECT * from videos LEFT JOIN users ON users.user_id = videos.owner_id where 1=1 ";
    if (category_id != 0) {
      condition.push(category_id);
      sql += " AND category_id != ?";
    }
    if (subcategory_id != 0) {
      condition.push(subcategory_id);
      sql += " AND subcategory_id != ?";
    }
    if (subsubcategory_id != 0) {
      condition.push(subsubcategory_id);
      sql += " AND subsubcategory_id != ?";
    }
    if (level_id && level_id.trim() != "") {
      condition.push(level_id);
      sql += " AND FIND_IN_SET(users.level_id, ?) > 0 ";
    }
    if (tags && tags != "") {
      let splitTags = tags.split(",");
      let tagQuery = [];
      for (let i = 0; i < splitTags.length; i++) {
        if (splitTags[i] && splitTags[i].trim() != "") {
          condition.push(splitTags[i]);
          tagQuery.push("CONCAT(',', tags, ',') like CONCAT('%,', ?,  ',%') ");
        }
      }
      if (tagQuery.length > 0) {
        sql += " AND (" + tagQuery.join(" OR ") + ")";
      }
    }

    if (time_duration == "months") {
      condition.push(time_interval);
      sql += " AND videos.creation_date > now() - INTERVAL ? MONTH";
    } else if (time_duration == "years") {
      condition.push(time_interval);
      sql += " AND videos.creation_date > now() - INTERVAL ? YEAR";
    } else if (time_duration == "days") {
      condition.push(time_interval);
      sql += " AND videos.creation_date > now() - INTERVAL ? DAY";
    }

    if (data.last_process_video_id != 0) {
      condition.push(lastProcessVideoID);
      sql += " AND videos.video_id < ?";
    }
    sql += " ORDER BY videos.video_id DESC LIMIT 100";

    await globalModel.custom(req, sql, condition).then(async (results) => {
      if (results && results.length > 0) {
        let items = JSON.parse(JSON.stringify(results));
        let deleteVideo = data.delete_video_count;
        for (let i = 0; i < items.length; i++) {
          deleteVideo = parseInt(deleteVideo) + 1;
          await globalModel.update(
            req,
            {
              last_process_video_id: items[i].video_id,
              delete_video_count: deleteVideo,
            },
            "tools_delete_videos",
            "delete_video_id",
            data.delete_video_id
          );
          await videoModel.delete(items[i].video_id, req).then((result) => {
            if (result) {
              commonFunction.deleteImage(req, "", "", "video", items[i]);
              socketio.getIO().emit("videoDeleted", {
                video_id: items[i].video_id,
                message: constant.video.DELETED,
              });
            }
          });
        }
        if (items.length < 100) {
          await globalModel.update(
            req,
            { active: 1 },
            "tools_delete_videos",
            "delete_video_id",
            data.delete_video_id
          );
        }
      } else {
        await globalModel.update(
          req,
          { active: 1 },
          "tools_delete_videos",
          "delete_video_id",
          data.delete_video_id
        );
      }
    });
    resolve(true);
  });
};
exports.autoDeleteImportedVideos = async (req, data) => {
  return new Promise(async function (resolve) {
    if (data.active != 2)
      await globalModel.update(
        req,
        { active: 2 },
        "tools_remove_videos",
        "remove_video_id",
        data.remove_video_id
      );

    let time_interval = data.time_interval;
    let time_duration = data.time_duration;

    let lastProcessVideoID = data.last_process_video_id;

    let condition = [];
    let sql = "SELECT * from videos where 1 = 1 ";

    if (time_duration == "months") {
      condition.push(time_interval);
      sql += " AND videos.creation_date > now() - INTERVAL ? MONTH";
    } else if (time_duration == "years") {
      condition.push(time_interval);
      sql += " AND videos.creation_date > now() - INTERVAL ? YEAR";
    } else if (time_duration == "days") {
      condition.push(time_interval);
      sql += " AND videos.creation_date > now() - INTERVAL ? DAY";
    }

    if (data.site == "youtube") {
      sql += " AND videos.type = 1";
    } else if (data.site == "vimeo") {
      sql += " AND videos.type = 2";
    } else if (data.site == "dailymotion") {
      sql += " AND videos.type = 3";
    }

    if (data.last_process_video_id != 0) {
      condition.push(lastProcessVideoID);
      sql += " AND videos.video_id < ?";
    }
    sql += " ORDER BY videos.video_id DESC LIMIT 100";

    await globalModel.custom(req, sql, condition).then(async (results) => {
      if (results && results.length > 0) {
        let items = JSON.parse(JSON.stringify(results));
        let deleteVideo = data.delete_video_count;
        for (let i = 0; i < items.length; i++) {
          await globalModel.update(
            req,
            { last_process_video_id: items[i].video_id },
            "tools_remove_videos",
            "remove_video_id",
            data.remove_video_id
          );
          //fetch video info
          let url = "";
          if (items[i].type == 1) {
            url = "https://www.youtube.com/watch?v=" + items[i].code;
          } else if (items[i].type == 2) {
            url = "https://vimeo.com/" + items[i].code;
          } else if (items[i].type == 3) {
            url = "http://www.dailymotion.com/video/" + items[i].code;
          }
          await commonFunction
            .getUploadVideoInfo(url)
            .then(async (result) => {
              if (!result.status) {
                let type = 0;
                if (result.provider == "youtube") {
                  type = 1;
                } else if (result.provider == "vimeo") {
                  type = 2;
                } else if (result.provider == "dailymotion") {
                  type = 4;
                }
                await commonFunction
                  .getVideoData(result.provider, result.id, req, result)
                  .then(async (result) => {
                    if (result) {
                      let responseData = result;
                      if (
                        responseData.image &&
                        (items[i].image.indexOf("http://") > -1 ||
                          items[i].image.indexOf("https://") > -1)
                      ) {
                        await globalModel.update(
                          req,
                          { image: responseData.image },
                          "videos",
                          "video_id",
                          items[i].video_id
                        );
                      }
                    } else {
                      deleteVideo = parseInt(deleteVideo) + 1;
                      await globalModel.update(
                        req,
                        { delete_video_count: deleteVideo },
                        "tools_remove_videos",
                        "remove_video_id",
                        data.remove_video_id
                      );
                      await videoModel
                        .delete(items[i].video_id, req)
                        .then((result) => {
                          if (result) {
                            commonFunction.deleteImage(
                              req,
                              "",
                              "",
                              "video",
                              items[i]
                            );
                            socketio.getIO().emit("videoDeleted", {
                              video_id: items[i].video_id,
                              message: constant.video.DELETED,
                            });
                          }
                        });
                    }
                  })
                  .catch((error) => {});
              }
            })
            .catch((error) => {});
        }
        if (items.length < 100) {
          await globalModel.update(
            req,
            { active: 1 },
            "tools_remove_videos",
            "remove_video_id",
            data.remove_video_id
          );
        }
      } else {
        await globalModel.update(
          req,
          { active: 1 },
          "tools_remove_videos",
          "remove_video_id",
          data.remove_video_id
        );
      }
    });
    resolve(true);
  });
};

exports.sendGift = async (req, res) => {
  let id = req.body.id;

  let giftData = {};
  let videos = {};
  await globalModel
    .custom(req, "SELECT * FROM gifts WHERE gift_id =?", id)
    .then((result) => {
      if (result && result.length) {
        giftData = JSON.parse(JSON.stringify(result))[0];
      }
    });
  if (!Object.keys(giftData).length) {
    return res
      .send({
        error: true,
        message: constant.general.PARAMMISSING,
        status: errorCodes.invalid,
      })
      .end();
  }

  await globalModel
    .custom(req, "SELECT * FROM videos WHERE video_id =?", req.body.video_id)
    .then((result) => {
      if (result && result.length) {
        videos = result[0];
      }
    });
  if (!Object.keys(videos).length) {
    return res
      .send({
        error: true,
        message: constant.general.PARAMMISSING,
        status: errorCodes.invalid,
      })
      .end();
  }

  let amount = parseFloat(giftData.price).toFixed(2);

  let commission_amount = 0;
  let commissionType = parseFloat(req.appSettings["gifts_commission_type"]);
  let commissionTypeValue = parseFloat(
    req.appSettings["gifts_commission_value"]
  );
  //calculate admin commission
  if (commissionType == 2 && commissionTypeValue > 0) {
    commission_amount = parseFloat((amount * (commissionTypeValue / 100)).toFixed(2));
  } else if (commissionType == 1 && commissionTypeValue > 0) {
    commission_amount = commissionTypeValue;
  }
  let ownerAmount = amount;
  if (commission_amount > parseFloat(amount).toFixed(2)) {
    commission_amount = 0;
  } else {
    ownerAmount = (ownerAmount - commission_amount).toFixed(2);
  }

  let balance = parseFloat(req.user.wallet);

  if (balance < parseFloat(giftData.price)) {
    return res
      .send({
        error: fieldErrors.errors(
          [{ message: "Your balance is low, please recharge your account." }],
          true
        ),
        status: errorCodes.invalid,
      })
      .end();
  } else {
    var userip;
    if (req.headers["x-real-ip"]) {
      userip = req.headers["x-real-ip"].split(",")[0];
    } else if (req.socket && req.socket.remoteAddress) {
      userip = req.socket.remoteAddress;
    } else {
      userip = req.ip;
    }
    var dt = dateTime.create();
    var formatted = dt.format("Y-m-d H:M:S");
    //deduct balance from user account
    let currentCurrency = req.currentCurrency
    let changeRate = currentCurrency.currency_value
    await globalModel
      .custom(req, "UPDATE users SET `wallet` = wallet - ? WHERE user_id = ?", [
        (amount*changeRate).toFixed(2),
        req.user.user_id,
      ])
      .then((result) => {});
    //insert balance in user account
    await globalModel
      .custom(
        req,
        "UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",
        [(ownerAmount*changeRate).toFixed(2), videos.owner_id]
      )
      .then((result) => {});
    await globalModel
      .custom(
        req,
        "UPDATE gifts SET `used` = used + ?  WHERE gift_id = ?",
        [1, id]
      )
      .then((result) => {});
    
    let insertObject = {};
    insertObject["gateway_id"] = "1";
    insertObject["tip_id"] = videos.video_id;
    insertObject["owner_id"] = videos.owner_id;
    insertObject["state"] = "completed";
    insertObject["type"] = "gift";
    insertObject["id"] = giftData.gift_id;
    insertObject["price"] = ownerAmount;
    insertObject["admin_commission"] = commission_amount;
    insertObject["sender_id"] = req.user.user_id;
    insertObject["gateway_transaction_id"] = dt.getTime();
    insertObject["currency"] = currentCurrency.ID
    insertObject["default_currency"] = req.appSettings["payment_default_currency"]
    insertObject["change_rate"] = changeRate
    insertObject["creation_date"] = formatted;
    insertObject["modified_date"] = formatted;

    await globalModel
      .create(req, insertObject, "transactions")
      .then((result) => {});
    
  }

  let count = 1;
  await globalModel
    .custom(req, "SELECT COUNT(transaction_id) as count FROM transactions WHERE id =? AND tip_id = ? AND sender_id = ?", [giftData.gift_id,videos.video_id,req.user.user_id])
    .then((result) => {
      if (result && result.length) {
        let data = JSON.parse(JSON.stringify(result))[0];
        count = data.count;
      }
    });

  // get owner details
  let ownerInfo = {
    owner_id:req.user.user_id,
    image:req.user.avtar,
    displayname:req.user.displayname,
    title:req.i18n.t(`Sent {{name}}`,{name:giftData.title}),
    giftImage:giftData.image,
    count:count
  };

  socketio.getIO().emit("giftSend", {
    video_id: videos.video_id,
    gift_id: giftData.gift_id,
    user_id:req.user.user_id,
    ownerInfo:ownerInfo
  });

  notifications.insert(req, {notDelete:true,owner_id:videos.owner_id,insert:true, type: "gift", subject_type: "users", subject_id: videos.owner_id, object_type: "videos", object_id: videos.video_id,forceInsert:true }).then(() => {

  }).catch(() => {

  })

  return res
    .send({ message: "Gift send successfully.", status: errorCodes.created })
    .end();
};
exports.sendTip = async (req, res) => {
  let id = req.body.id;

  let tipData = {};
  let videos = {};
  await globalModel
    .custom(req, "SELECT * FROM tips WHERE tip_id =?", id)
    .then((result) => {
      if (result && result.length) {
        tipData = JSON.parse(JSON.stringify(result))[0];
      }
    });
  if (!Object.keys(tipData).length) {
    return res
      .send({
        error: true,
        message: constant.general.PARAMMISSING,
        status: errorCodes.invalid,
      })
      .end();
  }

  await globalModel
    .custom(req, "SELECT * FROM videos WHERE video_id =?", tipData.resource_id)
    .then((result) => {
      if (result && result.length) {
        videos = result[0];
      }
    });
  if (!Object.keys(videos).length) {
    return res
      .send({
        error: true,
        message: constant.general.PARAMMISSING,
        status: errorCodes.invalid,
      })
      .end();
  }

  let amount = parseFloat(tipData.amount).toFixed(2);

  let commission_amount = 0;
  let commissionType = parseFloat(req.appSettings["videotip_commission_type"]);
  let commissionTypeValue = parseFloat(
    req.appSettings["videotip_commission_value"]
  );
  //calculate admin commission
  if (commissionType == 2 && commissionTypeValue > 0) {
    commission_amount = parseFloat((amount * (commissionTypeValue / 100)).toFixed(2));
  } else if (commissionType == 1 && commissionTypeValue > 0) {
    commission_amount = commissionTypeValue;
  }
  let ownerAmount = amount;
  if (commission_amount > parseFloat(amount).toFixed(2)) {
    commission_amount = 0;
  } else {
    ownerAmount = (ownerAmount - commission_amount).toFixed(2);
  }

  let balance = parseFloat(req.user.wallet);

  if (balance < parseFloat(tipData.amount)) {
    return res
      .send({
        error: fieldErrors.errors(
          [{ message: "Your balance is low, please recharge your account." }],
          true
        ),
        status: errorCodes.invalid,
      })
      .end();
  } else {
    var userip;
    if (req.headers["x-real-ip"]) {
      userip = req.headers["x-real-ip"].split(",")[0];
    } else if (req.socket && req.socket.remoteAddress) {
      userip = req.socket.remoteAddress;
    } else {
      userip = req.ip;
    }
    var dt = dateTime.create();
    var formatted = dt.format("Y-m-d H:M:S");
    //deduct balance from user account
    let currentCurrency = req.currentCurrency
    let changeRate = currentCurrency.currency_value
    await globalModel
      .custom(req, "UPDATE users SET `wallet` = wallet - ? WHERE user_id = ?", [
        (amount*changeRate).toFixed(2),
        req.user.user_id,
      ])
      .then((result) => {});
    //insert balance in user account
    await globalModel
      .custom(
        req,
        "UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",
        [(ownerAmount*changeRate).toFixed(2), videos.owner_id]
      )
      .then((result) => {});
    await globalModel
      .custom(
        req,
        "UPDATE tips SET `purchase_count` = purchase_count + ?  WHERE tip_id = ?",
        [1, id]
      )
      .then((result) => {});
    //insert data in transaction
    await globalModel
      .create(
        req,
        {
          owner_id: req.user.user_id,
          video_id: videos.video_id,
          price: (amount*changeRate).toFixed(2),
          ip: userip,
          creation_date: formatted,
        },
        "tip_donors"
      )
      .then((result) => {});
    let insertObject = {};
    insertObject["gateway_id"] = "1";
    insertObject["gateway_transaction_id"] = "";
    insertObject["owner_id"] = videos.owner_id;
    insertObject["state"] = "completed";
    insertObject["type"] = "video_tip";
    insertObject["id"] = videos.video_id;
    insertObject["price"] = ownerAmount;
    insertObject["admin_commission"] = commission_amount;
    insertObject["sender_id"] = req.user.user_id;
    insertObject["gateway_transaction_id"] = dt.getTime();
    insertObject["currency"] = currentCurrency.ID
    insertObject["default_currency"] = req.appSettings["payment_default_currency"]
    insertObject["change_rate"] = changeRate
    insertObject["creation_date"] = formatted;
    insertObject["modified_date"] = formatted;

    await globalModel
      .create(req, insertObject, "transactions")
      .then((result) => {});
    if (videos.is_livestreaming) {
      req.getConnection(function (err, connection) {
        let data = {};
        data["message"] =
          "Send you " + req.convertCurrency({ price: amount, req: req });
        (" tip.");
        data["user_id"] = req.user.user_id;
        data["displayname"] = req.user.displayname;
        data["username"] = req.user.username;
        data["image"] = req.user.avtar;
        data["id"] = videos.custom_url;
        data["params"] = JSON.stringify({
          tip: 1,
          amount: req.convertCurrency({ price: amount, req: req }),
        });
        if (videos.channel_name) {
          data.room = videos.channel_name;
        } else if (videos.mediaserver_stream_id) {
          data.streamId = videos.mediaserver_stream_id;
        }
        videoModel
          .createChatMessage(connection, data)
          .then((result) => {
            socketio
              .getIO()
              .to(data.room ? data.room : data.streamId)
              .emit("userMessage", result);
          })
          .catch((err) => {
            console.log(err);
            //silence
          });
      });
    }
  }

  return res
    .send({ message: "Tip send successfully.", status: errorCodes.created })
    .end();
};

exports.default = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .send({ error: fieldErrors.errors(errors), status: errorCodes.invalid })
      .end();
  }

  // all set now
  let insertObject = {};
  let owner_id = req.body.owner_id;
  if (!owner_id) {
    return res
      .send({
        error: true,
        message: constant.general.PARAMMISSING,
        status: errorCodes.invalid,
      })
      .end();
  }
  let itemObject = {};
  if (owner_id) {
    //uploaded
    await globalModel
      .custom(req, "SELECT * FROM defaultstreaming WHERE user_id = ?", owner_id)
      .then(async (result) => {
        if (result && result.length) {
          itemObject = JSON.parse(JSON.stringify(result))[0];
        } else {
        }
      })
      .catch((err) => {});
  }
  insertObject["user_id"] = owner_id;
  if (typeof req.body.comments != "undefined") {
    insertObject["autoapprove_comments"] = parseInt(req.body.comments);
  }
  insertObject["title"] = req.body.title;
  insertObject["resource_type"] = "video";
  insertObject["description"] = req.body.description
    ? req.body.description
    : "";
  insertObject["category_id"] = req.body.category_id ? req.body.category_id : 0;
  insertObject["subcategory_id"] = req.body.subcategory_id
    ? req.body.subcategory_id
    : 0;
  insertObject["subsubcategory_id"] = req.body.subsubcategory_id
    ? req.body.subsubcategory_id
    : 0;
  insertObject["adult"] = req.body.adult ? req.body.adult : 0;
  if (
    req.body.price &&
    (parseFloat(req.body.price) > 0 || parseFloat(req.body.price) == 0)
  )
    insertObject["price"] = parseFloat(req.body.price);
  insertObject["view_privacy"] = req.body.privacy
    ? req.body.privacy
    : "everyone";
  if (
    insertObject["view_privacy"] == "password" &&
    req.body.password &&
    req.body.password != ""
  ) {
    insertObject["password"] = req.body.password;
    insertObject["is_locked"] = 1;
  } else {
    if (insertObject["view_privacy"] == "password")
      insertObject["view_privacy"] = "everyone";
    insertObject["password"] = "";
    insertObject["is_locked"] = 0;
  }

  let tags = req.body.tags;
  if (tags && tags.length > 0) insertObject["tags"] = tags;
  else {
    insertObject["tags"] = null;
  }

  if (req.body.enable_chat) {
    insertObject["enable_chat"] = req.body.enable_chat
      ? req.body.enable_chat
      : 1;
  }

  if (Object.keys(itemObject).length > 0) {
    //update existing video
    await globalModel
      .update(
        req,
        insertObject,
        "defaultstreaming",
        "defaultstreaming_id",
        itemObject.defaultstreaming_id
      )
      .then(async (result) => {
        //create tip data
        if (req.body.tips) {
          let tips = JSON.parse(req.body.tips);
          await exports.createDefaultTips(req, tips, owner_id);
        }

        //delete tip data
        if (req.body.removeTips) {
          let removeTips = JSON.parse(req.body.removeTips);
          await exports.deleteDefaultTip(req, removeTips, owner_id);
        }

        res.send({ message: constant.general.GENERALSAVED });
      })
      .catch((err) => {
        return res
          .send({
            error: fieldErrors.errors(
              [{ msg: constant.general.DATABSE }],
              true
            ),
            status: errorCodes.invalid,
          })
          .end();
      });
  } else {
    //create new video
    await globalModel
      .create(req, insertObject, "defaultstreaming")
      .then(async (result) => {
        if (result) {
          //create tip data
          if (req.body.tips) {
            let tips = JSON.parse(req.body.tips);
            await exports.createDefaultTips(req, tips, owner_id);
          }
          res.send({ message: constant.general.GENERALSAVED });
        } else {
          return res
            .send({
              error: fieldErrors.errors(
                [{ msg: constant.general.DATABSE }],
                true
              ),
              status: errorCodes.invalid,
            })
            .end();
        }
      })
      .catch((err) => {
        return res
          .send({
            error: fieldErrors.errors(
              [{ msg: constant.general.DATABSE }],
              true
            ),
            status: errorCodes.invalid,
          })
          .end();
      });
  }
};

exports.deleteDefaultTip = (req, deletes) => {
  return new Promise(async (resolve, reject) => {
    async.forEachOf(
      deletes,
      async function (deleteId, i, callback) {
        await globalModel.delete(req, "defaulttips", "defaulttip_id", deleteId);

        if (i == deletes.length - 1) {
          resolve(true);
        }
      },
      function (err) {
        resolve(true);
      }
    );
  });
};
exports.createDefaultTips = (req, tips, owner_id) => {
  return new Promise(async (resolve, reject) => {
    async.forEachOf(
      tips,
      async function (tipData, i, callback) {
        let tip = tips[i];
        let price = parseFloat(tip.amount);
        if (price > 0) {
          //insert into database
          let insertObject = {};
          insertObject["amount"] = tip.amount;
          if (!tip.defaulttip_id) {
            insertObject["user_id"] = owner_id;
            insertObject["resource_type"] = "video";
            await globalModel
              .create(req, insertObject, "defaulttips")
              .then((result) => {});
          } else {
            //update
            //  await globalModel.update(req, insertObject, "defaulttips", 'defaulttip_id', id).then(result => {});
          }
        } else if (tip.tip_id) {
          //delete entry
          await globalModel.delete(
            req,
            "defaulttips",
            "defaulttip_id",
            tip.defaulttip_id
          );
        }
        if (i == tips.length - 1) {
          resolve(true);
        }
      },
      function (err) {
        resolve(true);
      }
    );
  });
};

exports.streamingStatus = async (req, res) => {
  let action = req.body.action;
  let id = req.body.id;
  let streamName = req.body.streamName;
  let vodId = req.body.vodId;
  if (action == "liveStreamStarted") {
    socketio.getIO().emit("liveStreamStatus", {
      action: action,
      id: id,
      streamName: streamName,
    });
    if (req.appSettings["antserver_media_singlekey"] == 1) {
      //check stream created
      globalModel
        .custom(
          req,
          "SELECT mediaserver_stream_id from videos where mediaserver_stream_id = ? AND is_livestreaming = 1",
          [id]
        )
        .then(async (result) => {
          if (result) {
            const results = JSON.parse(JSON.stringify(result));
            if (results && results.length) {
            } else {
              //get user with streaming key

              globalModel
                .custom(req, "SELECT * from users where streamkey = ?", [id])
                .then(async (result) => {
                  const results = JSON.parse(JSON.stringify(result));
                  if (results && results.length) {
                    let user = results[0];
                    let permissions = {};
                    await permissionModel
                      .findById(user.level_id, req, res)
                      .then((results) => {
                        permissions = results;
                      });
                    //check quota
                    if (permissions["livestreaming.quota"] > 0) {
                      //get count of user uploaded livestreaming
                      await videoModel
                        .liveStreamingUploadCount(req, res, user.user_id)
                        .then((result) => {
                          if (result) {
                            if (
                              result.totalLiveStreaming >=
                              permissions["livestreaming.quota"]
                            ) {
                              req.quotaLimitError = true;
                            }
                          }
                        });
                    }
                    if (req.quotaLimitError) {
                      return;
                    }

                    //default tip data
                    let tipdata = [];
                    if (parseInt(req.appSettings["video_tip"]) == 1) {
                      //get tip data
                      await videoModel
                        .getDefaultTips(req, {
                          user_id: user.user_id,
                          resource_type: "video",
                        })
                        .then((result) => {
                          if (result && result.length > 0) tipdata = result;
                        });
                    }

                    let defaultSettings = {};
                    //default streaming data
                    await videoModel
                      .getDefaultStreamingData(req, {
                        user_id: user.user_id,
                        resource_type: "video",
                      })
                      .then((result) => {
                        if (result && result.length > 0)
                          defaultSettings = result[0];
                      });

                    let insertObject = {};
                    //create new live streaming
                    insertObject["title"] = defaultSettings.title
                      ? defaultSettings.title
                      : req.i18n.t("Live Streaming");
                    insertObject["description"] = defaultSettings.description
                      ? defaultSettings.description
                      : "";
                    insertObject["category_id"] = defaultSettings.category_id
                      ? defaultSettings.category_id
                      : 0;
                    insertObject["subcategory_id"] =
                      defaultSettings.subcategory_id
                        ? defaultSettings.subcategory_id
                        : 0;
                    insertObject["subsubcategory_id"] =
                      defaultSettings.subsubcategory_id
                        ? defaultSettings.subsubcategory_id
                        : 0;
                    insertObject["adult"] = defaultSettings.adult
                      ? defaultSettings.adult
                      : 0;
                    insertObject["view_privacy"] = defaultSettings.view_privacy
                      ? defaultSettings.view_privacy
                      : "everyone";
                    insertObject["is_locked"] = defaultSettings.is_locked
                      ? defaultSettings.is_locked
                      : 0;
                    insertObject["password"] = defaultSettings.password
                      ? defaultSettings.password
                      : "";
                    insertObject["enable_chat"] = defaultSettings.enable_chat
                      ? defaultSettings.enable_chat
                      : 1;
                    insertObject["autoapprove_comments"] =
                      defaultSettings.autoapprove_comments
                        ? defaultSettings.autoapprove_comments
                        : 1;
                    insertObject["tags"] = defaultSettings.tags
                      ? defaultSettings.tags
                      : null;

                    insertObject["price"] =
                      defaultSettings.price && parseFloat(defaultSettings.price)
                        ? parseFloat(defaultSettings.price)
                        : 0;
                    insertObject["search"] = 1;
                    insertObject["mediaserver_stream_id"] = id;
                    insertObject["type"] = 11;
                    insertObject["owner_id"] = user.user_id;
                    var dt = dateTime.create();
                    var formatted = dt.format("Y-m-d H:M:S");

                    insertObject["custom_url"] = uniqid.process("v");
                    insertObject["is_sponsored"] =
                      permissions["video.sponsored"] == "1" ? 1 : 0;
                    insertObject["is_featured"] =
                      permissions["video.featured"] == "1" ? 1 : 0;
                    insertObject["is_hot"] =
                      permissions["video.hot"] == "1" ? 1 : 0;
                    insertObject["approve"] = 1;
                    insertObject["completed"] = 1;
                    insertObject["creation_date"] = formatted;
                    insertObject["modified_date"] = formatted;
                    insertObject["is_livestreaming"] = 1;

                    await globalModel
                      .create(req, insertObject, "videos")
                      .then(async (result) => {
                        if (result) {
                          if (tipdata.length > 0) {
                            await exports.createTips(
                              req,
                              tipdata,
                              result.insertId,
                              true
                            );
                          }

                          //notify followers
                          notificationModel
                            .insertFollowNotifications(req, {
                              subject_type: "users",
                              subject_id: user.user_id,
                              object_type: "videos",
                              object_id: result.insertId,
                              type: "live_video",
                            })
                            .then((result) => {})
                            .catch((err) => {});
                        }
                      });
                  }
                });
            }
          }
        });
    }
  } else if (action == "liveStreamEnded") {
    globalModel
      .custom(
        req,
        "UPDATE videos SET is_livestreaming = 0 WHERE mediaserver_stream_id = '" +
          id +
          "'"
      )
      .then((result) => {})
      .catch((err) => {});
    socketio.getIO().emit("liveStreamStatus", {
      action: action,
      id: id,
      streamName: streamName,
    });
  } else if (action == "vodReady") {
    globalModel
      .custom(
        req,
        "SELECT * from videos where mediaserver_stream_id = ? AND is_livestreaming = 0 ORDER BY video_id DESC LIMIT 1",
        [id]
      )
      .then(async (result) => {
        if (result) {
          const results = JSON.parse(JSON.stringify(result));
          if (results && results.length) {
            let videoObj = results[0];
            let name = req.body.vodName;
            //check video type
            let insertObject = {};
            insertObject["agora_resource_id"] = videoObj.agora_resource_id
              ? videoObj.agora_resource_id + "," + vodId
              : vodId;
            insertObject["code"] = videoObj.code
              ? videoObj.code + "," + req.body.vodName + ".mp4"
              : req.body.vodName + ".mp4";

            var n = name.lastIndexOf("_");
            var matchResolution = name.substring(n + 1);
            if (
              !videoObj.image &&
              parseInt(req.appSettings["antserver_media_hlssupported"]) == 1
            ) {
              insertObject["image"] =
                `/${req.appSettings["antserver_media_app"]}/previews/` +
                req.body.vodName +
                ".png";
              if (n > -1) {
                insertObject["image"] = insertObject["image"].replace(
                  "_" + matchResolution,
                  ""
                );
              }
            }
            let valid = true;

            if (matchResolution.indexOf("240p") > -1) {
              insertObject["240p"] = 1;
              if (parseInt(videoObj["240p"]) == 1) {
                valid = false;
              }
            } else if (matchResolution.indexOf("360p") > -1) {
              insertObject["360p"] = 1;
              if (parseInt(videoObj["360p"]) == 1) {
                valid = false;
              }
            } else if (matchResolution.indexOf("480p") > -1) {
              insertObject["480p"] = 1;
              if (parseInt(videoObj["480p"]) == 1) {
                valid = false;
              }
            } else if (matchResolution.indexOf("720p") > -1) {
              insertObject["720p"] = 1;
              if (parseInt(videoObj["720p"]) == 1) {
                valid = false;
              }
            } else if (matchResolution.indexOf("1080p") > -1) {
              insertObject["1080p"] = 1;
              if (parseInt(videoObj["1080p"]) == 1) {
                valid = false;
              }
            } else if (matchResolution.indexOf("2048p") > -1) {
              insertObject["2048p"] = 1;
              if (parseInt(videoObj["2048p"]) == 1) {
                valid = false;
              }
            } else if (matchResolution.indexOf("4096p") > -1) {
              insertObject["4096p"] = 1;
              if (parseInt(videoObj["4096p"]) == 1) {
                valid = false;
              }
            } else if (
              parseInt(req.appSettings["antserver_media_hlssupported"]) == 1
            ) {
              valid = false;
            } else if (
              parseInt(req.appSettings["antserver_media_hlssupported"]) != 1
            ) {
              insertObject["240p"] = 1;
              if (parseInt(videoObj["240p"]) == 1) {
                valid = false;
              }
            }
            if (valid) {
              globalModel
                .update(
                  req,
                  insertObject,
                  "videos",
                  "video_id",
                  videoObj.video_id
                )
                .then(async (result) => {})
                .catch((err) => {});
            }
          }
        }
      });
  }
  res.send({ status: true });
};

exports.createKey = async (req, res) => {
  const https = require("https");
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  let reqData = {
    listenerHookURL: process.env.PUBLIC_URL + "/api/live-streaming/status",
    streamId: req.body.streamingId,
    type: "liveStream",
    name: req.user.user_id + " - " + req.user.displayname + " live streaming",
    rtmpURL:
      "rtmp://" +
      req.appSettings["antserver_media_url"]
        .replace("https://", "")
        .replace("http://", "") +
      `/${req.appSettings["antserver_media_app"]}`,
  };
  var config = {
    method: "post",
    url:
      req.appSettings["antserver_media_url"].replace("https://", "http://") +
      `:5080/${req.appSettings["antserver_media_app"]}/rest/v2/broadcasts/create`,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    data: JSON.stringify(reqData),
    //httpsAgent: agent
  };
  axios(config)
    .then(function (response) {
      if (response.data.status == "created") {
        var myDate = new Date();
        myDate.setHours(myDate.getHours() + 24);
        var config = {
          method: "get",
          url:
            req.appSettings["antserver_media_url"].replace(
              "https://",
              "http://"
            ) +
            `:5080/${req.appSettings["antserver_media_app"]}/rest/v2/broadcasts/` +
            req.body.streamingId +
            "/token?expireDate=" +
            (myDate.getTime() / 1000).toFixed(0) +
            "&type=publish",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          //httpsAgent: agent
        };
        axios(config).then(function (response) {
          if (response.data.tokenId) {
            return res
              .send({ status: true, token: response.data.tokenId })
              .end();
          } else {
            return res.send({ error: true }).end();
          }
        });
      } else {
        return res.send({ error: true }).end();
      }
    })
    .catch(function (error) {
      console.log(error);
      return res.send({ error: error, status: false }).end();
    });
};

exports.generateAccessToken = async (req, resp) => {
  // set response header
  resp.header("Acess-Control-Allow-Origin", "*");
  // get channel name
  const channelName = req.query.channelName;
  if (!channelName) {
    return resp.status(500).json({ error: "channel is required" });
  }
  let settings = await settingModel.settingData(req);
  let APP_ID = settings["agora_app_id"];
  let APP_CERTIFICATE = settings["agora_app_certificate"];

  // get uid
  let uid = 0;

  // get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == "publisher") {
    //for host
    role = RtcRole.PUBLISHER;
  }
  // get the expire time
  let expireTime = 3600 * 10;

  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json({ token: token });
};

exports.addViewer = async (req, res) => {
  res.send({});
  let customUrl = req.body.custom_url;
  globalModel
    .custom(
      req,
      "UPDATE videos SET total_viewer = total_viewer + 1 WHERE custom_url = ?",
      [customUrl]
    )
    .then((result) => {});
  socketio.getIO().emit("liveStreamingViewerAdded", {
    custom_url: customUrl,
  });
};
exports.removeViewer = async (req, res) => {
  res.send({});
  let customUrl = req.body.custom_url;
  globalModel
    .custom(
      req,
      "UPDATE videos SET total_viewer = IF(total_viewer = 0,1, total_viewer) - 1 WHERE custom_url = ?",
      [customUrl]
    )
    .then((result) => {});
  socketio.getIO().emit("liveStreamingViewerDelete", {
    custom_url: customUrl,
  });
};
exports.goLive = async (req, res) => {
  let id = req.body.id;
  let videoObject = {};

  await globalModel
    .custom(req, "SELECT owner_id FROM videos WHERE video_id = ?", id)
    .then(async (result) => {
      if (result && result.length) {
        videoObject = JSON.parse(JSON.stringify(result))[0];
      }
    })
    .catch((err) => {});

  if (!Object.keys(videoObject).length) {
    return;
  }

  globalModel
    .custom(
      req,
      "UPDATE videos SET scheduled = null,is_livestreaming = 1 WHERE video_id = '" +
        id +
        "'"
    )
    .then((result) => {})
    .catch((err) => {});

  notificationModel
    .insertFollowNotifications(req, {
      subject_type: "users",
      subject_id: req.user.user_id,
      object_type: "videos",
      object_id: id,
      type: "livestreaming_live",
    })
    .then((result) => {})
    .catch((err) => {});

  notifications
    .insertScheduledFollowers(req, {
      subject_type: "users",
      subject_id: videoObject.owner_id,
      object_type: "videos",
      object_id: id,
      type: "videos_reminder",
    })
    .then((result) => {})
    .catch((err) => {});

  // let dataNotification = {}
  // dataNotification["type"] = "go_live"
  // dataNotification["owner_id"] = req.user.user_id
  // dataNotification["object_type"] = "videos"
  // dataNotification["object_id"] =  id
  // notificationModel.sendPoints(req,dataNotification,req.user.level_id);

  let dataScheduledNotification = {};
  dataScheduledNotification["type"] = "livestreaming_live";
  dataScheduledNotification["owner_id"] = req.user.user_id;
  dataScheduledNotification["object_type"] = "videos";
  dataScheduledNotification["object_id"] = id;
  notificationModel.sendPoints(
    req,
    dataScheduledNotification,
    req.user.level_id
  );

  res.send({ status: 1 });
};
exports.finishStreaming = async (req, res) => {
  let streamID = req.body.streamID;
  if (req.body.remove) {
    exports.deleteStream(req, streamID);
    return;
  }
  let updatecolumn = "";
  // is save streaming
  if (parseInt(req.appSettings["live_stream_save"]) == 0) {
    updatecolumn = ",mediaserver_stream_id = null ";
  }

  globalModel
    .custom(
      req,
      "UPDATE videos SET is_livestreaming = 0" +
        updatecolumn +
        " WHERE mediaserver_stream_id = '" +
        streamID +
        "'"
    )
    .then((result) => {})
    .catch((err) => {});

  await globalModel
    .update(
      req,
      { logo_active: 0, overlay_active: 0 },
      "live_brands",
      "user_id",
      req.user.user_id
    )
    .then((result) => {});
  await globalModel
    .update(req, { show: 0 }, "live_banners", "user_id", req.user.user_id)
    .then((result) => {});

  const https = require("https");
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  var config = {
    method: "post",
    url:
      req.appSettings["antserver_media_url"].replace("https://", "http://") +
      `:5080/${req.appSettings["antserver_media_app"]}/rest/v2/broadcasts/` +
      streamID +
      "/stop",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    //httpsAgent: agent
  };
  axios(config)
    .then(function (response) {
      exports.deleteStream(req, streamID);
      res.send({ status: true });
    })
    .catch(function (error) {
      res.send({ status: false, error });
    });
};
exports.deleteStream = (req, streamID) => {
  //delete broadcast
  var config = {
    method: "delete",
    url:
      req.appSettings["antserver_media_url"].replace("https://", "http://") +
      `:5080/${req.appSettings["antserver_media_app"]}/rest/v2/broadcasts/` +
      streamID,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    //httpsAgent: agent
  };
  axios(config)
    .then(function (response) {})
    .catch(function (error) {});
};
exports.mediaStreamRecord = async (req, res) => {
  let settings = await settingModel.settingData(req);
  let streamID = req.body.streamID;
  if (settings["live_stream_save"] != 1) {
    return res.send({});
  }

  const https = require("https");
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  var config = {
    method: "put",
    url:
      req.appSettings["antserver_media_url"].replace("https://", "http://") +
      `:5080/${req.appSettings["antserver_media_app"]}/rest/v2/broadcasts/` +
      streamID +
      "/recording/true",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    //httpsAgent: agent
  };
  axios(config)
    .then(function (response) {
      res.send({ status: true });
    })
    .catch(function (error) {
      res.send({ status: false, error });
    });
};
exports.reminder = async (req, res) => {
  let video_id = req.body.video_id;
  let data = {};
  var dt = dateTime.create();
  var formatted = dt.format("Y-m-d H:M:S");
  data["video_id"] = video_id;
  data["owner_id"] = req.user.user_id;
  data["creation_date"] = formatted;
  await videoModel
    .isScheduleActive(req, req.user.user_id, data.video_id)
    .then((result) => {
      if (result) {
        data["scheduleId"] = result.scheduled_video_id;
      }
    });
  await videoModel.insertScheduled(data, req, res).then((result) => {
    if (data["scheduleId"]) {
      socketio.getIO().emit("removeScheduledVideo", {
        id: video_id,
        ownerId: req.user.user_id,
      });
    } else {
      //insert
      socketio.getIO().emit("scheduledVideo", {
        id: video_id,
        ownerId: req.user.user_id,
      });
    }
    res.send({});
  });
};
exports.cloudRecrodingStart = async (req, res) => {
  let settings = await settingModel.settingData(req);
  let agora_app_id = settings["agora_app_id"];
  let AccessChannel = req.body.channel;
  let RecordingUID = req.body.channel.split("_")[1];
  let videoCustomUrl = req.body.custom_url;
  let token = req.body.token;

  globalModel
    .custom(
      req,
      "UPDATE videos SET channel_name = '" +
        AccessChannel +
        "' WHERE custom_url = '" +
        videoCustomUrl +
        "'"
    )
    .then((result) => {})
    .catch((err) => {});

  if (
    !agora_app_id ||
    settings["live_stream_save"] != 1 ||
    !settings["agora_customer_id"] ||
    !settings["agora_customer_certificate"] ||
    !settings["agora_s3_bucket"] ||
    !settings["agora_s3_access_key"] ||
    !settings["agora_s3_secret_access_key"] ||
    !settings["agora_s3_region"]
  ) {
    return res.send({});
  }

  let authorizationBasic = Buffer.from(
    settings["agora_customer_id"] + ":" + settings["agora_customer_certificate"]
  ).toString("base64");
  const https = require("https");
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  let reqData = { cname: AccessChannel, uid: RecordingUID, clientRequest: {} };
  var data = JSON.stringify(reqData);
  var config = {
    method: "post",
    url:
      "https://api.agora.io/v1/apps/" +
      agora_app_id +
      "/cloud_recording/acquire",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: "Basic " + authorizationBasic,
    },
    data: data,
    //httpsAgent: agent
  };

  axios(config)
    .then(function (response) {
      let acquireData = response.data;
      let resourceId = acquireData.resourceId;
      //start recording
      let regions = {
        "us-east-1": 0,
        "us-east-2": 1,
        "us-west-1": 2,
        "us-west-2": 3,
        "eu-west-1": 4,
        "eu-west-2": 5,
        "eu-west-3": 6,
        "eu-central-1": 7,
        "ap-southeast-1": 8,
        "ap-southeast-2": 9,
        "ap-northeast-1": 10,
        "ap-northeast-2": 11,
        "sa-east-1": 12,
        "ca-central-1": 13,
        "ap-south-1": 14,
        "cn-north-1": 15,
        "us-gov-west-1": 17,
      };

      var dataStart = {
        cname: AccessChannel,
        uid: RecordingUID,
        clientRequest: {
          token: token,
          recordingConfig: {
            channelType: 1,
            streamTypes: 2,
            audioProfile: 1,
            videoStreamType: 0,
            maxIdleTime: 120,
            transcodingConfig: {
              width: 1920,
              height: 1080,
              fps: 30,
              bitrate: 6300,
              mixedVideoLayout: 1,
              backgroundColor: "#000000",
            },
          },
          storageConfig: {
            vendor: 1,
            region: regions[settings["agora_s3_region"]],
            bucket: settings["agora_s3_bucket"],
            accessKey: settings["agora_s3_access_key"],
            secretKey: settings["agora_s3_secret_access_key"],
            fileNamePrefix: [
              "upload",
              "livestreamings",
              videoCustomUrl.toString(),
            ],
          },
        },
      };

      var configStart = {
        method: "post",
        url:
          "https://api.agora.io/v1/apps/" +
          agora_app_id +
          "/cloud_recording/resourceid/" +
          resourceId +
          "/mode/mix/start",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: "Basic " + authorizationBasic,
        },
        data: JSON.stringify(dataStart),
        //httpsAgent: agent
      };
      axios(configStart)
        .then(function (response) {
          let responseData = response.data;
          //save agora resource and sid for recording stopping purpose
          globalModel
            .custom(
              req,
              "UPDATE videos SET agora_resource_id = '" +
                resourceId +
                "',agora_sid = '" +
                responseData.sid +
                "' WHERE custom_url = '" +
                videoCustomUrl +
                "'"
            )
            .then((result) => {})
            .catch((err) => {});
          return res.send({ status: errorCodes.created }).end();
        })
        .catch(function (error) {
          return res
            .send({
              error: fieldErrors.errors([{ msg: error.message }], true),
              status: errorCodes.invalid,
            })
            .end();
        });
    })
    .catch(function (error) {
      return res
        .send({
          error: fieldErrors.errors([{ msg: error.message }], true),
          status: errorCodes.invalid,
        })
        .end();
    });
};

exports.cloudRecrodingStop = async (req, res) => {
  res.send({});
  let settings = await settingModel.settingData(req);
  let agora_app_id = settings["agora_app_id"];
  let AccessChannel = req.body.channel;
  let RecordingUID = req.body.channel.split("_")[1];
  let videoCustomUrl = req.body.custom_url;
  let videoObject = {};
  await globalModel
    .custom(
      req,
      "SELECT agora_resource_id,agora_sid FROM videos WHERE custom_url = ?",
      videoCustomUrl
    )
    .then(async (result) => {
      if (result && result.length) {
        videoObject = JSON.parse(JSON.stringify(result))[0];
      }
    })
    .catch((err) => {});

  if (!Object.keys(videoObject).length) {
    return;
  }
  globalModel
    .custom(
      req,
      "UPDATE videos SET is_livestreaming = 0 WHERE custom_url = '" +
        videoCustomUrl +
        "'"
    )
    .then((result) => {})
    .catch((err) => {});

  if (
    !agora_app_id ||
    settings["live_stream_save"] != 1 ||
    !settings["agora_customer_id"] ||
    !settings["agora_customer_certificate"] ||
    !settings["agora_s3_bucket"] ||
    !settings["agora_s3_access_key"] ||
    !settings["agora_s3_secret_access_key"] ||
    !settings["agora_s3_region"]
  ) {
    return;
  }
  const https = require("https");
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  let authorizationBasic = Buffer.from(
    settings["agora_customer_id"] + ":" + settings["agora_customer_certificate"]
  ).toString("base64");
  let reqData = { cname: AccessChannel, uid: RecordingUID, clientRequest: {} };
  var config = {
    method: "post",
    url:
      "https://api.agora.io/v1/apps/" +
      agora_app_id +
      "/cloud_recording/resourceid/" +
      videoObject.agora_resource_id +
      "/sid/" +
      videoObject.agora_sid +
      "/mode/mix/stop",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: "Basic " + authorizationBasic,
    },
    data: JSON.stringify(reqData),
    //httpsAgent: agent
  };
  axios(config)
    .then(function (response) {
      let responseData = response.data;
      let customData = "";
      if (responseData.serverResponse && responseData.serverResponse.fileList) {
        //responseData.serverResponse.fileList
        customData = "code = '" + responseData.serverResponse.fileList + "'";
        globalModel
          .custom(
            req,
            "UPDATE videos SET " +
              customData +
              ", is_livestreaming = 0 WHERE custom_url = '" +
              videoCustomUrl +
              "'"
          )
          .then((result) => {})
          .catch((err) => {});
      }
      //return res.send({ status: errorCodes.created }).end();
    })
    .catch(function (error) {
      console.log(" error stop video", error);
      return res
        .send({
          error: fieldErrors.errors([{ msg: error.message }], true),
          status: errorCodes.invalid,
        })
        .end();
    });
};
exports.artists = async (req, res) => {
  let id = req.body.video_id;
  let video = {};
  if (id) {
    //uploaded
    await globalModel
      .custom(req, "SELECT * FROM videos WHERE video_id = ?", id)
      .then(async (result) => {
        if (result && result.length) {
          video = JSON.parse(JSON.stringify(result))[0];
        } else {
          id = null;
        }
      })
      .catch((err) => {});
  } else {
    return res.send({});
  }
  if (!id || !Object.keys(video).length) {
    return res.send({});
  }
  //fetch artists
  let LimitNumArtist = 17;
  let pageArtist = 1;
  if (req.body.page == "") {
    pageArtist = 1;
  } else {
    //parse int Convert String to number
    pageArtist = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
  }
  let offsetArtist = (pageArtist - 1) * LimitNumArtist;
  if (
    video.artists &&
    video.artist != "" &&
    req.appSettings["video_artists"] == "1"
  ) {
    await artistModel
      .findByIds(video.artists, req, res, LimitNumArtist, offsetArtist)
      .then((result) => {
        let pagging = false;
        if (result) {
          pagging = false;
          if (result.length > LimitNumArtist - 1) {
            result = result.splice(0, LimitNumArtist - 1);
            pagging = true;
          }
          res.send({
            pagging: pagging,
            artists: result,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    res.send({
      pagging: false,
      artists: [],
    });
  }
};
exports.delete = async (req, res) => {
  if (!req.item) {
    return res
      .send({
        error: fieldErrors.errors(
          [{ msg: constant.general.PERMISSION_ERROR }],
          true
        ),
        status: errorCodes.invalid,
      })
      .end();
  }

  await videoModel.delete(req.item.video_id, req).then((result) => {
    if (result) {
      commonFunction.deleteImage(req, res, "", "video", req.item);
      res.send({ message: constant.video.DELETED });
      socketio.getIO().emit("videoDeleted", {
        video_id: req.item.video_id,
        message: constant.video.DELETED,
      });
    } else {
      res.send({});
    }
  });
};
exports.category = async (req, res) => {
  req.query.id = req.params.id;
  req.query.type = "video";
  let category = {};
  let send = false;
  let limit = 21;
  let page = 1;
  if (req.body.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
  }

  let offset = (page - 1) * (limit - 1);
  await categoryModel
    .findByCustomUrl({ id: req.query.id, type: req.query.type }, req, res)
    .then(async (result) => {
      if (result) {
        category = result;
        const data = { limit: limit, offset: offset };
        if (category.subcategory_id == 0 && category.subsubcategory_id == 0) {
          data["category_id"] = category.category_id;
        } else if (category.subcategory_id > 0) {
          data["subcategory_id"] = category.category_id;
        } else if (category.subsubcategory_id > 0) {
          data["subsubcategory_id"] = category.category_id;
        }
        //get all blogs as per categories
        await videoModel.getVideos(req, data).then((result) => {
          if (result) {
            let pagging = false;
            let items = result;
            if (result.length > limit - 1) {
              items = result.splice(0, limit - 1);
              pagging = true;
            }
            send = true;
            res.send({ pagging: pagging, items: items });
          }
        });
      }
    })
    .catch((error) => {
      res.send({ pagging: false, items: [] });
      return;
    });
  if (!send) res.send({ pagging: false, items: [] });
};
exports.browse = async (req, res) => {
  const queryString = req.query;
  let limit = 21;
  let page = 1;
  if (parseInt(req.body.limit)) {
    limit = parseInt(req.body.limit);
  }
  if (req.body.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
  }

  let offset = (page - 1) * (limit - 1);
  const data = { limit: limit, offset: offset };
  data["type"] = queryString.type;
  if (queryString.q && !queryString.tag) {
    data["title"] = queryString.q;
  }

  data["pageType"] = req.body.pageType;
  data["liveStreamingPage"] = req.body.liveStreamingPage;
  if (queryString.type) {
    data["tags"] = queryString.tag;
  }
  if (queryString.category_id) {
    data["category_id"] = queryString.category_id;
  }
  if (queryString.subcategory_id) {
    data["subcategory_id"] = queryString.subcategory_id;
  }
  if (queryString.subsubcategory_id) {
    data["subsubcategory_id"] = queryString.subsubcategory_id;
  }
  if (queryString.sort == "latest") {
    data["orderby"] = "videos.video_id desc";
  } else if (
    queryString.sort == "favourite" &&
    req.appSettings["video_favourite"] == 1
  ) {
    data["orderby"] = "videos.favourite_count desc";
  } else if (queryString.sort == "view") {
    data["orderby"] = "videos.view_count desc";
  } else if (
    queryString.sort == "like" &&
    req.appSettings["video_like"] == "1"
  ) {
    data["orderby"] = "videos.like_count desc";
  } else if (
    queryString.sort == "dislike" &&
    req.appSettings["video_dislike"] == "1"
  ) {
    data["orderby"] = "videos.dislike_count desc";
  } else if (
    queryString.sort == "rated" &&
    req.appSettings["video_rating"] == "1"
  ) {
    data["orderby"] = "videos.rating desc";
  } else if (
    queryString.sort == "commented" &&
    req.appSettings["video_comment"] == "1"
  ) {
    data["orderby"] = "videos.comment_count desc";
  }

  if (
    queryString.type == "featured" &&
    req.appSettings["video_featured"] == 1
  ) {
    data["is_featured"] = 1;
  } else if (
    queryString.type == "sponsored" &&
    req.appSettings["video_sponsored"] == 1
  ) {
    data["is_sponsored"] = 1;
  } else if (queryString.type == "hot" && req.appSettings["video_hot"] == 1) {
    data["is_hot"] = 1;
  }

  if (req.body.videoPurchased) {
    data.purchaseVideo = true;
    data.purchase_user_id = req.body.purchase_user_id
      ? req.body.purchase_user_id
      : req.body.video_user_id;
  }

  //get all videos as per categories
  await videoModel
    .getVideos(req, data)
    .then((result) => {
      if (result) {
        let pagging = false;
        let items = result;
        if (result.length > limit - 1) {
          items = result.splice(0, limit - 1);
          pagging = true;
        }
        res.send({ videos: items, pagging: pagging });
      }
    })
    .catch((err) => {
      res.send({});
    });
};
exports.getGiftDonors = async (req, res) => {
  const video_id = req.body.video_id;
  if (!video_id) {
    return res.send({});
  }
  let LimitNum = 21;
  let page = 1;
  if (req.params.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
  }
  let videos = {};
  let offset = (page - 1) * (LimitNum - 1);

  //get donors
  await videoModel
    .giftsenders({ video_id: video_id, limit: LimitNum, offset: offset }, req)
    .then((result) => {
      let pagging = false;
      if (result) {
        pagging = false;
        if (result.length > LimitNum - 1) {
          result = result.splice(0, LimitNum - 1);
          pagging = true;
        }
        videos = {
          pagging: pagging,
          members: result,
        };
      }
    })
    .catch((error) => {});
  res.send(videos);
};
exports.getDonors = async (req, res) => {
  const video_id = req.body.video_id;
  if (!video_id) {
    return res.send({});
  }
  let LimitNum = 21;
  let page = 1;
  if (req.params.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
  }
  let videos = {};
  let offset = (page - 1) * (LimitNum - 1);

  //get donors
  await videoModel
    .donors({ video_id: video_id, limit: LimitNum, offset: offset }, req)
    .then((result) => {
      let pagging = false;
      if (result) {
        pagging = false;
        if (result.length > LimitNum - 1) {
          result = result.splice(0, LimitNum - 1);
          pagging = true;
        }
        videos = {
          pagging: pagging,
          members: result,
        };
      }
    })
    .catch((error) => {});
  res.send(videos);
};
exports.getVideos = async (req, res, next) => {
  const criteria = req.body.criteria;
  const value = req.body.value;

  let LimitNum = 21;
  let page = 1;
  if (req.body.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
  }

  let offset = (page - 1) * (LimitNum - 1);

  const data = {};
  if (criteria == "search") {
    data.title = value;
  } else if (criteria == "my") {
    data.owner_id = req.user ? req.user.user_id : "0";
  } else if (criteria == "url") {
    var final = value.substr(value.lastIndexOf("/") + 1);
    data.custom_url = final;
    offset = null;
    page = 1;
  }
  if (req.body.channel_id) {
    data.channel_id = req.body.channel_id;
  }
  data.limit = LimitNum;
  data.offset = offset;
  data.search = true;
  let send = false;
  await videoModel
    .getVideos(req, data)
    .then((result) => {
      if (result && result.length > 0) {
        send = true;
        let pagging = false;
        if (result.length > LimitNum - 1) {
          result = result.splice(0, LimitNum - 1);
          pagging = true;
        }
        return res.send({ pagging: pagging, videos: result });
      }
    })
    .catch((error) => {});
  if (!req.headersSent && !send) res.send({ pagging: false, videos: [] });
};
exports.importUrl = async (req, res, next) => {
  if (req.quotaLimitError) {
    return res
      .send({
        error: fieldErrors.errors([{ msg: constant.video.QUOTAREACHED }], true),
        status: errorCodes.invalid,
      })
      .end();
  }
  const url = req.body["import-url"];
  if (
    req.appSettings["enable_iframely"] != "1" ||
    req.appSettings["iframely_api_key"] == ""
  ) {
    await commonFunction
      .getUploadVideoInfo(url)
      .then(async (result) => {
        if (!result.status) {
          let type = 0;
          let channel = "";
          if (result.provider == "youtube") {
            type = 1;
          } else if (result.provider == "vimeo") {
            type = 2;
          } else if (result.provider == "dailymotion") {
            type = 4;
          } else if (
            result.provider == "twitch" &&
            result.mediaType == "video"
          ) {
            type = 5;
          } else if (
            result.provider == "twitch" &&
            result.mediaType == "clip"
          ) {
            type = 6;
            channel = result.channel + "," + result.id;
          } else if (
            result.provider == "twitch" &&
            result.mediaType == "stream"
          ) {
            type = 8;
            channel = result.channel;
          } else if (result.provider == "facebook") {
            type = 7;
          } else if (result.provider == "mp4_mov") {
            type = 9;
            let responseData = {};
            responseData["type"] = type;
            responseData["code"] = result.id;
            return res.send(responseData);
          }
          const code = result.id;
          await commonFunction
            .getVideoData(result.provider, result.id, req, result)
            .then((result) => {
              if (result) {
                let responseData = result;
                responseData["type"] = type;
                responseData["code"] = code;
                if (channel) responseData["code"] = channel;
                return res.send(responseData);
              } else {
                return res
                  .send({
                    error: fieldErrors.errors(
                      [{ msg: "Please provide valid url." }],
                      true
                    ),
                    status: errorCodes.invalid,
                  })
                  .end();
              }
            })
            .catch((error) => {
              return res
                .send({
                  error: fieldErrors.errors(
                    [{ msg: "Please provide valid url." }],
                    true
                  ),
                  status: errorCodes.invalid,
                })
                .end();
            });
        }
      })
      .catch((error) => {
        console.log(error);
        return res
          .send({
            error: fieldErrors.errors(
              [{ msg: "Please provide valid url." }],
              true
            ),
            status: errorCodes.invalid,
          })
          .end();
      });
  } else {
    const key = req.appSettings["iframely_api_key"];
    const disallowDomain = req.appSettings["iframely_disallow_sources"] || "";

    await commonFunction
      .iframely(url, key, disallowDomain, req)
      .then(async (resultData) => {
        if (!resultData) {
          return res
            .send({
              error: fieldErrors.errors(
                [{ msg: "Please provide valid url." }],
                true
              ),
              status: errorCodes.invalid,
            })
            .end();
        }
        await commonFunction
          .getUploadVideoInfo(url)
          .then(async (result) => {
            let responseData = resultData;
            let type = null;
            let channel = null;
            const code = result.id;
            responseData["code"] = code;
            if (result.provider == "youtube") {
              type = 1;
            } else if (result.provider == "vimeo") {
              type = 2;
            } else if (result.provider == "dailymotion") {
              type = 4;
            } else if (
              result.provider == "twitch" &&
              result.mediaType == "video"
            ) {
              type = 5;
            } else if (
              result.provider == "twitch" &&
              result.mediaType == "clip"
            ) {
              type = 6;
              channel = result.channel;
            } else if (result.provider == "facebook") {
              type = 7;
            } else {
              type = 20;
              responseData["code"] = resultData["html"];
            }
            responseData["type"] = type;
            if (type == 6) responseData["channel"] = channel;
            return res.send(responseData);
          })
          .catch((error) => {
            return res
              .send({
                error: fieldErrors.errors(
                  [{ msg: "Please provide valid url." }],
                  true
                ),
                status: errorCodes.invalid,
              })
              .end();
          });
      })
      .catch((error) => {
        return res
          .send({
            error: fieldErrors.errors(
              [{ msg: "Please provide valid url." }],
              true
            ),
            status: errorCodes.invalid,
          })
          .end();
      });
  }
};
exports.password = async (req, res) => {
  let password = req.body.password;
  let id = req.params.id;

  let video = {};

  await videoModel
    .findByCustomUrl(id, req, res, true)
    .then((result) => {
      if (result) video = result;
    })
    .catch((error) => {});

  if (video.password == password) {
    req.session.password.push(video.video_id);
    res.send({});
    return;
  }
  return res
    .send({
      error: fieldErrors.errors(
        [{ msg: "Password you entered is not correct." }],
        true
      ),
      status: errorCodes.invalid,
    })
    .end();
};

exports.create = async (req, res) => {
  await commonFunction.getGeneralInfo(req, res, "", true);
  if (req.imageError) {
    return res
      .send({
        error: fieldErrors.errors([{ msg: req.imageError }], true),
        status: errorCodes.invalid,
      })
      .end();
  }
  if (req.quotaLimitError) {
    return res
      .send({
        error: fieldErrors.errors(
          [{ msg: constant.video.liveStreaming }],
          true
        ),
        status: errorCodes.invalid,
      })
      .end();
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .send({ error: fieldErrors.errors(errors), status: errorCodes.invalid })
      .end();
  }
  if (req.body.price) {
    if (parseFloat(req.body.price) < 0) {
      return res
        .send({
          error: fieldErrors.errors(
            [{ msg: "Please provide valid price." }],
            true
          ),
          status: errorCodes.invalid,
        })
        .end();
    }
  }
  // all set now
  let insertObject = {};
  let id = req.body.id;
  let videoObject = {};
  if (id) {
    //uploaded
    await globalModel
      .custom(req, "SELECT * FROM videos WHERE video_id = ?", id)
      .then(async (result) => {
        if (result && result.length) {
          videoObject = JSON.parse(JSON.stringify(result))[0];
          if (!req.body.videoResolution) {
            await privacyModel
              .permission(req, "video", "edit", videoObject)
              .then((result) => {
                if (!result && !req.body.videoResolution) {
                  id = null;
                  videoObject = null;
                }
              })
              .catch((err) => {
                id = null;
              });
          }
        } else {
          id = null;
        }
      })
      .catch((err) => {});
  } else {
    insertObject["owner_id"] = req.user.user_id;
  }
  if (typeof req.body.comments != "undefined") {
    insertObject["autoapprove_comments"] = parseInt(req.body.comments);
  }
  insertObject["title"] = req.body.title;
  insertObject["description"] = req.body.description
    ? req.body.description
    : "";
  insertObject["category_id"] = req.body.category_id ? req.body.category_id : 0;
  insertObject["subcategory_id"] = req.body.subcategory_id
    ? req.body.subcategory_id
    : 0;
  insertObject["subsubcategory_id"] = req.body.subsubcategory_id
    ? req.body.subsubcategory_id
    : 0;
  insertObject["price"] =
    parseFloat(req.body.price) > 0 ? parseFloat(req.body.price) : 0;
  insertObject["adult"] = req.body.adult ? req.body.adult : 0;
  insertObject["search"] = req.body.search ? req.body.search : 1;
  insertObject["view_privacy"] = req.body.privacy
    ? req.body.privacy
    : "everyone";
  if (
    insertObject["view_privacy"] == "password" &&
    req.body.password &&
    req.body.password != ""
  ) {
    insertObject["password"] = req.body.password;
    insertObject["is_locked"] = 1;
  } else {
    if (insertObject["view_privacy"] == "password")
      insertObject["view_privacy"] = "everyone";
    insertObject["password"] = "";
    insertObject["is_locked"] = 0;
  }

  if (req.body.scheduled) {
    let dateS = moment(req.body.scheduled);
    insertObject["scheduled"] = dateS
      .tz(process.env.TZ)
      .format("YYYY-MM-DD HH:mm:ss");
  } else {
    insertObject["scheduled"] = null;
  }

  if (req.body.duration && req.body.duration != "undefined")
    insertObject["duration"] = req.body.duration;

  if (req.body.type && req.body.type != "undefined")
    insertObject["type"] = req.body.type;
  if (req.body.code && req.body.code != "undefined") {
    if (req.body.type == 5) {
      req.body.code = req.body.code.substr(1);
    }
    insertObject["code"] =
      req.body.type != 6
        ? req.body.code
        : req.body.code + "," + req.body.channel;
  }
  if (req.liveStreaming) {
    insertObject["type"] = 10;
  }
  if (req.body.videoImage) {
    if (req.body.videoImage.indexOf(process.env.PUBLIC_URL) < 0)
      insertObject["image"] = req.body.videoImage;

    let image = await commonFunction.generateImageFromOpenAi(
      req,
      req.body.videoImage
    );
    if (image) {
      insertObject["image"] = image;
    }
  } else if (req.fileName) {
    if (req.liveStreaming) {
      insertObject["image"] = "/upload/images/live-streaming/" + req.fileName;
    } else {
      insertObject["image"] = "/upload/images/videos/video/" + req.fileName;
    }
  } else {
    insertObject["image"] = "";
    if (Object.keys(videoObject).length && videoObject.image)
      commonFunction.deleteImage(req, res, videoObject.image, "video/image");
  }

  if (
    req.body.streamingId &&
    parseInt(req.appSettings["live_streaming_type"]) == 0
  ) {
    insertObject["mediaserver_stream_id"] = req.body.streamingId;
    insertObject["type"] = 11;
  }

  if (Object.keys(videoObject).length && id) {
    if (!req.fileName && !req.body.fromEdit) {
      const image = videoObject.image;
      if (image) {
        const extension = path.extname(image);
        const file = path.basename(image, extension);
        const pathName = req.serverDirectoryPath + "/public";
        const newFileName = file + "_video" + extension;
        req.imageResize = [
          { width: req.widthResize, height: req.heightResize },
        ];
        var resizeObj = new resize(pathName, image, req);
        await resizeObj
          .save(pathName + "/upload/images/videos/video/" + newFileName)
          .then(async (res) => {
            commonFunction.deleteImage(
              req,
              res,
              videoObject.image,
              "video/image"
            );
            insertObject["image"] =
              "/upload/images/videos/video/" + newFileName;
            if (
              req.appSettings.upload_system == "s3" ||
              req.appSettings.upload_system == "wisabi"
            ) {
              await s3Upload(
                req,
                req.serverDirectoryPath + "/public" + insertObject["image"],
                insertObject["image"]
              )
                .then((result) => {
                  //remove local file
                  //commonFunction.deleteImage(req, res, insertObject['image'], 'locale')
                })
                .catch((err) => {});
            }
          });
      }
    } else if (!req.liveStreaming) {
      if (req.fileName) {
        insertObject["image"] = "/upload/images/videos/video/" + req.fileName;
        commonFunction.deleteImage(req, res, videoObject.image, "video/image");
      }
    }
    if (!req.body.fromEdit) insertObject["status"] = 2;
  }
  var dt = dateTime.create();
  var formatted = dt.format("Y-m-d H:M:S");
  if (req.body.videoResolution) {
    insertObject["resolution"] = req.body.videoResolution;
  }
  if (!Object.keys(videoObject).length || !videoObject.custom_url) {
    insertObject["custom_url"] = uniqid.process("v");
    insertObject["is_sponsored"] =
      req.levelPermissions["video.sponsored"] == "1" ? 1 : 0;
    insertObject["is_featured"] =
      req.levelPermissions["video.featured"] == "1" ? 1 : 0;
    insertObject["is_hot"] = req.levelPermissions["video.hot"] == "1" ? 1 : 0;
    if (!req.liveStreaming) {
      if (
        req.levelPermissions["video.auto_approve"] &&
        req.levelPermissions["video.auto_approve"] == "1"
      )
        insertObject["approve"] = 1;
      else insertObject["approve"] = 0;
    } else {
      if (req.appSettings["live_streaming_type"] == 0) {
        if (
          typeof req.levelPermissions["livestreaming.approve"] == "undefined" ||
          req.levelPermissions["livestreaming.approve"] == "1"
        ) {
          insertObject["approve"] = 1;
        } else insertObject["approve"] = 0;
      } else {
        insertObject["approve"] = 1;
      }
    }
    if (!videoObject || videoObject.type != 3) insertObject["completed"] = 1;
    if (req.liveStreaming) insertObject["completed"] = 1;
    insertObject["creation_date"] = formatted;
  }
  insertObject["modified_date"] = formatted;

  let tags = req.body.tags;
  let artists = req.body.artists;
  if (tags && tags.length > 0) insertObject["tags"] = tags;
  else {
    insertObject["tags"] = null;
  }
  if (artists && artists.length > 0) insertObject["artists"] = artists;
  else {
    insertObject["artists"] = null;
  }
  if (
    req.liveStreaming &&
    !req.body.scheduled &&
    insertObject["approve"] == 1
  ) {
    insertObject["is_livestreaming"] = 1;
  }

  if (req.body.enable_chat) {
    insertObject["enable_chat"] = req.body.enable_chat;
  }

  if (id) {
    //update existing video
    await globalModel
      .update(req, insertObject, "videos", "video_id", id)
      .then(async (result) => {
        //create tip data
        if (req.body.tips) {
          let tips = JSON.parse(req.body.tips);
          await exports.createTips(req, tips, id);
        }

        //delete tip data
        if (req.body.removeTips) {
          let removeTips = JSON.parse(req.body.removeTips);
          await exports.deleteTip(req, removeTips, id);
        }

        if (req.body.channel_id) {
          //add video to channel
          const channel_id = req.body.channel_id;
          const video_ids = "" + id;
          //insert videos
          if (video_ids) {
            await exports
              .insertVideos(req, video_ids, channel_id)
              .then((result) => {
                if (result) {
                  if (videoObject["type"] != 3) {
                    notificationModel
                      .insertFollowNotifications(req, {
                        subject_type: "channels",
                        subject_id: channel_id,
                        object_type: "videos",
                        object_id: video_ids.split(",")[0],
                        type: "channels_followed",
                      })
                      .then((result) => {})
                      .catch((err) => {});
                  }
                  socketio.getIO().emit("videoAdded", {
                    channel_id: channel_id,
                    message:
                      videoObject["type"] == 3
                        ? constant.channel.VIDEONOTIFYEDADDED
                        : constant.channel.VIDEOADDED,
                  });
                }
              });
          }
        }

        if (!videoObject["custom_url"] && !insertObject["scheduled"]) {
          let dataNotification = {};
          dataNotification["type"] = "videos_create";
          dataNotification["owner_id"] = req.user.user_id;
          dataNotification["object_type"] = "videos";
          dataNotification["object_id"] = videoObject.video_id;
          notificationModel.sendPoints(
            req,
            dataNotification,
            req.user.level_id
          );
        }
        let videoObj = null;
        //if(insertObject["scheduled"]){
        await videoModel
          .findByCustomUrl(
            videoObject["custom_url"]
              ? videoObject["custom_url"]
              : insertObject["custom_url"],
            req,
            res
          )
          .then((result) => {
            if (result) {
              if (result.scheduled) {
                let date = moment(result.scheduled);
                result.scheduled = date.tz(process.env.TZ).toDate();
              }
              videoObj = result;
            }
          });
        //}
        res.send({
          editItem: videoObj,
          approved: videoObj ? videoObj.approve : "",
          id: id,
          message: videoObject["custom_url"]
            ? constant.video.EDIT
            : constant.video.SUCCESS,
          custom_url: videoObject["custom_url"]
            ? videoObject["custom_url"]
            : insertObject["custom_url"],
        });
        if (req.body.fromEdit) {
          id = null;
          res.end();
          return;
        }
      })
      .catch((err) => {
        console.log(err);
        return res
          .send({
            error: fieldErrors.errors(
              [{ msg: constant.general.DATABSE }],
              true
            ),
            status: errorCodes.invalid,
          })
          .end();
      });
  } else {
    //create new video
    await globalModel
      .create(req, insertObject, "videos")
      .then(async (result) => {
        if (result) {
          let videoObj = null;
          //if(insertObject["scheduled"]){
          await videoModel
            .findByCustomUrl(
              videoObject["custom_url"]
                ? videoObject["custom_url"]
                : insertObject["custom_url"],
              req,
              res
            )
            .then((result) => {
              if (result) {
                if (result.scheduled) {
                  let date = moment(result.scheduled);
                  result.scheduled = date.tz(process.env.TZ).toDate();
                }
                videoObj = result;
              }
            });
          //}

          let imagevideo = "";
          if (insertObject["image"]) {
            imagevideo = insertObject["image"];
          } else {
            // if(!req.liveStreaming)
            imagevideo = req.appSettings["video_default_photo"];
            // else
            //   imagevideo = req.appSettings['livestreaming_default_photo']
          }
          //create tip data
          if (req.body.tips) {
            let tips = JSON.parse(req.body.tips);
            await exports.createTips(req, tips, result.insertId);
          }
          if (
            req.liveStreaming &&
            !insertObject["scheduled"] &&
            parseInt(videoObj.approve) == 1
          ) {
            notificationModel
              .insertFollowNotifications(req, {
                subject_type: "users",
                subject_id: req.user.user_id,
                object_type: "videos",
                object_id: result.insertId,
                type: "live_video",
              })
              .then((result) => {})
              .catch((err) => {});
          }

          if (req.body.channel_id) {
            //add video to channel
            const channel_id = req.body.channel_id;
            const video_ids = "" + result.insertId;
            //insert videos
            if (video_ids) {
              await exports
                .insertVideos(req, video_ids, channel_id)
                .then((result) => {
                  if (result) {
                    if (insertObject["type"] != 3) {
                      notificationModel
                        .insertFollowNotifications(req, {
                          subject_type: "channels",
                          subject_id: channel_id,
                          object_type: "videos",
                          object_id: video_ids.split(",")[0],
                          type: "channels_followed",
                        })
                        .then((result) => {})
                        .catch((err) => {});
                    }
                    socketio.getIO().emit("videoAdded", {
                      channel_id: channel_id,
                      message:
                        insertObject["type"] == 3
                          ? constant.channel.VIDEONOTIFYEDADDED
                          : constant.channel.VIDEOADDED,
                    });
                  }
                });
            }
          } else {
            if (
              insertObject["type"] != 3 &&
              !insertObject["scheduled"] &&
              parseInt(videoObj.approve) == 1
            ) {
              await notificationModel
                .insertFollowNotifications(req, {
                  subject_type: "users",
                  subject_id: req.user.user_id,
                  object_type: "videos",
                  object_id: result.insertId,
                  type: "members_followed",
                })
                .then((result) => {})
                .catch((err) => {
                  console.log(err);
                });
            }
          }
          if (parseInt(videoObj.approve) == 1) {
            if (req.liveStreaming) {
              if (!insertObject["scheduled"]) {
                let dataNotification = {};
                dataNotification["type"] = "live_video";
                dataNotification["owner_id"] = req.user.user_id;
                dataNotification["object_type"] = "videos";
                dataNotification["object_id"] = result.insertId;
                notificationModel.sendPoints(
                  req,
                  dataNotification,
                  req.user.level_id
                );
              } else {
                await notificationModel
                  .insertFollowNotifications(req, {
                    subject_type: "users",
                    subject_id: req.user.user_id,
                    object_type: "videos",
                    object_id: result.insertId,
                    type: "scheduled_live",
                  })
                  .then((result) => {})
                  .catch((err) => {
                    console.log(err);
                  });
                let dataNotification = {};
                dataNotification["type"] = "scheduled_live";
                dataNotification["owner_id"] = req.user.user_id;
                dataNotification["object_type"] = "videos";
                dataNotification["object_id"] = result.insertId;
                notificationModel.sendPoints(
                  req,
                  dataNotification,
                  req.user.level_id
                );
              }
            } else {
              let dataNotification = {};
              dataNotification["type"] = "videos_create";
              dataNotification["owner_id"] = req.user.user_id;
              dataNotification["object_type"] = "videos";
              dataNotification["object_id"] = result.insertId;
              notificationModel.sendPoints(
                req,
                dataNotification,
                req.user.level_id
              );
            }
          }
          res.send({
            editItem: videoObj,
            approved: videoObj ? videoObj.approve : "",
            id: result.insertId,
            message: constant.video.SUCCESS,
            custom_url: insertObject["custom_url"],
            title: insertObject["title"],
            image: imagevideo,
          });
        } else {
          return res
            .send({
              error: fieldErrors.errors(
                [{ msg: constant.general.DATABSE }],
                true
              ),
              status: errorCodes.invalid,
            })
            .end();
        }
      })
      .catch((err) => {
        console.log(err);
        return res
          .send({
            error: fieldErrors.errors(
              [{ msg: constant.general.DATABSE }],
              true
            ),
            status: errorCodes.invalid,
          })
          .end();
      });
  }
};
exports.insertVideos = async (req, video_ids, channel_id) => {
  return new Promise(function (resolve, reject) {
    const ids = video_ids.split(",");
    async.forEachOf(
      ids,
      async function (video_id, i, callback) {
        var dt = dateTime.create();
        var formatted = dt.format("Y-m-d H:M:S");
        const channelVideoObj = [];
        channelVideoObj.push(video_id);
        channelVideoObj.push(channel_id);
        channelVideoObj.push(req.user.user_id);
        channelVideoObj.push(formatted);
        await channelVideosModel.insert(channelVideoObj, req, channel_id);
        if (i == ids.length - 1) {
          resolve(true);
        }
      },
      function (err) {
        if (!err) resolve(true);
        else resolve(false);
      }
    );
  });
};
exports.deleteTip = (req, deletes, videoID) => {
  return new Promise(async (resolve, reject) => {
    async.forEachOf(
      deletes,
      async function (deleteId, i, callback) {
        await globalModel.delete(req, "tips", "tip_id", deleteId);

        if (i == deletes.length - 1) {
          resolve(true);
        }
      },
      function (err) {
        resolve(true);
      }
    );
  });
};
exports.createTips = (req, tips, video_id, forceInsert = false) => {
  return new Promise(async (resolve, reject) => {
    var dt = dateTime.create();
    var formatted = dt.format("Y-m-d H:M:S");
    async.forEachOf(
      tips,
      async function (tipData, i, callback) {
        let tip = tips[i];
        let price = parseFloat(tip.amount).toFixed(2);
        if (price > 0) {
          //insert into database
          let insertObject = {};
          insertObject["amount"] = price;

          if (!tip.tip_id || forceInsert) {
            insertObject["resource_id"] = video_id;
            if (!forceInsert) insertObject["user_id"] = req.user.user_id;
            else insertObject["user_id"] = tip.user_id;
            insertObject["creation_date"] = formatted;
            insertObject["resource_type"] = "video";
            await globalModel
              .create(req, insertObject, "tips")
              .then((result) => {});
          } else {
            //update
            await globalModel
              .update(req, insertObject, "tips", "tip_id", tip.tip_id)
              .then((result) => {});
          }
        } else if (tip.tip_id) {
          //delete entry
          await globalModel.delete(req, "tips", "tip_id", tip.tip_id);
        }
        if (i == tips.length - 1) {
          resolve(true);
        }
      },
      function (err) {
        resolve(true);
      }
    );
  });
};

exports.convertVideo = async (req, videoObject) => {
  return new Promise(async (resolve, reject) => {
    const res = {};
    const videoResolution = videoObject.resolution;
    const videoLocation = videoObject.video_location;
    const FFMPEGpath = req.appSettings.video_ffmpeg_path;
    const id = videoObject.video_id;
    //convert videos
    var orgPath = req.serverDirectoryPath + "/public" + videoLocation;
    ffmpeg.setFfprobePath(
      req.appSettings["video_ffmpeg_path"].replace("ffmpeg", "ffprobe")
    );
    ffmpeg.setFfmpegPath(req.appSettings["video_ffmpeg_path"]);
    let command = ffmpeg(orgPath)
      //.audioCodec('libfaac')
      .videoCodec("libx264")
      .format("mp4");
    const videoName = uniqid.process("v");
    let watermarkImage =
      req.levelPermissions["video.watermark"] != ""
        ? req.serverDirectoryPath +
          "/public" +
          req.levelPermissions["video.watermark"]
        : "/public/upload/images/blank.png";
    const path_240 = "/public/upload/videos/video/" + videoName + "_240p.mp4";
    const path_640 = "/public/upload/videos/video/" + videoName + "_360p.mp4";
    const path_854 = "/public/upload/videos/video/" + videoName + "_480p.mp4";
    const path_1280 = "/public/upload/videos/video/" + videoName + "_720p.mp4";
    const path_1920 = "/public/upload/videos/video/" + videoName + "_1080p.mp4";
    const path_2048 = "/public/upload/videos/video/" + videoName + "_2048p.mp4";
    const path_3840 = "/public/upload/videos/video/" + videoName + "_4096p.mp4";
    let is_validVideo = false;
    const sample = "/public/upload/videos/video/" + videoName + "_sample.mp4";
    await module.exports
      .executeFFMPEG(
        command,
        req.serverDirectoryPath + path_240,
        240,
        orgPath,
        FFMPEGpath,
        watermarkImage,
        req
      )
      .then(async (result) => {
        //upate video 240
        if (
          req.appSettings.upload_system == "s3" ||
          req.appSettings.upload_system == "wisabi"
        ) {
          await s3Upload(
            req,
            req.serverDirectoryPath + path_240,
            path_240.replace("/public", "")
          )
            .then((result) => {
              //remove local file
              commonFunction.deleteImage(
                req,
                res,
                path_240.replace("/public", ""),
                "locale"
              );
            })
            .catch((err) => {});
        }
        const updatedObject = {};
        updatedObject["240p"] = 1;
        updatedObject["video_location"] = path_240.replace("/public", "");
        await globalModel
          .update(req, updatedObject, "videos", "video_id", id)
          .then((result) => {})
          .catch((error) => {});
        is_validVideo = true;
      })
      .catch((err) => {
        console.log(err);
      });
    if (is_validVideo) {
      const filePath =
        "/public" +
        "/upload/videos/video/" +
        videoName +
        "_sample_same" +
        path.extname(videoLocation);
      //create sample video
      await module.exports
        .createSample(
          orgPath,
          filePath,
          command,
          req,
          sample,
          FFMPEGpath,
          watermarkImage,
          res,
          id
        )
        .then((result) => {})
        .catch((err) => {});
    }

    if (
      (videoResolution >= 640 || videoResolution == 0) &&
      is_validVideo &&
      req.appSettings["video_upload_videos_type"].indexOf("360") > -1
    ) {
      await module.exports
        .executeFFMPEG(
          command,
          req.serverDirectoryPath + path_640,
          640,
          orgPath,
          FFMPEGpath,
          watermarkImage,
          req
        )
        .then(async (result) => {
          //upate video
          if (
            req.appSettings.upload_system == "s3" ||
            req.appSettings.upload_system == "wisabi"
          ) {
            await s3Upload(
              req,
              req.serverDirectoryPath + path_640,
              path_640.replace("/public", "")
            )
              .then((result) => {
                //remove local file
                commonFunction.deleteImage(
                  req,
                  res,
                  path_640.replace("/public", ""),
                  "locale"
                );
              })
              .catch((err) => {});
          }
          const updatedObject = {};
          updatedObject["360p"] = 1;
          await globalModel
            .update(req, updatedObject, "videos", "video_id", id)
            .then(async (result) => {})
            .catch((error) => {});
        })
        .catch((err) => {});
    }

    if (
      (videoResolution >= 854 || videoResolution == 0) &&
      is_validVideo &&
      req.appSettings["video_upload_videos_type"].indexOf("480") > -1
    ) {
      await module.exports
        .executeFFMPEG(
          command,
          req.serverDirectoryPath + path_854,
          854,
          orgPath,
          FFMPEGpath,
          watermarkImage,
          req
        )
        .then(async (result) => {
          //upate video
          if (
            req.appSettings.upload_system == "s3" ||
            req.appSettings.upload_system == "wisabi"
          ) {
            await s3Upload(
              req,
              req.serverDirectoryPath + path_854,
              path_854.replace("/public", "")
            )
              .then((result) => {
                //remove local file
                commonFunction.deleteImage(
                  req,
                  res,
                  path_854.replace("/public", ""),
                  "locale"
                );
              })
              .catch((err) => {});
          }
          const updatedObject = {};
          updatedObject["480p"] = 1;
          await globalModel
            .update(req, updatedObject, "videos", "video_id", id)
            .then(async (result) => {})
            .catch((error) => {});
        })
        .catch((err) => {});
    }

    if (
      (videoResolution >= 1280 || videoResolution == 0) &&
      is_validVideo &&
      req.appSettings["video_upload_videos_type"].indexOf("720") > -1
    ) {
      await module.exports
        .executeFFMPEG(
          command,
          req.serverDirectoryPath + path_1280,
          1280,
          orgPath,
          FFMPEGpath,
          watermarkImage,
          req
        )
        .then(async (result) => {
          //upate video
          if (
            req.appSettings.upload_system == "s3" ||
            req.appSettings.upload_system == "wisabi"
          ) {
            await s3Upload(
              req,
              req.serverDirectoryPath + path_1280,
              path_1280.replace("/public", "")
            )
              .then((result) => {
                //remove local file
                commonFunction.deleteImage(
                  req,
                  res,
                  path_1280.replace("/public", ""),
                  "locale"
                );
              })
              .catch((err) => {});
          }
          const updatedObject = {};
          updatedObject["720p"] = 1;
          await globalModel
            .update(req, updatedObject, "videos", "video_id", id)
            .then(async (result) => {})
            .catch((error) => {});
        })
        .catch((err) => {});
    }

    if (
      (videoResolution >= 1920 || videoResolution == 0) &&
      is_validVideo &&
      req.appSettings["video_upload_videos_type"].indexOf("1080") > -1
    ) {
      await module.exports
        .executeFFMPEG(
          command,
          req.serverDirectoryPath + path_1920,
          1920,
          orgPath,
          FFMPEGpath,
          watermarkImage,
          req
        )
        .then(async (result) => {
          //upate video
          if (
            req.appSettings.upload_system == "s3" ||
            req.appSettings.upload_system == "wisabi"
          ) {
            await s3Upload(
              req,
              req.serverDirectoryPath + path_1920,
              path_1920.replace("/public", "")
            )
              .then((result) => {
                //remove local file
                commonFunction.deleteImage(
                  req,
                  res,
                  path_1920.replace("/public", ""),
                  "locale"
                );
              })
              .catch((err) => {});
          }
          const updatedObject = {};
          updatedObject["1080p"] = 1;
          await globalModel
            .update(req, updatedObject, "videos", "video_id", id)
            .then(async (result) => {})
            .catch((error) => {});
        })
        .catch((err) => {});
    }

    if (
      (videoResolution >= 2048 || videoResolution == 0) &&
      is_validVideo &&
      req.appSettings["video_upload_videos_type"].indexOf("2048") > -1
    ) {
      await module.exports
        .executeFFMPEG(
          command,
          req.serverDirectoryPath + path_2048,
          2048,
          orgPath,
          FFMPEGpath,
          watermarkImage,
          req
        )
        .then(async (result) => {
          //upate video
          if (
            req.appSettings.upload_system == "s3" ||
            req.appSettings.upload_system == "wisabi"
          ) {
            await s3Upload(
              req,
              req.serverDirectoryPath + path_2048,
              path_2048.replace("/public", "")
            )
              .then((result) => {
                //remove local file
                commonFunction.deleteImage(
                  req,
                  res,
                  path_2048.replace("/public", ""),
                  "locale"
                );
              })
              .catch((err) => {});
          }
          const updatedObject = {};
          updatedObject["2048p"] = 1;
          await globalModel
            .update(req, updatedObject, "videos", "video_id", id)
            .then(async (result) => {})
            .catch((error) => {});
        })
        .catch((err) => {});
    }

    if (
      (videoResolution >= 3840 || videoResolution == 0) &&
      is_validVideo &&
      req.appSettings["video_upload_videos_type"].indexOf("4096") > -1
    ) {
      await module.exports
        .executeFFMPEG(
          command,
          req.serverDirectoryPath + path_3840,
          3840,
          orgPath,
          FFMPEGpath,
          watermarkImage,
          req
        )
        .then(async (result) => {
          //upate video
          if (
            req.appSettings.upload_system == "s3" ||
            req.appSettings.upload_system == "wisabi"
          ) {
            await s3Upload(
              req,
              req.serverDirectoryPath + path_3840,
              path_3840.replace("/public", "")
            )
              .then((result) => {
                //remove local file
                commonFunction.deleteImage(
                  req,
                  res,
                  path_3840.replace("/public", ""),
                  "locale"
                );
              })
              .catch((err) => {});
          }
          const updatedObject = {};
          updatedObject["4096p"] = 1;
          await globalModel
            .update(req, updatedObject, "videos", "video_id", id)
            .then(async (result) => {})
            .catch((error) => {});
        })
        .catch((err) => {});
    }

    const updatedObject = {};
    if (is_validVideo) updatedObject["status"] = 1;
    else updatedObject["status"] = 3;
    updatedObject["completed"] = 1;

    //unlink org file
    if (videoLocation)
      commonFunction.deleteImage(
        req,
        res,
        videoLocation.replace("/public", ""),
        "video/video"
      );

    await globalModel
      .update(req, updatedObject, "videos", "video_id", id)
      .then(async (result) => {
        //send socket data
      })
      .catch((error) => {});
    if (is_validVideo) {
      notifications
        .insert(req, {
          owner_id: videoObject.owner_id,
          insert: true,
          type: "videos_processed_complete",
          subject_type: "users",
          subject_id: videoObject.owner_id,
          object_type: "videos",
          object_id: id,
          forceInsert: true,
        })
        .then((result) => {})
        .catch((err) => {});
      notificationModel
        .insertFollowNotifications(req, {
          subject_type: "users",
          subject_id: videoObject.owner_id,
          object_type: "videos",
          object_id: id,
          type: "members_followed",
        })
        .then((result) => {})
        .catch((err) => {});
    } else {
      notifications
        .insert(req, {
          owner_id: videoObject.owner_id,
          insert: true,
          type: "videos_processed_failed",
          subject_type: "users",
          subject_id: videoObject.owner_id,
          object_type: "videos",
          object_id: id,
          forceInsert: true,
        })
        .then((result) => {})
        .catch((err) => {});
    }
    socketio.getIO().emit("videoCreated", {
      id: videoObject.custom_url,
      status: is_validVideo ? 1 : 0,
    });
    resolve(true);
  });
};

exports.createSample = async (
  orgPath,
  filePath,
  command,
  req,
  sample,
  FFMPEGpath,
  watermarkImage,
  res,
  id
) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(orgPath)
      .setStartTime("00:00:00")
      .setDuration("03")
      .output(req.serverDirectoryPath + filePath)
      .on("start", function (commandLine) {
        //console.log('Started: ' + commandLine);
      })
      .on("end", async function (err) {
        if (!err) {
          let commandNew = ffmpeg(req.serverDirectoryPath + filePath)
            //.audioCodec('libfaac')
            .videoCodec("libx264")
            .format("mp4");
          await module.exports
            .executeFFMPEG(
              commandNew,
              req.serverDirectoryPath + sample,
              640,
              req.serverDirectoryPath + filePath,
              FFMPEGpath,
              watermarkImage,
              req
            )
            .then(async (result) => {
              //upate video
              if (
                req.appSettings.upload_system == "s3" ||
                req.appSettings.upload_system == "wisabi"
              ) {
                await s3Upload(
                  req,
                  req.serverDirectoryPath + sample,
                  sample.replace("/public", "")
                )
                  .then((result) => {
                    //remove local file
                  })
                  .catch((err) => {});
                commonFunction.deleteImage(
                  req,
                  res,
                  sample.replace("/public", ""),
                  "locale"
                );
              }
              commonFunction.deleteImage(
                req,
                res,
                filePath.replace("/public", ""),
                "locale"
              );
              const updatedObject = {};
              updatedObject["sample"] = 1;
              await globalModel
                .update(req, updatedObject, "videos", "video_id", id)
                .then(async (result) => {})
                .catch((error) => {});
              resolve(true);
            })
            .catch((err) => {
              reject(false);
            });
        }
      })
      .on("error", function (err) {
        console.log("error: ", +err);
        reject(false);
      })
      .run();
  });
};
exports.executeFFMPEG = async (
  command,
  filePath,
  resolution,
  orgPath,
  FFMPEGpath,
  watermarkImage,
  req
) => {
  return new Promise((resolve, reject) => {
    //let commandString = FFMPEGpath+" -y -i "+orgPath+" -vcodec libx264 -preset slow -filter:v scale="+resolution+":-2 -crf 26 "+filePath+" 2>&1"
    command
      .clone()
      //.input(watermarkImage)
      // .outputOption([
      //     "-preset" , "slow",
      //     "-filter:v","scale="+resolution+":-2"
      // ])
      // .complexFilter([
      //     "-filter:v scale="+resolution+":-2 -crf 26"
      // ])

      .outputOption([
        "-preset",
        req.appSettings["video_conversion_type"]
          ? req.appSettings["video_conversion_type"]
          : "ultrafast",
        "-filter:v",
        "scale=" + resolution + ":-2",
        "-crf 26",
      ])
      // .complexFilter([
      //     "[0:v]scale=640:-1[bg];[bg][1:v]overlay=W-w-10:H-h-10"
      // ])
      .on("start", function (commandLine) {
        //console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on("progress", (progress) => {
        //console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
      })
      .on("error", (err) => {
        reject(false);
      })
      .on("end", () => {
        resolve(true);
      })
      .save(filePath);
  });
};

exports.upload = async (req, res) => {
  if (req.imageError) {
    return res
      .send({
        error: fieldErrors.errors([{ msg: req.imageError }], true),
        status: errorCodes.invalid,
      })
      .end();
  }
  if (req.uploadLimitError) {
    return res
      .send({
        error: fieldErrors.errors([{ msg: constant.video.LIMITERRROR }], true),
        status: errorCodes.invalid,
      })
      .end();
  }
  // validate upload limit
  // validate member role upload count limit
  if (req.quotaLimitError) {
    return res
      .send({
        error: fieldErrors.errors([{ msg: constant.video.QUOTAREACHED }], true),
        status: errorCodes.invalid,
      })
      .end();
  }
  let basePath = req.serverDirectoryPath + "/public";
  const filePath = basePath + "/upload/videos/video/" + req.fileName;
  let images = [];
  let duration = 0;
  let videoWidth = 0,
    videoHeight = 0,
    size = 0;
  ffmpeg.setFfprobePath(
    req.appSettings["video_ffmpeg_path"].replace("ffmpeg", "ffprobe")
  );
  ffmpeg.setFfmpegPath(req.appSettings["video_ffmpeg_path"]);
  var command = ffmpeg.ffprobe(filePath, function (err, metadata) {
    duration = metadata.format.duration.toString();
    videoWidth = metadata.streams[0].width
      ? metadata.streams[0].width
      : metadata.streams[1]
      ? metadata.streams[1].width
      : "";
    videoHeight = metadata.streams[0].height
      ? metadata.streams[0].height
      : metadata.streams[1]
      ? metadata.streams[1].height
      : "";
    size = metadata.format.size;
    ffmpeg(filePath)
      .on("filenames", function (filenames) {
        images = filenames;
      })
      .on("end", function () {
        //append base path in images
        let uploadedImages = [];
        images.forEach((image) => {
          uploadedImages.push(
            req.APP_HOST + "/upload/images/videos/video/" + image
          );
        });

        //create item video in table
        let videoObject = {};
        videoObject["owner_id"] = req.user.user_id;
        videoObject["completed"] = 0;
        videoObject["image"] = "/upload/images/videos/video/" + images[0];
        videoObject["video_location"] = "/upload/videos/video/" + req.fileName;
        videoObject["type"] = 3;
        videoObject["title"] = "Untitled";
        videoObject["view_privacy"] = "everyone";
        videoObject["custom_url"] = "";
        videoObject["description"] = "";
        var dt = dateTime.create();
        var formatted = dt.format("Y-m-d H:M:S");
        videoObject["creation_date"] = formatted;
        videoObject["modified_date"] = formatted;
        videoObject["status"] = 2;
        videoObject["size"] = size;
        var n = duration.indexOf(".");
        duration = duration.substring(0, n != -1 ? n : duration.length);
        let d = Number(duration);
        var h = Math.floor(d / 3600).toString();
        var m = Math.floor((d % 3600) / 60).toString();
        var s = Math.floor((d % 3600) % 60).toString();

        var hDisplay = h.length > 0 ? (h.length < 2 ? "0" + h : h) : "00";
        var mDisplay =
          m.length > 0 ? ":" + (m.length < 2 ? "0" + m : m) : ":00";
        var sDisplay =
          s.length > 0 ? ":" + (s.length < 2 ? "0" + s : s) : ":00";
        const time = hDisplay + mDisplay + sDisplay;
        videoObject["duration"] = time;

        globalModel.create(req, videoObject, "videos").then((result) => {
          res.send({
            videoWidth: videoWidth,
            videoHeight: videoHeight,
            id: result.insertId,
            images: uploadedImages,
            name: path.basename(
              metadata.format.filename,
              path.extname(metadata.format.filename)
            ),
          });
        });
      })
      .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        count: 1,
        folder: basePath + "/upload/images/videos/video/",
        filename: "%w_%h_%b_%i",
      });
  });

  // Kill ffmpeg after 5 minutes anyway
  setTimeout(function () {
    if (typeof command != "undefined") {
      command.on("error", function () {
        return res
          .send({
            error: fieldErrors.errors(
              [{ msg: constant.general.GENERAL }],
              true
            ),
            status: errorCodes.serverError,
          })
          .end();
      });
      command.kill();
    }
  }, 60 * 5 * 1000);
};
exports.updatedBrands = async (req) => {
  let brand = {};
  await globalModel
    .custom(req, "SELECT * FROM live_brands WHERE user_id = ?", [
      req.user.user_id,
    ])
    .then(async (result) => {
      if (result && result.length > 0) {
        brand = JSON.parse(JSON.stringify(result))[0];
      }
    });
  if (!brand.background_color) {
    brand.background_color = "#000000";
  }
  if (!brand.text_color) {
    brand.text_color = "#ffffff";
  }
  await globalModel
    .custom(
      req,
      "SELECT * FROM live_banners WHERE user_id = ? AND `show` = 1",
      [req.user.user_id]
    )
    .then(async (result) => {
      if (result && result.length > 0) {
        let data = {};
        data.user_id = req.user.user_id;
        data.banners = JSON.parse(JSON.stringify(result));
        data.brand = brand;
        socketio.getIO().emit("bannerData", data);
      } else {
        let data = {};
        data.banners = null;
        data.user_id = req.user.user_id;
        data.brand = brand;
        socketio.getIO().emit("bannerData", data);
      }
    });
};
exports.showHideBanner = async (req, res) => {
  let banner_id = req.body.banner_id;
  let banner = null;
  await globalModel
    .custom(req, "SELECT * FROM live_banners WHERE banner_id = ?", [banner_id])
    .then(async (result) => {
      if (result && result.length > 0) {
        banner = JSON.parse(JSON.stringify(result))[0];
      }
    });
  if (!banner) {
    res.send({ status: 0 });
    return;
  }
  let previousTicker = {};
  if (parseInt(banner.show) == 0) {
    if (parseInt(banner.ticker) == 1) {
      //get previous ticker
      await globalModel
        .custom(
          req,
          "SELECT * FROM live_banners WHERE user_id = ? AND ticker = ? AND `show` = 1",
          [req.user.user_id, 1]
        )
        .then(async (result) => {
          if (result && result.length > 0) {
            previousTicker = JSON.parse(JSON.stringify(result))[0];
          }
          if (previousTicker.banner_id) {
            //hide previous ticker
            await globalModel
              .update(
                req,
                { show: 0 },
                "live_banners",
                "banner_id",
                previousTicker.banner_id
              )
              .then((result) => {});
          }
        });
    } else {
      //get previous banner
      await globalModel
        .custom(
          req,
          "SELECT * FROM live_banners WHERE user_id = ? AND ticker = ? AND `show` = 1",
          [req.user.user_id, 0]
        )
        .then(async (result) => {
          if (result && result.length > 0) {
            previousTicker = JSON.parse(JSON.stringify(result))[0];
          }
          if (previousTicker.banner_id) {
            //hide previous ticker
            await globalModel
              .update(
                req,
                { show: 0 },
                "live_banners",
                "banner_id",
                previousTicker.banner_id
              )
              .then((result) => {});
          }
        });
    }
  }
  await globalModel
    .update(
      req,
      { show: banner.show == 1 ? 0 : 1 },
      "live_banners",
      "banner_id",
      banner_id
    )
    .then((result) => {
      if (result) {
        socketio.getIO().emit("hideBannerLive", {
          banner_id: banner_id,
          user_id: req.user.user_id,
          show: banner.show == 1 ? 0 : 1,
          previousHide: previousTicker.banner_id,
        });
      }
    });

  exports.updatedBrands(req);
  res.send({ status: 1 });
};
exports.statusBrandsImages = async (req, res) => {
  let brand = null;
  await globalModel
    .custom(req, "SELECT * FROM live_brands WHERE user_id = ?", [
      req.user.user_id,
    ])
    .then(async (result) => {
      if (result && result.length > 0) {
        brand = JSON.parse(JSON.stringify(result))[0];
      }
    });
  if (!brand) {
    res.send({ status: 0 });
    return;
  }
  let type = req.body.type;
  let insertObject = {};
  insertObject[type + "_active"] = brand[type + "_active"] == 1 ? 0 : 1;
  await globalModel
    .update(req, insertObject, "live_brands", "brand_id", brand.brand_id)
    .then((result) => {
      if (result) {
        insertObject["user_id"] = req.user.user_id;
        socketio.getIO().emit("updateBrandLive", insertObject);
      }
    });
  exports.updatedBrands(req);
  res.send({ status: 1 });
};
exports.deleteBrandsImages = async (req, res) => {
  let brand = null;
  await globalModel
    .custom(req, "SELECT * FROM live_brands WHERE user_id = ?", [
      req.user.user_id,
    ])
    .then(async (result) => {
      if (result && result.length > 0) {
        brand = JSON.parse(JSON.stringify(result))[0];
      }
    });
  if (!brand) {
    res.send({ status: 0 });
    return;
  }
  let type = req.body.type;
  //if(insertObject[type]){
  commonFunction.deleteImage(req, res, "", "brands", brand[type]);
  //}
  let insertObject = {};
  insertObject[type] = null;
  await globalModel
    .update(req, insertObject, "live_brands", "brand_id", brand.brand_id)
    .then((result) => {
      if (result) {
        insertObject["user_id"] = req.user.user_id;
        socketio.getIO().emit("updateBrandLive", insertObject);
      }
    });
  exports.updatedBrands(req);
  res.send({ status: 1 });
};
exports.deleteBanner = async (req, res) => {
  let banner_id = req.body.banner_id;
  let banner = null;
  await globalModel
    .custom(req, "SELECT * FROM live_banners WHERE banner_id = ?", [banner_id])
    .then(async (result) => {
      if (result && result.length > 0) {
        banner = JSON.parse(JSON.stringify(result))[0];
      }
    });
  if (!banner) {
    res.send({ status: 0 });
    return;
  }

  await globalModel
    .delete(req, "live_banners", "banner_id", banner_id)
    .then((result) => {
      if (result) {
        socketio.getIO().emit("deleteBannerLive", {
          banner_id: banner_id,
          user_id: req.user.user_id,
        });
      }
    });
  exports.updatedBrands(req);
  res.send({ status: 1 });
};
exports.createBrandLogoOverlay = async (req, res) => {
  let insertObject = {};
  let brand = null;
  await globalModel
    .custom(req, "SELECT * FROM live_brands WHERE user_id = ?", [
      req.user.user_id,
      0,
    ])
    .then(async (result) => {
      if (result && result.length > 0) {
        brand = JSON.parse(JSON.stringify(result))[0];
      }
    });
  let type = req.body.type;
  if (req.fileName) {
    insertObject[type] = "/upload/images/live-streaming/" + req.fileName;
  }
  if (brand) {
    if (insertObject[type]) {
      commonFunction.deleteImage(req, res, "", "brands", insertObject[type]);
    }
    await globalModel
      .update(req, insertObject, "live_brands", "brand_id", brand.brand_id)
      .then((result) => {
        if (result) {
          insertObject["user_id"] = req.user.user_id;
          socketio.getIO().emit("updateBrandLive", insertObject);
        }
      });
  } else {
    await globalModel
      .create(req, insertObject, "live_brands")
      .then((result) => {
        if (result) {
          insertObject["user_id"] = req.user.user_id;
          socketio.getIO().emit("updateBrandLive", insertObject);
        }
      });
  }
  exports.updatedBrands(req);
  res.send({ status: 1 });
};
exports.addBrands = async (req, res) => {
  let background_color = req.body.background_color;
  let text_color = req.body.text_color;
  let theme = req.body.theme;
  let redirect_url = req.body.redirect_url;
  let user_id = req.user.user_id;

  let insertObject = {};
  if (background_color) {
    insertObject["background_color"] = background_color;
  } else {
    //insertObject["background_color"] = "#000000";
  }
  if (text_color) {
    insertObject["text_color"] = text_color;
  } else {
    //insertObject["text_color"] = "#ffffff";
  }
  if (theme) {
    insertObject["theme"] = theme;
  } else {
    //insertObject["theme"] = "default";
  }
  if (typeof redirect_url != "undefined") {
    insertObject["redirect_url"] = redirect_url;
  } else {
    //insertObject["redirect_url"] = null;
  }

  let brand = null;
  await globalModel
    .custom(req, "SELECT * FROM live_brands WHERE user_id = ?", [
      req.user.user_id,
      0,
    ])
    .then(async (result) => {
      if (result && result.length > 0) {
        brand = JSON.parse(JSON.stringify(result))[0];
      }
    });
  if (brand) {
    await globalModel
      .update(req, insertObject, "live_brands", "brand_id", brand.brand_id)
      .then((result) => {
        if (result) {
          insertObject["user_id"] = user_id;
          socketio.getIO().emit("updateBrandLive", insertObject);
        }
      });
  } else {
    insertObject["user_id"] = user_id;
    await globalModel
      .create(req, insertObject, "live_brands")
      .then((result) => {
        if (result) {
          socketio.getIO().emit("updateBrandLive", insertObject);
        }
      });
  }
  exports.updatedBrands(req);
  res.send({ status: 1 });
};
exports.createBanner = async (req, res) => {
  let text = req.body.text;
  let ticker = req.body.ticker;
  let banner_id = req.body.banner_id;

  if (banner_id) {
    let insertObject = {};
    insertObject["show"] = 0;
    insertObject["text"] = text;
    insertObject["ticker"] = ticker;
    await globalModel
      .update(req, insertObject, "live_banners", "banner_id", banner_id)
      .then((result) => {
        if (result) {
          socketio.getIO().emit("updateBannerLive", {
            banner_id: banner_id,
            text: text,
            ticker: ticker,
            user_id: req.user.user_id,
          });
        }
      });
    res.send({ status: 1 });
    return;
  }

  let insertObject = {};
  insertObject["show"] = 0;
  insertObject["text"] = text;
  insertObject["user_id"] = req.user.user_id;
  insertObject["ticker"] = ticker;
  await globalModel.create(req, insertObject, "live_banners").then((result) => {
    if (result) {
      insertObject["banner_id"] = result.insertId;
      socketio.getIO().emit("newBannerLive", {
        banner_id: insertObject["banner_id"],
        text: text,
        ticker: parseInt(ticker),
        user_id: req.user.user_id,
        show: 0,
      });
    }
  });
  exports.updatedBrands(req);
  res.send({ status: 1 });
};
