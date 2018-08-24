// pages/mineMes/mineMes.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let roleType = util.checkRole();;
      if (roleType){
        let user = wx.getStorageSync("user");
        let dept = wx.getStorageSync("dept");
        user.dept = dept;
       
        
        if (roleType == "1") {
          this.getDealerInfo();
          user.roleName = "经销商";
        } 

        if (roleType == "2"){
          user.type="sales"
          user.roleName = "业务员";
          this.setData({
            data: user
          });
        }

        if (roleType == "3"){
          user.type="manaer";
          user.roleName = "业务经理";
          this.setData({
            data:user
          });
        } 
      }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 退出
   */
  logout: function(){
      let that = this;
      request.request("", "smallProgramApi","loginOut",null,function(resp){
        if(resp.data.success){
          app.globalData.isLogin = false;
          wx.clearStorage();
          wx.reLaunch({
            url: '../index/index',
          })
        }
      },null)
  },
  /**
   * 获取经销商信息
   */
  getDealerInfo(){
    let that = this;
    request.request("", "partnerM","getPartnerDetailByLoginUser",null,function(resp){
      let data = resp.data.resp.tmPartnerDetailCust;
      data.type = "dealer"
      that.setData({
        data:data
      })
    },null)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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