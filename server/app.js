const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
let passport = require("passport");
const cors = require("cors");
const next = require("next");
let connection = require("express-myconnection");
let mysql = require("mysql");
let cookieParser = require("cookie-parser");
let session = require("express-session");
let MySQLStore = require("express-mysql-session")(session);
if (process.env.NODE_ENV != "development") {
  require("dotenv").config();
}

const userModel = require("./models/users");
const devicedModel = require("./models/devices");
const levelPermissionModel = require("./models/levelPermissions");
const settingsModel = require("./models/settings");
const adminRoutes = require("./routes/admin");
const apiRoutes = require("./routes/api");
const appRoute = require("./routes/");
const installRoute = require("./routes/install");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, quiet: dev });
const server = express();
const { parse } = require("url");
const Languages = require("../temporary/cache/languages.json");
const handle = app.getRequestHandler(); //part of next config
const { registerI18n } = require("../i18n-server");
let cron = require("node-cron");
let videoModel = require("./models/videos");
let messagesModel = require("./models/messages");
const globalModel = require("./models/globalModel");
let sessionStore;
let mysqlconnection;
let data = "";
let dataPassHost = "";
let dataPortDb = "";
if (process.env.JAWSDB_URL) {
  data = process.env.JAWSDB_URL.replace("mysql://", "");
  data = data.split(":");
  dataPassHost = data[1].split("@");
  dataPortDb = data[2].split("/");
}
process.on("unhandledRejection", (error, p) => {
  console.log("=== UNHANDLED REJECTION ===");
  console.dir(error.stack);
});

