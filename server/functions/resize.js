const Sharp = require('sharp');
const imageSize = require("image-size")
const path = require('path')
const fs = require('fs')

class Resize {
  constructor(folder,filename,req) {
    this.folder = folder;
    this.filename = filename;
    this.req = req;
    this.filepath = req.serverDirectoryPath
  }
  async save(uploadedFilename,data = {}) {
    const filepath = this.folder+this.filename;
    let width = 0 
    let height = 0

    const extension = path.extname(filepath);
    if(extension == ".gif" || extension == ".GIF"){
      return new Promise((resolve, reject) => {
        fs.readFile(filepath, function (err, data) {
          if (err) {
            console.log(err)
            resolve(false);
          }
          if(!err){
            fs.writeFile(uploadedFilename, data, function (err) {
                if (err) {
                  console.log(err)
                  resolve(false)
                }
                resolve(true)
            });
          }
        });
      });
    }
    if(extension != ".gif" && extension != ".GIF"){
      await imageSize(filepath, function (err, dimensions) {
        width = dimensions.width
        height = dimensions.height
      });
      return new Promise((resolve, reject) => {
        if(!data.fromCover) {
            Sharp(filepath)
            .resize({
              width:Object.keys(data).length ? data.width : this.req.imageResize[0].width,
              fit: Sharp.fit.cover,
            })
            .toFile(uploadedFilename)
            .then(() => {
              resolve(true);
            }).catch(err => {
              resolve(false)
              console.error(err,'ERROR RESIZE');
          })
        }else{
          Sharp(filepath)
            .resize(Object.keys(data).length ? data.width : this.req.imageResize[0].width, Object.keys(data).length ? data.height : this.req.imageResize[0].height, {
              
            })
            .toFile(uploadedFilename)
            .then(() => {
              resolve(true)
            }).catch(err => {
              resolve(false)
              console.error(err,'ERROR RESIZE');
          })
        }
      })
    }
  }
  
}
module.exports = Resize;