// pages/login/login.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canLogin: false,
    //mobileNo:"13701627785",
    mobileNo: "",
    smsCode: "",
    smsCodeGetStr: "获取验证码",
    unauthorized:false
  },
  mobileNoInput(e) {
    this.data.mobileNo = e.detail.value;
  },
  smsCodeInut(e) {
    this.data.smsCode = e.detail.value;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
   console.log(pages);
  },
  smsCodeGetStrChange: function () {
    var that = this
    var smsCodeGetStr = this.data.smsCodeGetStr;
    var second = parseInt(this.data.smsCodeGetStr.substr(0, 2)) - 1;
    if (second > 0) {
      this.data.smsCodeGetStr = second + "秒";
      if (second < 10) {
        this.data.smsCodeGetStr = "0" + this.data.smsCodeGetStr;
      }
      this.setData({
        smsCodeGetStr: this.data.smsCodeGetStr
      })
      setTimeout(function () {
        that.smsCodeGetStrChange()
      }, 1000);
    } else {
      this.data.smsCodeGetStr = "获取验证码";
      this.setData({
        smsCodeGetStr: this.data.smsCodeGetStr
      })
    }
  },
  //获取验证码
  getCheckCode: function () {
    if (this.data.smsCodeGetStr != "获取验证码") {
      return;
    }
    var that = this;
    if (util.isBank(this.data.mobileNo)) {
      this.showErroeToast("请输入手机号码");
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(this.data.mobileNo))) {
      this.showErroeToast("手机号码不正确");
      return;
    }
    var paramData = {
      req: {
        mobileNo: this.data.mobileNo
      }
    }
    request.request("","smallProgramApi", "sendLoginSmsCode", paramData, function (resp) {
      console.log(resp);
      if (resp.data.resp.resultData.status == "0000") {
        that.showErroeToast("发送成功");

        that.data.canLogin = true;

        //60秒倒计时
        that.data.smsCodeGetStr = "60秒";
        that.setData({
          smsCodeGetStr: that.data.smsCodeGetStr
        })
        setTimeout(function () {
          that.smsCodeGetStrChange()
        }, 1000);

      } else {
        that.showErroeToast(resp.data.msg);
      }
    }, null)
  },
  apiLogin:function(){
    if (!app.globalData.isLogin) {
      wx.login({
        success: function (res) {
          if (res.code) {
            var data = {
              apiWxLoginReq: {
                loginCode: res.code,
                // mobileNo: "120",
                needMobileNo: false
              }
            }
            request.request("", "smallProgramApi", "handleApiWxLogin", data, function (resp) {
              console.log(resp)
              if (resp.data.resp.resultData.status == app.globalData.successCode) {
                app.globalData.isLogin = true;
                let loginResp = resp.data.resp.resultData.data.loginResp;
                wx.setStorageSync("token", loginResp.token);
                wx.setStorageSync("expireTime", loginResp.expireTime);
                wx.setStorageSync("user", loginResp.user);
                app.globalData.user = loginResp.user;
                wx.setStorageSync("dept", loginResp.dept)
                wx.setStorageSync("roleList", loginResp.roleList);
                //进入首页
                  // wx.switchTab({
                  //   url: '../index/index'
                  // })
                wx.navigateBack({
                  delta: 1
                })

              } else {
                console.error(resp.data.resp.resultData.msg);
              }
            }, function (resp) { });

          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      });
    }
  },
  //登录接口
  login: function () {
    var that = this;
     //todo:暂时注销
    if(util.isBank(this.data.mobileNo)){
      this.showErroeToast("请输入手机号码");
      return;
    }
    if(util.isBank(this.data.smsCode)){
      this.showErroeToast("请输入验证码");
      return;
    }

    wx.login({
      success: function (res) {
        if (res.code) {
          var paramData = {
            apiLoginReq: {
              mobileNo: that.data.mobileNo,
              smsCode: that.data.smsCode,
              loginCode: res.code,
              initUser: false,
              userInfo: JSON.stringify(app.globalData.userInfo)
            }
          }
          request.request("","smallProgramApi", "handleApiLogin", paramData, function (loginSuccessResp) {
            if(loginSuccessResp.data.resp.resultData.status !="0000"){
              that.showErroeToast(loginSuccessResp.data.resp.resultData.msg);
              return ;
            }
            app.globalData.isLogin = true;
            console.log(loginSuccessResp);
            let loginResp = loginSuccessResp.data.resp.resultData.data.loginResp;
            //存储相关信息
            wx.setStorageSync("token", loginResp.token);
            wx.setStorageSync("expireTime", loginResp.expireTime);
            wx.setStorageSync("user", loginResp.user);
            app.globalData.user = loginResp.user;
            wx.setStorageSync("dept", loginResp.dept)
            wx.setStorageSync("roleList", loginResp.roleList);
            //进入首页
            wx.switchTab({
              url: '../index/index'
            })
          }, null)

        } else { console.log('获取用户登录态失败！' + res.errMsg) }
      }
    })
  },
  showErroeToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  },
  showSuccessToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'success',
      duration: 3000
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(app.globalData);
    let that = this;
    if (!app.globalData.userInfo) {
      this.getUserInfo(function(e){
        that.apiLogin();
      });
      return;
    }
    console.log(app.globalData.isLogin,"show");

  },
  bindGetUserInfo: function (userResult) {
    let that = this;
    if (userResult.detail.errMsg == "getUserInfo:ok") {
      app.globalData.userInfo = userResult.detail.userInfo
      that.setData({
        unauthorized: false
      })
      that.apiLogin();
    }
  },
  getUserInfo: function (cb) {
    var that = this;
    if (app.globalData.userInfo) {
      typeof cb == "function" && cb(app.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          console.log(res);
          that.setData({
            unauthorized: false
          })
          app.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(app.globalData.userInfo)
        },
        fail: function (userError) {
          if (userError.errMsg == 'getUserInfo:fail scope unauthorized' || userError.errMsg == 'getUserInfo:fail auth deny' || userError.errMsg == 'getUserInfo:fail:scope unauthorized' || userError.errMsg == 'getUserInfo:fail:auth deny') {
            that.setData({
              unauthorized:true
            })
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
      console.log("hide");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    //如果登录失败且上一个页面为bar 则点击返回就跳转到首页
    if (!app.globalData.isLogin && prevPage.data.isBar){
      wx.reLaunch({
        url: '../index/index',
      })
      return;
    }


  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})