registerI18n(server, (t, error) => {
  app.prepare().then(() => {
    server.use(cookieParser(process.env.PUBLIC_URL));

    //set caching for static resources
    server.get(
      process.env.subFolder + "static",
      express.static(__dirname + "/static", {
        maxAge: "365d",
      })
    );
    server.use(function (req, res, next) {
      req.originalUrl = req.url;
      res.header("Access-Control-Allow-Origin", "*");
      if (
        req.url
          .toLowerCase()
          .match(".js|.css|.woff|.jpg|.png|.gif|.ttf|.jpeg|.mp4|.m3u8")
      ) {
        res.setHeader("Cache-Control", "max-age=31536000"); // 365 days
      }
      next();
    });
    let corsOption = {
      origin: true,
      methods: "GET,POST,PUT,DELETE",
    };
    server.use(cors(corsOption));
    let options;

    process.env.JAWSDB_URL
      ? (options = {
          host: dataPassHost[1],
          user: data[0],
          password: dataPassHost[0],
          port: dataPortDb[0],
          database: dataPortDb[1],
          timezone: "UTC",
          multipleStatements: true,
        })
      : process.env.DBSOCKETPATH
      ? (options = {
          host: process.env.DBHOST, //'localhost',
          user: process.env.DBUSER,
          password: process.env.DBPASSWORD,
          port: process.env.DBPORT, //port mysql
          database: process.env.DBNAME,
          socketPath: process.env.DBSOCKETPATH,
          charset: "utf8mb4",
          timezone: "UTC",
          multipleStatements: true,
        })
      : process.env.LOCALADDRESS
      ? (options = {
          host: process.env.DBHOST, //'localhost',
          user: process.env.DBUSER,
          password: process.env.DBPASSWORD,
          port: process.env.DBPORT, //port mysql
          database: process.env.DBNAME,
          localAddress: process.env.LOCALADDRESS,
          charset: "utf8mb4",
          timezone: "UTC",
          multipleStatements: true,
        })
      : (options = {
          host: process.env.DBHOST, //'localhost',
          user: process.env.DBUSER,
          password: process.env.DBPASSWORD,
          port: process.env.DBPORT, //port mysql
          database: process.env.DBNAME,
          charset: "utf8mb4",
          timezone: "UTC",
          multipleStatements: true,
        });

    server.use(connection(mysql, options, "single"));

    server.use((req, res, next) => {
      req.getConnection(function (err, connection) {
        mysqlconnection = connection;
        if (err) {
          res.send(err);
          return;
        }
        if (!req.query.cronData) {
          connection.query(
            "SHOW TABLES LIKE 'users'",
            function (err, resultUsers, fields) {
              connection.query(
                "SET time_zone='+00:00';",
                function (err, results, fields) {
                  connection.query(
                    "SET SQL_MODE = ''",
                    function (err, results, fields) {
                      if (!resultUsers.length) {
                        req.installScript = true;
                        process.env.installScript = true;
                      } else {
                        sessionStore = connection;
                      }
                      next();
                    }
                  );
                }
              );
            }
          );
        } else {
          next();
        }
      });
    });

    server.use(
      session({
        store: new MySQLStore(options, sessionStore),
        secret: process.env.SECRETKEY,
        saveUninitialized: false,
        key: "SESSIONUUID",
        resave: false,
        cookie: {
          expires: 2629800000, //set 1 month
        },
      })
    );

    server.use((req, res, next) => {
      if (req.session && !req.session.password) {
        if (req.session) req.session.password = [];
      }
      if (req.session && !req.session.channel) {
        if (req.session) req.session.channel = [];
      }
      if (req.session && !req.session.audio) {
        if (req.session) req.session.audio = [];
      }
      req.serverDirectoryPath = __dirname;
      req.cacheDir = "./temporary/cache";
      return settingsModel
        .getSettings(req, res)
        .then((settings) => {
          next();
        })
        .catch((error) => {
          next();
          //throw error
        });
    });
    server.use(async (req, res, next) => {
      if (req.query.openFromApp) {
        req.session.api_token = req.query.api_token;
        req.session.fromAPP = true;
        req.session.fromAppDevice = req.query.fromAppDevice;
        if (req.query.push_token) {
          req.session.push_token = req.query.push_token;
        }
        if (req.query.device_udid) {
          req.session.device_udid = req.query.device_udid;
        }
      }

      if (req.session.fromAPP) {
        if (
          req.session &&
          (req.session.api_token == "" ||
            req.session.api_token != req.appSettings.api_token)
        ) {
          res.send({ error: "Un Authorized Access" });
          return;
        }
        req.query.fromAPP = true;
        if (req.session.device_udid) {
          await devicedModel
            .findAll(req, { limit: 1, device_udid: req.session.device_udid })
            .then((result) => {
              if (result && result.length > 0) {
                req.session.user = result[0].owner_id;
              } else {
                req.session.user = null;
              }
            });
        }
      }
      if (req.session.fromAppDevice) {
        req.query.fromAppDevice = req.session.fromAppDevice;
      }
      next();
    });
    server.use(async (req, res, next) => {
      const urlParams = req.url.split("/");
      const allLocales = Languages.others.concat(Languages.default);
      let languageParam = req.query.siteLocale
        ? req.query.siteLocale
        : urlParams[1];
      const currentLanguage = allLocales.indexOf(languageParam);
      const currentLocale = req.cookies["NEXT_LOCALE"];
      req.currentLocale = languageParam;

      if (currentLanguage > -1 && languageParam != currentLocale) {
        req.i18n.changeLanguage(languageParam);
        res.cookie("NEXT_LOCALE", languageParam, {
          maxAge: 31536000,
          path: "/",
        });
        req.currentLocale = languageParam;
      } else {
        if (
          currentLanguage == -1 &&
          typeof languageParam == "undefined" &&
          languageParam != process.env.ALLOWALLUSERINADMIN
        ) {
          languageParam = Languages.default;
          req.currentLocale = languageParam;
        }
      }
      let valid = true;
      if (allLocales.indexOf(req.currentLocale) == -1) {
        req.currentLocale = Languages.default;
        valid = false;
      }
      //await req.i18n.reloadResources()
      //get loggedin user details
      if (req.session && req.session.user && !req.installScript) {
        try {
          return userModel
            .findById(req.session.user, req, res, true)
            .then(async (user) => {
              if (user) {
                req.user = user;
                if (
                  allLocales.indexOf(req.currentLocale) > -1 &&
                  valid &&
                  languageParam != req.user.language
                ) {
                  req.user.language = languageParam;
                  await userModel
                    .updateLanguge(req, languageParam, req.user.user_id)
                    .then((result) => {});
                }
              }
              next();
            })
            .catch((error) => {
              next();
            });
        } catch (error) {
          next();
        }
      } else {
        next();
      }
    });

    server.use((req, res, next) => {
      //resize image
      req.widthResize = process.env.widthResize ? process.env.widthResize : 600;
      req.heightResize = process.env.heightResize
        ? process.env.heightResize
        : 600;
      req.coverWidthResize = process.env.coverWidthResize
        ? process.env.coverWidthResize
        : 1200;
      req.coverHeightResize = process.env.coverHeightResize
        ? process.env.coverHeightResize
        : 350;
      if (!req.installScript) {
        let level_id = 5;
        if (req.user) level_id = req.user.level_id;
        return levelPermissionModel
          .findById(level_id, req, res)
          .then((permissions) => {
            next();
          })
          .catch((error) => {
            next();
          });
      } else {
        next();
      }
    });

    const setupForStripeWebhooks = {
      // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
      verify: function (req, res, buf) {
        let url = req.originalUrl;
        if (
          url.startsWith("/payment/stripeIPN") ||
          url.startsWith("/payment/IPN") ||
          url.startsWith("/apple-pay-notification")
        ) {
          req.rawBody = buf.toString();
        }
      },
    };

    server.set("view engine", "ejs");
    server.set("views", "server/views");
    server.use(bodyParser.json(setupForStripeWebhooks));
    server.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    server.use(express.static(path.join(__dirname, "../", "public")));
    server.use(
      process.env.subFolder ? process.env.subFolder : "IUQEWYHJD",
      express.static(path.join(__dirname, "public"))
    );
    server.use(
      process.env.subFolder + "upload",
      express.static(path.join(__dirname, "public", "upload"))
    );
    server.use(
      process.env.subFolder + "resources",
      express.static(path.join(__dirname, "public", "resources"))
    );
    server.use(
      process.env.subFolder + "images",
      express.static(path.join(__dirname, "public", "images"))
    );
    server.use(
      process.env.subFolder + "Documentation",
      express.static(path.join(__dirname, "public", "Documentation"))
    );
    server.use(
      process.env.subFolder + "installer",
      express.static(path.join(__dirname, "public", "installer"))
    );
    server.use(
      process.env.subFolder + "media-server",
      express.static(path.join(__dirname, "public"))
    );

    server.use((req, res, next) => {
      const parsedUrl = parse(req.url, true);
      let { pathname } = parsedUrl;
      if (pathname) {
        pathname = pathname.replace(process.env.subFolder, "/");
      }
      if (
        pathname === "/sw.js" ||
        /^\/(workbox|worker|fallback)-\w+\.js$/.test(pathname)
      ) {
        const filePath = path.join(__dirname, "../", "public", pathname);
        res.sendFile(filePath);
      } else {
        next();
      }
    });
    const appleVerification = {
      root: path.join(__dirname, "../", "public"),
    };
    server.get(
      `/.well-known/apple-developer-merchantid-domain-association`,
      (req, res) =>
        res
          .status(200)
          .sendFile(
            `.well-known/apple-developer-merchantid-domain-association`,
            appleVerification
          )
    );
    server.get(
      `/.well-known/apple-developer-merchantid-domain-association.txt`,
      (req, res) =>
        res
          .status(200)
          .sendFile(
            `.well-known/apple-developer-merchantid-domain-association.txt`,
            appleVerification
          )
    );

    server.use(passport.initialize());

    server.use(async (req, res, next) => {
      // default currency
      await globalModel
        .custom(req, "SELECT * FROM currencies  WHERE `default` = ?", [1])
        .then(async (result) => {
          if (result && result.length) {
            let item = result[0];
            req.defaultCurrency = item;
            res.locals.defaultCurrencyValue = item.ID;
            res.locals.defaultCurrencySymbol = item.symbol;
            req.defaultCurrencySymbol = item.symbol;
            req.defaultCurrencyValue = item.ID;
            req.currentCurrency = item;
          }
        });

      if (
        req.user &&
        req.user.preferred_currency != req.defaultCurrency &&
        req.url.indexOf(process.env.ADMIN_SLUG) == -1
      ) {
        await globalModel
          .custom(
            req,
            "SELECT * FROM currencies  WHERE ID = ? AND active = 1",
            [req.user.preferred_currency]
          )
          .then(async (result) => {
            if (result && result.length) {
              let item = result[0];
              req.currentCurrency = item;
            }
          });
      } else if (
        req.session.defaultUserCurrency &&
        req.session.defaultUserCurrency != req.defaultCurrency &&
        req.url.indexOf(process.env.ADMIN_SLUG) == -1
      ) {
        await globalModel
          .custom(
            req,
            "SELECT * FROM currencies  WHERE ID = ? AND active = 1",
            [req.session.defaultUserCurrency]
          )
          .then(async (result) => {
            if (result && result.length) {
              let item = result[0];
              req.currentCurrency = item;
            }
          });
      }

      req.APP_HOST = process.env.PUBLIC_URL;
      res.locals.APP_HOST = req.APP_HOST;
      res.locals.reqObject = req;
      res.locals.ALLOWALLUSERINADMIN =
        (!req.user || req.user.levelFlag != "superadmin") &&
        (typeof process.env.ALLOWALLUSERINADMIN != "undefined" ||
          process.env.ALLOWALLUSERINADMIN);
      res.locals.ADMIN_SLUG = process.env.ADMIN_SLUG;
      req.loguserallowed =
        (!req.user || req.user.levelFlag != "superadmin") &&
        (typeof process.env.ALLOWALLUSERINADMIN != "undefined" ||
          process.env.ALLOWALLUSERINADMIN);

      const convertCurrency = function (data) {
        let locale = "en-US";
        let changeRate = data.change_rate
          ? data.change_rate
          : data.req.currentCurrency.currency_value
          ? data.req.currentCurrency.currency_value
          : 1;
        let price = data.price && parseFloat(data.price) > 0 ? data.price : 0;
        if (data.default_currency) {
          price = (price / changeRate).toFixed(2);
        } else price = (price * changeRate).toFixed(2);

        try {
          if (data.req.currentCurrency) {
            return new Intl.NumberFormat(locale ?? "en-US", {
              style: "currency",
              currency: data.currency
                ? data.currency
                : data.req.currentCurrency
                ? data.req.currentCurrency.ID
                : data.req.defaultCurrencyValue,
            }).format(price);
          } else
            return new Intl.NumberFormat(locale ?? "en-US", {
              style: "currency",
              currency: data.currency
                ? data.currency
                : data.req.currentCurrency
                ? data.req.currentCurrency.ID
                : data.req.defaultCurrencyValue,
            }).format(price);
        } catch (e) {
          if (process.env.NODE_ENV !== "production") console.log(e);
          return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: data.req.currentCurrency
              ? data.req.currentCurrency.ID
              : data.req.defaultCurrencyValue,
          }).format(price);
        }
      };

      res.locals.convertCurrency = convertCurrency;
      req.convertCurrency = convertCurrency;

      let imageSuffix = "";
      req.ttlTime = 5;

      if (!req.installScript) {
        let userip;
        if (req.headers["x-real-ip"]) {
          userip = req.headers["x-real-ip"].split(",")[0];
        } else if (req.socket && req.socket.remoteAddress) {
          userip = req.socket.remoteAddress;
        } else {
          userip = req.ip;
        }
        if (userip) {
          if (req.user && req.user.ip_address != userip) {
            //update user recent ip
            userModel
              .updateIP(req, userip, req.user.user_id)
              .then((result) => {});
          }
        }
        //check ban user ips
        if (req.appSettings["restrict_ips"]) {
          let ips = (
            req.appSettings["restrict_ips"]
              ? req.appSettings["restrict_ips"]
              : ""
          ).split(",");
          if (userip) {
            if (ips.indexOf(userip) > -1) {
              res.send("You are banned to access the website.");
              return;
            }
          }
        }
        res.locals.moment = require("moment-timezone");
        res.locals.defaultTimezone = req.user
          ? req.user.timezone
          : req.appSettings["member_default_timezone"];
        res.locals.formatDate = "YYYY-MM-DD hh:mm:ss A";
        if (req.appSettings.site_images_cdn_url) {
          imageSuffix =
            req.appSettings.site_images_cdn_url +
            process.env.subFolder.slice(0, -1);
        } else if (req.appSettings.upload_system == "s3") {
          imageSuffix =
            "https://" + req.appSettings.s3_bucket + ".s3.amazonaws.com";
        } else if (req.appSettings.upload_system == "wisabi") {
          imageSuffix = "https://s3.wasabisys.com/" + req.appSettings.s3_bucket;
        } else if (process.env.subFolder) {
          imageSuffix = process.env.subFolder.slice(0, -1);
        }
        res.locals.imageSuffix = imageSuffix;
        if (req.appSettings.site_images_cdn_url) {
          req.appSettings["imageSuffix"] =
            req.appSettings.site_images_cdn_url +
            process.env.subFolder.slice(0, -1);
        } else if (req.appSettings.upload_system == "s3") {
          req.appSettings["imageSuffix"] =
            "https://" + req.appSettings.s3_bucket + ".s3.amazonaws.com";
        } else if (req.appSettings.upload_system == "wisabi") {
          req.appSettings["imageSuffix"] =
            "https://s3.wasabisys.com/" + req.appSettings.s3_bucket;
        } else {
          req.appSettings["imageSuffix"] =
            req.APP_HOST + process.env.subFolder.slice(0, -1);
        }
        res.locals.websiteTitle = req.appSettings.site_title;
      }

      req.envfile = "./.env";
      req.SQLFILE = "./playtubevideo.sql";
      req.documentPATH = path.join(__dirname, "../") + "Documentation/";
      req.streamingPATH = path.join(__dirname, "../") + "media-server/";
      let d = new Date();
      res.locals.currentYear = d.getFullYear();

      next();
    });

    //redirect all routes with have trailing slash
    server.use((req, res, next) => {
      const test = /\?[^]*\//.test(req.url);
      if (
        req.url.substr(-1) === "/" &&
        req.url.length > 1 &&
        !test &&
        req.url.indexOf("Documentation") == -1 &&
        req.url.indexOf("install") == -1 &&
        req.url.indexOf("media-server") != -1
      )
        res.redirect(301, req.url.slice(0, -1));
      else next();
    });
    /*
        check script installed
        */
    server.use(installRoute);
    /*
       end script check code
       */
    //Admin Routes
    server.use(adminRoutes);
    // server.use((req, res, next) => {
    //   req.app = app
    //   next();
    // });
    //API routes
    server.use(apiRoutes);
    //SITE routes
    server.use(appRoute);

    //client side route
    server.get(process.env.subFolder + "_next/*", (req, res) => {
      handle(req, res).catch((err) => {});
    });

    server.get(process.env.subFolder + "static/*", (req, res) => {
      handle(req, res).catch((err) => {});
    });

    server.all("*", (req, res) => {
      if (res.headersSent) {
        return;
      }
      if (
        req.url
          .toLowerCase()
          .match(
            ".js|.css|.woff|.jpg|.png|.gif|.ttf|.jpeg|.mp4|.m3u8|.webp|.mp3"
          )
      ) {
        // return res.status(404).send("resource not found.")
      }
      return handle(req, res);
    });

    // server.get('*', (req, res) => {
    //   handle(req, res);
    // });
    const con = server.listen(process.env.PORT || 5000, () => {
      console.log("first server listening on port", process.env.PORT);
    });
    const io = require("./socket").init(con);
    // cron.schedule("5 * * * * *", () => {
    //   //if(!process.env.installScript){
    //   const axios = require("axios");
    //   const https = require("https");
    //   if (process.env.NODE_ENV !== "production")
    //     console.log("CRON START RUNNING");
    //   const agent = new https.Agent({
    //     rejectUnauthorized: false,
    //   });
    //   axios
    //     .get(
    //       process.env.PUBLIC_URL +
    //         process.env.subFolder +
    //         "cron/execute?cronData=1",
    //       { httpsAgent: agent }
    //     )
    //     .then(function (response) {
    //       // handle success
    //       if (process.env.NODE_ENV !== "production")
    //         console.log("CRON COMPLETED RUNNING");
    //     })
    //     .catch(function (error) {
    //       // handle error
    //       console.log("ERROR IN EXECUTING CRON", error);
    //     });
    //   //}
    // });
    //connect to socket
    io.on("connect", (con) => {
      if (process.env.NODE_ENV !== "production")
        console.log("client connected");
    });
    io.sockets.on("connection", function (socket) {
      socket.on("chatJoin", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("chatJoin", data);
          socket.join(data.id);
        } catch (e) {
          if (process.env.NODE_ENV !== "production") console.log(e, "chatJoin");
        }
      });
      socket.on("chatLeave", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("chatLeave", data);
          socket.leave(data.id);
        } catch (e) {
          if (process.env.NODE_ENV !== "production")
            console.log(e, "chatLeave");
        }
      });
      socket.on("readChat", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("readChat", data);
          //get message id
          let id = data.id;
          let message_id = data.message_id;
          //mark read
          messagesModel
            .updateReadMessages(
              { id: id, message_id: message_id },
              mysqlconnection
            )
            .then((result) => {
              if (result) {
                io.to(result.user_id)
                  .to(result.resource_id)
                  .emit("chatRead", data);
              }
            });
        } catch (e) {
          if (process.env.NODE_ENV !== "production") console.log(e, "readChat");
        }
      });

      socket.on("chatOpen", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("chatOpen", data);

          //get message id
          messagesModel
            .getMessagesId(
              {
                resource_id: data.resource_id,
                user_id: data.user_id,
                limit: 1,
              },
              mysqlconnection
            )
            .then((result) => {
              if (result) {
                messagesModel
                  .getMessages(
                    {
                      resource_id: data.resource_id,
                      user_id: data.user_id,
                      limit: 1,
                      id: result.message_id,
                    },
                    mysqlconnection,
                    true
                  )
                  .then((message) => {
                    io.to(result.user_id)
                      .to(result.resource_id)
                      .emit("chatOpen", message[0]);
                  });
              }
            });
        } catch (e) {
          if (process.env.NODE_ENV !== "production") console.log(e, "chatOpen");
        }
      });

      socket.on("roomJoin", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("roomJOIN", data);
          socket.join(data.custom_url);
        } catch (e) {
          if (process.env.NODE_ENV !== "production") console.log(e, "roomJoin");
        }
      });
      socket.on("deleteMessage", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("deleteMessage", data);
          videoModel
            .deleteChatMessage(mysqlconnection, data)
            .then((result) => {
              io.to(data.custom_url).emit("deleteMessage", {
                chat_id: data.chat_id,
              });
            })
            .catch((err) => {
              //silence
            });
        } catch (e) {
          if (process.env.NODE_ENV !== "production")
            console.log(e, "deleteMessage");
        }
      });
      socket.on("banUserMessage", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("banUserMessage", data);
          videoModel
            .banChatUser(mysqlconnection, data)
            .then((result) => {
              if (result.ban)
                io.to(data.custom_url).emit("banUserMessage", data);
              else io.to(data.custom_url).emit("unbanUserMessage", data);
            })
            .catch((err) => {
              //silence
            });
        } catch (e) {
          if (process.env.NODE_ENV !== "production")
            console.log(e, "deleteMessage");
        }
      });
      socket.on("userMessage", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("userMessage", data);
          videoModel
            .createChatMessage(mysqlconnection, data)
            .then((result) => {
              if (result.ban) {
                result.ban = true;
              }
              io.to(data.custom_url).emit("userMessage", result);
            })
            .catch((err) => {
              if (process.env.NODE_ENV !== "production")
                console.log(err, "userMessage");
              //silence
            });
        } catch (e) {
          if (process.env.NODE_ENV !== "production")
            console.log(e, "userMessage");
        }
      });
      socket.on("updateLiveHostTime", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("UPdateLiveHostTime", data);
          videoModel.updateHostLiveTime(mysqlconnection, data);
        } catch (e) {
          if (process.env.NODE_ENV !== "production")
            console.log(e, "updateHostLiveTime");
        }
      });
      socket.on("leaveRoom", function (data) {
        try {
          if (process.env.NODE_ENV != "production")
            console.log("leaveRoom", data);
          videoModel
            .leaveLiveStreaming(mysqlconnection, data)
            .then((_) => {})
            .catch((err) => {});
          socket.leave(data.room ? data.room : data.streamId);
        } catch (e) {
          if (process.env.NODE_ENV !== "production")
            console.log(e, "leaveRoom");
        }
      });
    });
  });
});
