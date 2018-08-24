// pages/partnerDetailJxs/partnerDetailJxs.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: '01',
    clientInfo:{},
    partnerId: "",
    orderList:[]
  },
  navTab: function (e) {
    this.setData({
      tab: e.target.dataset.tabid
    })
  },
  /**
   * 拨打电话
   */
  callMobile:function(){
    let num = this.data.clientInfo.contactMobile;
    if(!num){
      return;
    }
    wx.makePhoneCall({
      phoneNumber: num 
    })
  },
  call:function(){
    let num = this.data.clientInfo.companyTel;
    if (!num) {
      return;
    }
    wx.makePhoneCall({
      phoneNumber: num
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      partnerId: options.partnerId
    })
    this.getClientInfo();
  },
  getClientInfo: function () {
    let that = this;
    let partnerId = that.data.partnerId;
    request.request("", "partnerM", "getPartnerDataById", { 'partnerId': partnerId }, function (resp) {
      let information = resp.data.resp.tmPartner;
      information.useAmount = information.useAmount ? information.useAmount:0;
      let orderList = resp.data.resp.ordersList;
      for (let i = 0; i < orderList.length; i++) {
        let order = orderList[i];
        order.date = dateUtil.formatDateByTs(order.ordersDate);
        order.status = JSON.parse(order.status);
        orderList[i] = order;
      }
      that.setData({
        clientInfo: information,
        orderList: orderList
      })
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