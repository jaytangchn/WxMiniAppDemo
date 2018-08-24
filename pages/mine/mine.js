// pages/mine/mine.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBar: true,
    user:{},
    roleType:0,
  },
  imgAction: function(){
    // wx.showActionSheet({
    //   itemList: ['拍照','从手机中选择','保存图片'],
    // })
  },
  navUser: function(){
    wx.navigateTo({
      url: '../mineMes/mineMes',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let currentRole = util.checkRole();
    let that = this;
    this.setData({
      roleType: currentRole
    });
    if (util.checkIsLogin()) {
      let user = wx.getStorageSync("user");
      let userInfo = app.globalData.userInfo;
      user.avatarUrl = userInfo.avatarUrl;
      if(currentRole!='1'){
        let dept = wx.getStorageSync("dept");
        let roleList = wx.getStorageSync("roleList");
        for (let i = 0; i < roleList.length; i++) {
          if (roleList[i].roleTypeCode) {
            user.role = roleList[i];
          }
        }

        user.dept = dept;
        this.setData({
          user: user
        });
      }else{
        request.request("", "partnerM", "getPartnerDetailByLoginUser",null, function (resp) {
           if(resp.data.status=="0000"){
             user.partner = resp.data.resp.tmPartnerDetailCust
             that.setData({
               user: user
             })
           }
        },null)
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
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