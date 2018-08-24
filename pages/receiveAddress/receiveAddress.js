// pages/receiveAddress/receiveAddress.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addrList:[],
    partnerId:"",
    selectAddrIndex:-1,
    prevPage:{}  //上一页
  },
  useAddr:function(e){
    let index = e.target.dataset.index;
    this.setData({ selectAddrIndex:index});
    this.updateOrderAddr(this.data.addrList[this.data.selectAddrIndex]);
  },
  goEdit: function (e) {
    let addrId = e.target.dataset.addr;
    wx.navigateTo({
      url: '../editAddress/editAddress?addrId='+addrId,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let roleType = util.checkRole();
    this.setData({
      roleType: roleType, 
      partnerId: options.partnerId,
      addrType: options.addrType
      });
    console.log(options);
  },
  getAddrList: function () {
    //获取上页选中的数据, 同时勾选中
    let that = this;
    let preOrderAddr = this.data.prevPage.data.orderAddr;
    let req = { partnerId: this.data.partnerId };
    if(!this.data.partnerId){
      return;
    }
    request.request("", "addrInfo", "queryByAddrInfo", { req: req }, function (res) {
      let addrList = res.data.resp;
      let selectIndex = -1;
      if(!addrList||addrList.length>0){
        for (let i = 0; i < addrList.length; i++) {
          let addrInfo = addrList[i];
          if (addrInfo.addrId == preOrderAddr.addrId) {
            selectIndex = i;
          }
        }
        if (selectIndex > 0) {
          that.setData({ selectAddrIndex: selectIndex })
        } else {
          that.setData({ selectAddrIndex: 0 })
        }
        that.updateOrderAddr(addrList[that.data.selectAddrIndex]);
      }
      that.setData({ addrList: addrList });
      
    }, null);
  },
  delete:function(e){
    let addrId = e.target.dataset.addr;
    let that = this;
    request.request("", "addrInfo", "delete", { id: addrId},function(res){
      that.getAddrList();
    },null);
  },
  /**
   * 微信导入收货地址
   */
  importFromWx:function(e){
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        let addr = {};
        app.globalData.isRequesting = true;
        addr.name = res.userName;
        addr.zip = res.postalCode;
        addr.addrInfo = res.provinceName + res.countyName + res.detailInfo;
        addr.mobile = res.telNumber;
        addr.partnerId = that.data.partnerId
        request.request("","addrInfo","save",{req:addr},function(resp){
          that.getAddrList();
        },null);
      }
    })
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
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    this.setData({prevPage:prevPage});
    this.getAddrList();
  },

  /**更新下单页的收货选项 */
  updateOrderAddr(addr){
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    // prevPage.getAddrList();
   
    //如果是编辑发票收货地址, 那只更新发票地址,如果更新收货地址,那都更新
    if(this.data.addrType=="invoice"){
      this.data.prevPage.updateInvoice(addr);
    }else{
      this.data.prevPage.setData({ orderAddr: addr });
    }
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