const s3Upload = require('./upload').uploadtoS3
const commonFunction = require("./commonFunctions")
const imageSize = require("image-size")
const path = require("path")
const uniqid = require('uniqid')
const resize = require("./resize")
const fs = require("fs")
const Sharp = require('sharp')

exports.getSize = async (req,image) => {
    return new Promise(async function (resolve,reject) {
        await imageSize(image, async function (err, dimensions) {
            if(!err){
                oldw = dimensions.width
                oldh = dimensions.height
                resolve(dimensions)
            }else{
                reject(err)
            }
          });

    });
}

exports.crop = async (req,data = {},image) => {
    return new Promise(async function (resolve) {
        const rootPath = req.serverDirectoryPath+"/public"
        const createPath = data['path']
        try{
          let pathData = createPath.substring(0, createPath.lastIndexOf("/"));
          await fs.promises.mkdir(req.serverDirectoryPath+'/public'+pathData, { recursive: true })
        }catch(err){

        }
        if(data.screenWidth > 1400){
            data.screenWidth = 1400;
        }
        let oldw = 0
        let oldh = 0
        await exports.getSize(req,image).then(result => {
            oldh = result.height
            oldw = result.width
        }).catch(err => {
            console.log(err,'Error in coverCrop')
        })
        
        let newh = oldh;//(oldh * parseInt(data.screenWidth)) / oldw;
        let compareHeightOfCover = req.query.containerHeight ? parseInt(req.query.containerHeight) : 200

        var cropHeight = Math.abs(data.y)
        //height
        if(oldh < compareHeightOfCover){
          cropHeight =  0
        }else if(oldh < Math.abs(data.y) + compareHeightOfCover){
            cropHeight = oldh - compareHeightOfCover
        }
        let croppedImage = ""
        const extension = path.extname(image);
        const file = path.basename(image, extension);
        const pathName = req.serverDirectoryPath + "/public/upload/"
        const newFileName = file + uniqid.process('c') + extension;
        var resizeObj = new resize(pathName, image.replace(req.serverDirectoryPath + "/public/upload/",''), req)

        if(extension == ".gif" || extension == ".GIF"){
          // skip
          fs.readFile(pathName+image.replace(req.serverDirectoryPath + "/public/upload/",''), function (err, data) {
            if (err) {
              console.log(err)
              resolve(false);
            }
            if(!err){
              fs.writeFile(pathName+newFileName, data, function (err) {
                  if (err) {
                    console.log(err)
                    resolve(false)
                  }
                  if (!err && req.appSettings.upload_system == "s3" || req.appSettings.upload_system == "wisabi") {
                    s3Upload(req, rootPath+createPath, createPath).then(result => {
                        //remove local file
                        commonFunction.deleteImage(req, "", createPath, 'locale')
                        if(result){
                            resolve(true)
                        }
                    }).catch(err => {
                        console.log(err)
                        resolve(false)
                    })
                  }else{
                      resolve(true)
                  }
              });
            }
          });
        }
        if(extension != ".gif" && extension != ".GIF"){
        await resizeObj.save(pathName+newFileName,{width:parseInt(data.screenWidth),height:newh,fromCover:true}).then(res => {            
            croppedImage = pathName+newFileName;
            commonFunction.deleteImage(req, "", image, 'locale')
            Sharp(croppedImage)
            .extract({ left:0, top:cropHeight, width:parseInt(data.screenWidth), height:oldh < compareHeightOfCover ? oldh : compareHeightOfCover })
            .toFile(rootPath+createPath)
            .then(() => {
                  if (req.appSettings.upload_system == "s3" || req.appSettings.upload_system == "wisabi") {
                      s3Upload(req, rootPath+createPath, createPath).then(result => {
                          //remove local file
                          commonFunction.deleteImage(req, "", createPath, 'locale')
                          if(result){
                              resolve(true)
                          }
                      }).catch(err => {
                          console.log(err)
                          resolve(false)
                      })
                  }else{
                      resolve(true)
                  }
            }).catch(err => {
              resolve(false)
              console.error(err,'ERROR RESIZE');
            })
        })
      }
    });
}