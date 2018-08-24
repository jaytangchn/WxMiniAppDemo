//app.js
App({
  onShow: function () {
    // this.getUserInfo(function(e){

    // });
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          console.log(res);
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        },
        fail: function (userError){
          console.log("xxxxxxx", userError);
          if (userError.errMsg == 'getUserInfo:fail scope unauthorized' || userError.errMsg == 'getUserInfo:fail auth deny' || userError.errMsg == 'getUserInfo:fail:scope unauthorized' || userError.errMsg == 'getUserInfo:fail:auth deny') {

            wx.navigateTo({
              url: '/pages/login/login'
            })

          }
        }
      })
    }
  },
  globalData: {
    user:{},  //用来替代缓存
    userInfo:null,
    roleType:"role_type.general",
    requestUrl: "https://erp.xhllxsp.com/",
    //requestUrl: "http://192.168.1.40:8090/",  //订单管理url
    successCode: "0000",
    tokenServiceName:'tokenService',
    drp_service_name: 'drp/',
    goods_service_name:'goods/',  //商品服务
    //drp_service_name: 'drp_tj/',
    //goods_service_name:'goods_fyf/',  //商品服务
    sys_namagement_service_name: 'sysmanagement/',
    qiniu:{
      qiniuPublicDomain: 'http://ofnd12pa4.bkt.clouddn.com',
      pictureDir: 'drp-minapp',
    },
    isLogin:false, //判断是否登录
  }
})