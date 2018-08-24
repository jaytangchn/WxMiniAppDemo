// pages/ssQd/ssQd.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    channelList:[{name:"全部",code:null}],
    index:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      date: dateUtil.formatDateByTs(new Date(), "yyyy-MM")
    });

    this.getOrderCountDetailByChannel();
    this.getChannel();
  },
  bindPickerChange:function(e){
    let index = e.detail.value;
    this.setData({ index : index });
    this.getOrderCountDetailByChannel();
  },
  getChannel:function(){
    let that = this;
    request.request("", "dict", "queryByParentCode", { req: "DISTRIBUTION_CHANNEL" }, function (resp) {
      if(resp.data.status=="0000"){
        let list = that.data.channelList;
        let data = resp.data.resp;
        for (let i = 0; i < data.length; i++) {
          list.push(data[i]);
        }
        that.setData({
          channelList: list
        });
      }
    }, null)
  },
  getOrderCountDetailByChannel: function () {
    let date = new Date(this.data.date).getTime();
    let req = {
      date: date,
      typeCode: this.data.channelList[this.data.index].code,
      roleType: wx.getStorageSync("roleList")[0].roleTypeCode
    }
    let that = this;
    request.request("", "personalCenter", "getOrderCountDetailByChannel", { req: req }, function (resp) {
      that.setData({
        orderCountList: resp.data.resp
      })

    }, null)
  },
  dateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getOrderCountDetailByChannel();
    console.log(e.detail.value);
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