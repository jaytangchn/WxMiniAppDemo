const app = getApp();
const sha1 = require('../utils/sha1.js');
const RETURNCODE = "0000";
const TOKEN_IS_EXPIRE = "TOKEN_IS_EXPIRE";
const TOKEN_IS_EMPTY = "TOKEN_IS_EMPTY";

const drp_service_name = app.globalData.drp_service_name;
const goods_service_name = app.globalData.goods_service_name;
const sys_namagement_service_name = app.globalData.sys_namagement_service_name;
const serviceObj = {
  order:app.globalData.drp_service_name,
  goods:app.globalData.goods_service_name
}
/**
 * 封装微信请求
 * @param: serviceName 服务名
 * @param: serviceMethod 服务方法
 * @param: data 业务请求数据，object 类型
 */
function request(serviceType, serviceName, serviceMethod, data, doSuccess, doError) {
  wx.showLoading({
    title: "正在加载"
  });
  var paramData = buildReqData(serviceMethod,data);
  //默认为order系统
  serviceType = serviceType?serviceObj[serviceType]:serviceObj.order;
  var url =  app.globalData.requestUrl + serviceType + "m/" + serviceName + "/" + serviceMethod+".svs";
  wx.request({
    url: url,
    header: getHeader(serviceType),
    data: paramData,
    method: "POST",
    success: res => {
      wx.hideLoading();
      if (res.data.status == TOKEN_IS_EMPTY) {
        console.info(">>>>>token为空");
        wx.showModal({
          title: '提示',
          content: '登录已超时，请重新登录',
          showCancel: false,
          success: () => {
            wx.navigateBack(1);
            wx.redirectTo({
              url: '../login/login',
            });
          }
        })
      } else if (res.data.status != RETURNCODE && res.data.status != TOKEN_IS_EXPIRE) {
        var msg = res.data.msg;
        if (msg == null) {
          msg = "未知错误";
        }
        if (doError == null) {
          toast(null, msg, 3000);
        } else if (typeof doError == "function") {
          doError(res);
        }
        //token过期
      } else if (res.data.status == TOKEN_IS_EXPIRE) {
        console.info("token过期");
        let header = getHeader(serviceType);
        refreshToken(serviceType,serviceName, serviceMethod, paramData, header, doSuccess, doError);
      } else {
        if (typeof doSuccess == "function") {
          doSuccess(res);
        }
      }
    },
    fail: res => {
      wx.hideLoading();
      toast(null, res.errMsg, 3000);
    },
    complete: res => {
    }
  })
}

/**
 * 创建签名
 * @param: serviceMethod 服务方法名
 * @param: data 业务请求数据 object 类型
 * @param: dataStamp 时间戳
 */
function createSign(serviceMethod, data, dateStamp) {
  //"{"req":{"isInvoice":"Y","invoiceJson":"{\"title\":\"广州腾讯科技有限公司\",\"taxNo\":\"91440101327598294H\",\"invoiceType\":\"company\"}","addrJson":"{\"addrInfo\":\"天津市天津市和平区dasfdsa\",\"contactName\":\"dff\",\"phoneNo\":\"18682245643\"}","ordersNo":"201801211621374106","provinceName":"天津市"}}" 防止这种情况，json中包含json
  var signContent = serviceMethod + "_" + dateStamp;
  if (data) {
    var dataJson = JSON.stringify(data);
    dataJson = dataJson.replace(/\\/g, "");
    signContent = serviceMethod + "_" + dataJson + "_" + dateStamp;
  }
  var sign = sha1.hex_sha1(signContent);
  return sign;
}

/**
 * 构建请求参数
 * @param: serviceMethod 服务方法名
 * @param: data 业务请求数据 object 类型
 */
function buildReqData(serviceMethod, data) {
  var dataStr=null;
  if(data){
    dataStr=JSON.stringify(data);
  }
  var dateStamp = new Date().getTime();
  var paramData = {
    data: dataStr,
    sign: createSign(serviceMethod, data, dateStamp),
    dateStamp: dateStamp
  }
  return paramData;
}



//head
function getHeader(serviceType) {
  let dataSource = "";
  if (serviceType.indexOf("drp")>=0||serviceType==""){
    dataSource = "drp"
  } else if (serviceType.indexOf("goods")>=0){
    dataSource = "goods";
  }
  var header = {
    "Content-Type": "application/json",
    "token": wx.getStorageSync("token"),
    "dynamic-datasource":dataSource
    //todo: 添加数据源
  };
  return header;
}

//刷新token
function refreshToken(serviceType,serviceName, serviceMethod, paramData, header, doSuccess, doError) {
  let tokenServiceMethod = "refreshToken";
  let tokenServiceName = "smallProgramApi";
  let dataJson = {};
  let tokenParamData = buildReqData(tokenServiceMethod, dataJson);
  wx.request({
    url: app.globalData.requestUrl + drp_service_name + "m/" +tokenServiceName+'/'+tokenServiceMethod + ".svs",
    header: getHeader(serviceType),
    method: "POST",
    data: tokenParamData,
    success: res => {
      //获取token失败。重新登录
      if (res.data.status != RETURNCODE) {
        //无法刷新token。调用open登录
        wx.login({
          success: function(res) {
            if (res.code) {
             var data = {
                apiWxLoginReq:{
                  loginCode:res.code,
                  mobileNo: wx.getStorageSync("user").userMobile
                }
              }
              request("","smallProgramApi","handleApiWxLogin",data,function(resp){
                console.log(resp)
                if(resp.data.status == RETURNCODE){
                  let loginResp = resp.data.resp.resultData.data.loginResp;
                  wx.setStorageSync("token", loginResp.token);
                  wx.setStorageSync("expireTime", loginResp.expireTime);
                  wx.setStorageSync("user", loginResp.user);
                  wx.setStorageSync("roleList", loginResp.roleList);
                  request("",serviceName, serviceMethod, paramData, header, doSuccess, doError);
                }
              }, function (resp){
                wx.redirectTo({
                  url: '../login/login',
                });
              });
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          }
        });
      } else {
        let token = res.data.data.resultData.data.token;
        console.info("获取token的res:" + JSON.stringify(res));
        wx.setStorageSync("token", token);
        request("",serviceName, serviceMethod, paramData, header, doSuccess, doError);
      }
    },
    fail: res => {
      toast(null, res.errMsg, 3000);
    }
  })
}

//判断是否为空
function isBank(data) {
  if (data == null || data == "" || data == undefined) {
    return true;
  } else {
    return false;
  }
}

//弹出提示框
function toast(doSuccess, msg, time) {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: time,
    success: doSuccess
  });
}

//弹出提示框
function toastCallBack(msg, time, doSuccess) {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: time,
    success: doSuccess
  });
}



module.exports = {
  request: request,
  isBank: isBank,
  toast: toast,
  toastCallBack: toastCallBack
}