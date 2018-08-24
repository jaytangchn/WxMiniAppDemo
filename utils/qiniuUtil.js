const app = getApp();



const qiniuUploader = require("qiniuUploader");
const request = require("request.js");

const qiniuPublicDomain = app.globalData.qiniu.qiniuPublicDomain;
const pictureDir = app.globalData.qiniu.pictureDir;
const getTokenUrl = app.globalData.requestUrl + app.globalData.work_service_name + '/qiniu/getToken';

/**
 * 获取token
 * 因为是异步请求所以返回Promise对象
 */
function getUploadToken(){
  var p = new Promise(function (resolve, reject) {
    request.request("qiniu","getToken",{},function(res){
        if (res.data.status == '0000'){
          resolve(res)
        }
    },function(e){
      reject(e)
    })

    // wx.request({
    //   method: 'POST',
    //   url: getTokenUrl,
    //   data: {data: {} },
    //   header: {
    //     token: wx.getStorageSync('token')
    //   },
    //   success(res) { 
    //     if (res.data.status == '0000'){
    //       resolve(res)
    //     }
    //     },
    //   fail(e) { reject(e)}
    // });
  });
  return p;
}

/**
 * 上传七牛
 * 因为是异步请求所以返回Promise对象
 */
function upToQiniu(filePath,uploadToken){
  var p = new Promise(function (resolve, reject) {
    qiniuUploader.upload(filePath, (res) => {
      resolve(res);
    }, (error) => {
      console.log('error: ' + error);
    }, {
        region: 'ECN',
        domain: qiniuPublicDomain, //公开域名
        key: pictureDir+'/'+filePath.substring(filePath.lastIndexOf('/') + 1),
        uptoken: uploadToken, // 由其他程序生成七牛 uptoken
      });
  });
  return p;
}

module.exports = {
  getUploadToken: getUploadToken,
  upToQiniu: upToQiniu
}


