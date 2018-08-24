// pages/ssGoods/ssGoods.js
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
    date: dateUtil.formatDateByTs(new Date(), "yyyy-MM"),
    orderCountList: {},
  },

  navTab: function (e) {
    this.setData({
      tab: e.target.dataset.tabid
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      // date: dateUtil.formatDateByTs(new Date(), "yyyy-MM"),
      keyWord: options.keyWord ? options.keyWord : null,
      typeCode: options.typeCode ? options.typeCode :null
    });

  },
  getOrderCountGoodsDetailByGoods: function () {
    let date = new Date(this.data.date).getTime();
    let req = {
      date: date,
      keyWord: this.data.keyWord ? this.data.keyWord : null,
      typeCode: this.data.typeCode ? this.data.typeCode : null,
      roleType: wx.getStorageSync("roleList")[0].roleTypeCode
    }
    let that = this;
    request.request("", "personalCenter", "getOrderCountGoodsDetailByGoods", { req: req }, function (resp) {
      console.log(resp);
      that.setData({
        orderCountList: resp.data.resp
      })
    }, null)
  },
  dateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getOrderCountGoodsDetailByGoods();
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
    this.getOrderCountGoodsDetailByGoods();
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