const audioModel = require("../../models/audio");
const dateTime = require("node-datetime");
const fieldErrors = require("../../functions/error");
const errorCodes = require("../../functions/statusCodes");
const constant = require("../../functions/constant");
const globalModel = require("../../models/globalModel");
const uniqid = require("uniqid");
const socketio = require("../../socket");
const { validationResult } = require("express-validator");
const commonFunction = require("../../functions/commonFunctions");
const privacyModel = require("../../models/privacy");
const notificationModel = require("../../models/notifications");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

exports.playCount = async (req, res) => {
  globalModel
    .custom(
      req,
      "UPDATE audio SET play_count = play_count + 1 WHERE audio_id = " +
        req.body.id,
      []
    )
    .then(() => {});
  res.send({});
};
exports.password = async (req, res) => {
  let password = req.body.password;
  let id = req.params.id;

  let audio = {};

  await audioModel
    .findByCustomUrl(id, req, true)
    .then((result) => {
      if (result) audio = result;
    })
    .catch(() => {});

  if (audio.password == password) {
    req.session.audio.push(audio.audio_id);
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

  await audioModel.delete(req.item.audio_id, req).then((result) => {
    if (result) {
      commonFunction.deleteImage(req, res, "", "audio", req.item);
      socketio.getIO().emit("audioDeleted", {
        audio_id: req.item.audio_id,
        message: constant.audio.DELETED,
      });
    }
  });
  res.send({});
};

exports.upload = async (req, res) => {
  // validate upload limit
  // validate member role upload count limit
  if (req.quotaLimitError) {
    return res
      .send({
        error: fieldErrors.errors([{ msg: constant.audio.QUOTAREACHED }], true),
        status: errorCodes.invalid,
      })
      .end();
  }

  let basePath = req.serverDirectoryPath + "/public";
  if (req.appSettings.upload_system == "s3") {
    basePath = "https://" + req.appSettings.s3_bucket + ".s3.amazonaws.com";
  } else if (req.appSettings.upload_system == "wisabi") {
    basePath = "https://s3.wasabisys.com/" + req.appSettings.s3_bucket;
  }
  if(req.appSettings["site_images_cdn_url"]){
    basePath = req.appSettings["site_images_cdn_url"];
  }
  const filePath = basePath + "/upload/audio/" + req.fileName;
  let duration = 0;
  ffmpeg.setFfprobePath(
    req.appSettings["video_ffmpeg_path"].replace("ffmpeg", "ffprobe")
  );
  
  ffmpeg.setFfmpegPath(req.appSettings["video_ffmpeg_path"]);
  var command = ffmpeg.ffprobe(filePath, function (err, metadata) {
    if(err){
      console.log(err);
    }
    duration = metadata.format.duration.toString();
    size = metadata.format.size;
    //create item video in table
    let audioObject = {};
    audioObject["owner_id"] = req.user.user_id;
    audioObject["audio_file"] = "/upload/audio/" + req.fileName;
    audioObject["view_privacy"] = "everyone";
    audioObject["custom_url"] = uniqid.process("a");
    audioObject["description"] = "";
    var dt = dateTime.create();
    var formatted = dt.format("Y-m-d H:M:S");
    audioObject["creation_date"] = formatted;
    audioObject["modified_date"] = formatted;
    audioObject["size"] = size;
    // var n = duration.indexOf('.');
    // duration = duration.substring(0, n != -1 ? n : duration.length)
    // let d = Number(duration);
    // var h = Math.floor(d / 3600).toString();
    // var m = Math.floor(d % 3600 / 60).toString();
    // var s = Math.floor(d % 3600 % 60).toString();

    // var hDisplay = h.length > 0 ? (h.length < 2 ? "0" + h : h) : "00"
    // var mDisplay = m.length > 0 ? ":" + (m.length < 2 ? "0" + m : m) : ":00"
    // var sDisplay = s.length > 0 ? ":" + (s.length < 2 ? "0" + s : s) : ":00"
    // const time = hDisplay + mDisplay + sDisplay
    audioObject["duration"] = duration;

    let audio_url = "/upload/audio/" + req.fileName;
    if (req.appSettings.upload_system == "s3") {
      audio_url =
        "https://" +
        req.appSettings.s3_bucket +
        ".s3.amazonaws.com" +
        audio_url;
    } else if (req.appSettings.upload_system == "wisabi") {
      audio_url =
        "https://s3.wasabisys.com/" + req.appSettings.s3_bucket + audio_url;
    } else {
      audio_url = req.APP_HOST + audio_url;
    }
    globalModel.create(req, audioObject, "audio").then((result) => {
      res.send({
        audio_url: audio_url,
        id: result.insertId,
        name: path.basename(
          metadata.format.filename,
          path.extname(metadata.format.filename)
        ),
      });
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
exports.browse = async (req, res) => {
  const queryString = req.query;
  let limit = 17;
  if (req.body.audioPurchased) {
    limit = 21
  }
  let page = 1;
  if (req.body.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
  }
  req.query.search = {};
  let offset = (page - 1) * (limit - 1);
  const data = { limit: limit, offset: offset };
  data["type"] = queryString.type;
  if (queryString.q && !queryString.tag) {
    data["title"] = queryString.q;
  }
  if (req.body.owner_id) {
    data["owner_id"] = req.body.owner_id;
  }
  if (queryString.sort == "latest") {
    data["orderby"] = "audio.audio_id desc";
  } else if (
    queryString.sort == "favourite" &&
    req.appSettings["audio_favourite"] == 1
  ) {
    data["orderby"] = "audio.favourite_count desc";
  } else if (queryString.sort == "view") {
    data["orderby"] = "audio.view_count desc";
  } else if (
    queryString.sort == "like" &&
    req.appSettings["audio_like"] == "1"
  ) {
    data["orderby"] = "audio.like_count desc";
  } else if (
    queryString.sort == "dislike" &&
    req.appSettings["audio_dislike"] == "1"
  ) {
    data["orderby"] = "audio.dislike_count desc";
  } else if (
    queryString.sort == "rated" &&
    req.appSettings["audio_rating"] == "1"
  ) {
    data["orderby"] = "audio.rating desc";
  } else if (
    queryString.sort == "commented" &&
    req.appSettings["audio_comment"] == "1"
  ) {
    data["orderby"] = "audio.comment_count desc";
  } else if (queryString.sort == "played") {
    req.query.search.sort = queryString.sort;
    data["orderby"] = "audio.play_count desc";
  }

  if (
    queryString.type == "featured" &&
    req.appSettings["audio_featured"] == 1
  ) {
    data["is_featured"] = 1;
  } else if (
    queryString.type == "sponsored" &&
    req.appSettings["audio_sponsored"] == 1
  ) {
    data["is_sponsored"] = 1;
  } else if (queryString.type == "hot" && req.appSettings["audio_hot"] == 1) {
    data["is_hot"] = 1;
  }

  if (req.body.audioPurchased) {
    data.purchaseAudio = true;
    data.purchase_user_id = req.body.purchase_user_id
      ? req.body.purchase_user_id
      : req.body.audio_user_id;
  }

  //get all playlists
  await audioModel
    .getAudios(req, data)
    .then((result) => {
      if (result) {
        let pagging = false;
        let items = result;
        if (result.length > limit - 1) {
          items = result.splice(0, limit - 1);
          pagging = true;
        }
        res.send({ audios: items, pagging: pagging });
      }
    })
    .catch(() => {
      res.send({});
    });
};

exports.peekData = async (req, res) => {
  let id = req.body.audio_id;
  if (req.body.peaks) {
    insertObject = {};
    insertObject["peaks"] = req.body.peaks;
    await globalModel
      .update(req, insertObject, "audio", "audio_id", id)
      .then(async () => {
        res.send({ status: 1 }).end();
      })
      .catch(() => {
        return res.send({ status: 0 }).end();
      });
  } else {
    return res.send({ status: 0 }).end();
  }
};

exports.create = async (req, res) => {
  if (req.quotaLimitError) {
    return res
      .send({
        error: fieldErrors.errors([{ msg: constant.audio.QUOTAREACHED }], true),
        status: errorCodes.invalid,
      })
      .end();
  }
  if (req.imageError) {
    return res
      .send({
        error: fieldErrors.errors([{ msg: req.imageError }], true),
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
  // all set now
  let insertObject = {};
  let id = req.body.audio_id;
  let audioObject = {};
  if (parseInt(id) > 0) {
    //uploaded
    await globalModel
      .custom(req, "SELECT * FROM audio WHERE audio_id = ?", id)
      .then(async (result) => {
        if (result) {
          audioObject = JSON.parse(JSON.stringify(result))[0];
          await privacyModel
            .permission(req, "audio", "edit", audioObject)
            .then((result) => {
              if (!result) {
                id = null;
                audioObject = null;
              }
            })
            .catch(() => {
              id = null;
            });
        }
      })
      .catch(() => {
        id = null;
      });
  } else {
    insertObject["owner_id"] = req.user.user_id;
    insertObject["custom_url"] = uniqid.process("b");
  }
  insertObject["title"] = req.body.title;
  insertObject["description"] = req.body.description
    ? req.body.description
    : "";
  insertObject["search"] = req.body.search ? req.body.search : 1;
  if (typeof req.body.comments != "undefined") {
    insertObject["autoapprove_comments"] = parseInt(req.body.comments);
  }
  insertObject["view_privacy"] = req.body.privacy
    ? req.body.privacy
    : "everyone";
  insertObject["release_date"] = req.body.release_date
    ? req.body.release_date
    : "";

    if (
      req.body.price &&
      (parseFloat(req.body.price) > 0 || parseFloat(req.body.price) == 0)
    )
      insertObject["price"] = parseFloat(req.body.price);

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

  if (req.body.peaks) {
    insertObject["peaks"] = req.body.peaks;
  }

  if (req.fileName) {
    insertObject["image"] = "/upload/images/audio/" + req.fileName;
    if (Object.keys(audioObject).length && audioObject.image)
      commonFunction.deleteImage(req, res, audioObject.image, "audio/image");
  } else if (!req.body.image) {
    insertObject["image"] = "";
    if (Object.keys(audioObject).length && audioObject.image)
      commonFunction.deleteImage(req, res, audioObject.image, "audio/image");
  }else if(req.body.image){
    let image = await commonFunction.generateImageFromOpenAi(req,req.body.image)
    if(image){
        insertObject['image'] = image
        if (Object.keys(audioObject).length && audioObject.image)
          commonFunction.deleteImage(req, res, audioObject.image, "");
    }
    
  }
  var dt = dateTime.create();
  var formatted = dt.format("Y-m-d H:M:S");
  if (!id) {
    // insertObject["is_sponsored"] = req.levelPermissions['playlist.sponsored'] == "1" ? 1 : 0
    // insertObject["is_featured"] = req.levelPermissions['playlist.featured'] == "1" ? 1 : 0
    // insertObject["is_hot"] = req.levelPermissions['playlist.hot'] == "1" ? 1 : 0
    if (
      req.levelPermissions["audio.auto_approve"] &&
      req.levelPermissions["audio.auto_approve"] == "1"
    )
      insertObject["approve"] = 1;
    else insertObject["approve"] = 0;
    insertObject["creation_date"] = formatted;
  }
  insertObject["modified_date"] = formatted;

  if (id) {
    await globalModel
      .update(req, insertObject, "audio", "audio_id", id)
      .then(async () => {
        if (Object.keys(audioObject).length && !audioObject.image) {
          let dataNotification = {};
          dataNotification["type"] = "audio_create";
          dataNotification["owner_id"] = req.user.user_id;
          dataNotification["object_type"] = "audio";
          dataNotification["object_id"] = id;

          notificationModel.sendPoints(
            req,
            dataNotification,
            req.user.level_id
          );

          notificationModel
            .insertFollowNotifications(req, {
              subject_type: "users",
              subject_id: req.user.user_id,
              object_type: "audio",
              object_id: id,
              type: "members_followed",
            })
            .then(() => {})
            .catch(() => {});
          return res.send({
            id: id,
            message: constant.audio.SUCCESS,
            custom_url: insertObject["custom_url"]
              ? insertObject["custom_url"]
              : audioObject.custom_url,
          });
        }

        res.send({
          id: id,
          message: constant.audio.EDIT,
          custom_url: insertObject["custom_url"]
            ? insertObject["custom_url"]
            : audioObject.custom_url,
        });
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
    //create new audio

    await globalModel
      .create(req, insertObject, "audio")
      .then(async (result) => {
        if (result) {
          res.send({
            id: result.insertId,
            message: constant.audio.SUCCESS,
            custom_url: insertObject["custom_url"],
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
      .catch(() => {
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
