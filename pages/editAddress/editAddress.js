// pages/editAddress/editAddress.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr:{}
  },
  showErroeToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let addrId = options.addrId;
      this.loadAddr(addrId);
  },

  updateAddr:function(e){
    let typeCode = e.target.dataset.type
    let addr = this.data.addr;
    if(typeCode=="name"){
      addr.name = e.detail.value;
    }
    if (typeCode =="mobile"){
      addr.mobile = e.detail.value;
    }
    if (typeCode =="tel"){
      addr.tel = e.detail.value;
    }
    if (typeCode =="addrInfo"){
      addr.addrInfo = e.detail.value;
    }
    if (typeCode == "zip" ){
      addr.zip = e.detail.value;
    }
    //todo: 校验
    this.setData({addr:addr});
    if (typeCode == "save"){
      if (!addr.name) {
        this.showErroeToast("收货人不能为空");
        return;
      }
      if (!addr.mobile) {
        this.showErroeToast("收货人手机号不能为空");
        return;
      }
      if (!(/^1[34578]\d{9}$/.test(addr.mobile))) {
        this.showErroeToast("手机号码格式不正确");
        return;
      }
      if (!addr.addrInfo) {
        this.showErroeToast("收货地址不能为空");
        return;
      }
      request.request("","addrInfo","update",{req:addr},function(res){
        if (res.data.success) {
          wx.showToast({
            title: '修改成功',
          })
        }
      },null);
    }
  },
  loadAddr: function(id){
    let that = this;
    request.request("", "addrInfo", "load", { id: id }, function (res) {
      that.setData({addr:res.data.resp.tmAddrInfo})
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