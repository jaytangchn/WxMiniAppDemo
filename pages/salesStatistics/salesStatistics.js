// pages/salesStatistics/salesStatistics.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: "",
    data:{},
    yesterDay:"",
    month:"",
    isDealer:false,  //经销商
    isSalesMan:false, //业务员
    isManager:false //领导
  },
  checkRoleType:function(){
    var roleType = util.checkRole();
    if (roleType == '1') {
      this.setData({
        isDealer:true
      })
    } 
    if (roleType == '2') {
      this.setData({
        isSalesMan: true
      })
    } 
    if (roleType == '3') {
      this.setData({
        isManager: true
      })
    }
  },
  unableToast: function(){
    wx.navigateTo({
      url: '../salesMan/salesMan',
    })
    // wx.showToast({
    //   title: '暂无权限',
    //   icon: 'none'
    // })
  },
  ssDd:function(){
    wx.navigateTo({
      url: '../ssDd/ssDd',
    })
  },
  ssKinds: function () {
    wx.navigateTo({
      url: '../ssKinds/ssKinds',
    })
  },
  ssGoods: function () {
    wx.navigateTo({
      url: '../ssGoods/ssGoods',
    })
  },
  ssQd: function () {
    wx.navigateTo({
      url: '../ssQd/ssQd',
    })
  },
  ssJxs: function () {
    wx.navigateTo({
      url: '../ssJxs/ssJxs',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let today = dateUtil.formatDateByTs(new Date().getTime(),"yyyy-MM-dd");
    let yesterDay = dateUtil.formatDateByTs(new Date().getTime()-24*3600*1000,"yyyy-MM-dd");
    let month = dateUtil.formatDateByTs(new Date().getTime(),"yyyy-MM");
    this.setData({
      today:today,
      yesterDay: yesterDay,
      month:month
    });
    this.getOrdersCount();
    this.checkRoleType();
  },
  getOrdersCount: function () {
    let that = this;
    request.request("", "personalCenter", "getOrdersCount", { req: {} }, function (resp) {
      that.setData({
        data:resp.data.resp
      })
      console.log(resp);
    }, null)
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