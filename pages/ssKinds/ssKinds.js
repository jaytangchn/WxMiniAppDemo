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

    typeList:[{name:"全部",code:null}],

    index:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      date: dateUtil.formatDateByTs(new Date(), "yyyy-MM")
    });
    this.getOrderCountDetailByGoodsType();
    this.getDictType();
  },
  bindPickerChange: function (e) {
    let index = e.detail.value;
    this.setData({ index: index });
    this.getOrderCountDetailByGoodsType();
  },
  getDictType: function () {
    let that = this;
    request.request("goods", "goodsInfo", "queryGoodsType", null, function (resp) {
      if (resp.data.status == "0000") {
        let typeList = that.data.typeList;
        let data = resp.data.resp;
        for(let i=0;i<data.length;i++){
            typeList.push(data[i]);
        }
        that.setData({
          typeList: typeList
        });
      }
    }, null)
  },

  dateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getOrderCountDetailByGoodsType();
  },
  getOrderCountDetailByGoodsType: function () {
    let date = new Date("'"+this.data.date+"'").getTime();
    let req = {
      date: date,
      typeCode:this.data.typeList[this.data.index].code,
      roleType: wx.getStorageSync("roleList")[0].roleTypeCode
    }
    let that = this;
    request.request("", "personalCenter", "getOrderCountDetailByGoodsType", { req: req }, function (resp) {
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