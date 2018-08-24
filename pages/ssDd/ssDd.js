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
    monthList: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    date: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      date: dateUtil.formatDateByTs(new Date(), "yyyy")
    });
    this.getOrderCountDetailByYear();
  },
  dateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getOrderCountDetailByYear();
  },
  getOrderCountDetailByYear: function () {
    let date = new Date(this.data.date).getTime();
    let req = {
      date: date,
      roleType: wx.getStorageSync("roleList")[0].roleTypeCode
    }
    let that = this;
    request.request("", "personalCenter", "getOrderCountDetailByYear", { req: req }, function (resp) {
      let orderCountList = resp.data.resp;
      //todo:手动添加缺失的月份
      let year = new Date().getFullYear();

      let monthList = that.data.monthList;
      let data = [];
      for(let i=0;i<monthList.length;i++){
        let date = year+"-"+monthList[i];
        let obj = {
          totalCount: 0,
          totalPrice: 0,
          shipOrderCount: 0,
          returnOrderCount: 0,
          shipOrderTotalPrice: 0,
          returnOrderTotalPrice: 0
        };
        obj.realName = date;
        data[i] = obj;
        for (let j = 0; j < orderCountList.length;j++){
          if (orderCountList[j].realName == obj.realName){
              data[i] = orderCountList[j];
            }
        }
      }
      console.log(data);
      that.setData({
        orderCountList: data
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