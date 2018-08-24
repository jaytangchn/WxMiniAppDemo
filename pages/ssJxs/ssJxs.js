const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderCountList: {},
    date: {},
    dealList:[{comName:"全部"}],
    dealIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      date: dateUtil.formatDateByTs(new Date(), "yyyy-MM")
    });
    this.getOrderCountDetailByDealers();
    this.getDealers();
  },
  bindPickerChange: function (e) {
    let index = e.detail.value;
    this.setData({ dealIndex: index });
    this.getOrderCountDetailByDealers();
  },
  getDealers:function(){
    let that = this;
    request.request("", "partnerM", "queryPartners", { req: {} }, function (resp) {
      let dealList = that.data.dealList;
      let data = resp.data.resp;
      for (let a = 0; a < data.length;a++){
        dealList.push(data[a]);
      }
      that.setData({
        dealList: dealList
      });
      console.log(resp);

    }, null)
  },

  dateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getOrderCountDetailByDealers();
    console.log(e.detail.value);
  },
  getOrderCountDetailByDealers: function () {
    let date = new Date(this.data.date).getTime();
    let partnerName = this.data.dealIndex>0? this.data.dealList[this.data.dealIndex].comName:null;
    
    let req = {
      date: date,
      partnerName: partnerName,
      roleType: wx.getStorageSync("roleList")[0].roleTypeCode
    }
    let that = this;
    request.request("", "personalCenter", "getOrderCountDetailByDealers", { req: req }, function (resp) {
      that.setData({
        orderCountList: resp.data.resp
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