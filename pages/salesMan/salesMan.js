const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      orderCountList:{},
      date:{},
      salesManList:[{realName:"全部",userId:null}],
      salesManIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      date: dateUtil.formatDateByTs(new Date(), "yyyy-MM")
    });
    this.getOrdersDetailBySalesMan();
    this.getSalesMan();
  },
  bindPickerChange: function (e) {
    let index = e.detail.value;
    this.setData({ salesManIndex: index });
    this.getOrdersDetailBySalesMan();
  },
  /**
   * 获取所有业务员
   */
  getSalesMan:function(e){
    let req = {
      roleType:"role_type.salesman"
    };
    let that = this;
    request.request("", "partnerM", "queryByRole", { req: req }, function (resp) {
      if(resp.data.status=="0000"){
        let salesManList = that.data.salesManList;
        let data = resp.data.resp;
        for(let i=0;i<data.length;i++){
            salesManList.push(data[i]);
        }
        that.setData({
          salesManList: salesManList
        });
      }
      console.log(resp);
    }, null)
  },
  dateChange:function(e){
    this.setData({
      date:e.detail.value
    })
    this.getOrdersDetailBySalesMan();
    console.log(e.detail.value);
  },
  getOrdersDetailBySalesMan:function(){
    let date = new Date(this.data.date).getTime();
    let name = this.data.salesManList[this.data.salesManIndex].realName;
    if (this.data.salesManIndex==0){
      name=null;
    }
    let req = {
      date: date,
      keyWord:name,
      roleType: wx.getStorageSync("roleList")[0].roleTypeCode
    }
    let that = this;
    request.request("", "personalCenter","getOrdersDetailBySalesMan",{req:req},function(resp){
      that.setData({
        orderCountList : resp.data.resp
      })
    
    },null)
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