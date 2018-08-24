// pages/partnerDetail/partnerDetail.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab:'01',
    relateClientInfo:[],
    partnerId:"",
    orderList:[],
    userClientInfo:[],
    showAll:false             //展示所有信息
  },
  navTab: function (e) {
    this.setData({
      tab: e.target.dataset.tabid
    })
  },
  /**
   * 拨打电话
   */
  call: function () {
    let num = this.data.userClientInfo.userMobile;
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
      partnerId:options.partnerId
    })
    this.getRelateClientInfo();
  },
  // 关联客户
  getRelateClientInfo:function (){
    let that = this;
    let partnerId = this.data.partnerId;
    let user = wx.getStorageSync("user");
    request.request("", "partnerM", "getSalesmanDataById", { 'userId': partnerId},function(resp){
      let orderList = resp.data.resp.ordersList ? resp.data.resp.ordersList:[];
      for (let i = 0; i < orderList.length;i++){
          let order = orderList[i];
          order.date = dateUtil.formatDateByTs(order.ordersDate);
          order.status = JSON.parse(order.status);
          orderList[i] = order;
      }
      let showAll = false;
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      //所有的经销商信息都是在这里展示, 如果当前是本人或领导,展示所有信息
      if (resp.data.resp.tmSalesmanDetail.userId == user.userId || prevPage.data.selfObj.roleType =="role_type.serviceManager"){
        showAll = true;
      }
      that.setData({
        relateClientInfo: resp.data.resp.partnerUserList,
        userClientInfo: resp.data.resp.tmSalesmanDetail,
        orderList: orderList,
        showAll: showAll
      })
    },null)
   
  },
  goPartner: function (e) {
    let roleType = e.currentTarget.dataset.partner;
    // 先用汉字写上  之后可能会传角色标识
    if (roleType == 'role_type.general') {
      wx.navigateTo({
        url: '../partnerDetailJxs/partnerDetailJxs?partnerId=' + e.currentTarget.dataset.id,
      })
    } 
    // else if (roleType == 'customer') {
    //   wx.navigateTo({
    //     url: '../partnerDetailJxs/partnerDetailJxs?partnerId=' + e.currentTarget.dataset.id,
    //   })
    // }
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