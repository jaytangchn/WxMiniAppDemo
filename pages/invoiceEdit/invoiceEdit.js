// pages/invoiceEdit/invoiceEdit.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prevPage:{},
    invoiceInfo:{},
    chooseTypeList:[false,false,false,true,true,true],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    this.setData({ prevPage: prevPage, invoiceInfo: prevPage.data.invoiceInfo });
    console.log(prevPage);
  },
  chooseType:function(e){
    let index = e.target.dataset.index;

    let chooseTypeList = this.data.chooseTypeList;
    if (index == "1" && chooseTypeList[0]){
      return ;
    }
    let invoiceInfo = this.data.invoiceInfo;
    if(index == "0" || index == "3"){
      chooseTypeList[index] = true;
      chooseTypeList[3 - index] = false;
      invoiceInfo.isPersonal = index =="0"?"1":"0"
      if(index=="0"){
        chooseTypeList[1] = false;
        chooseTypeList[4] = true;
      }
    }
    if(index == "1" || index == "4"){
      chooseTypeList[index] = true;
      chooseTypeList[5 - index] = false;
      invoiceInfo.isCommonInvoice = index=="1"?"0":"1"
    }
    this.setData({ chooseTypeList: chooseTypeList, invoiceInfo: invoiceInfo });
  },
  /**
   * 修改数据
   */
  updateInvoice:function(e){
    let label = e.target.dataset.type;
    let invoice = this.data.invoiceInfo;
    invoice[label] = e.detail.value;
    this.setData({ invoiceInfo:invoice});
  },
  save:function(e){
    let invoiceInfo = this.data.invoiceInfo;
    //个人普通发票
    if (invoiceInfo.isPersonal == "1" && invoiceInfo.isCommonInvoice=="1"){
      invoiceInfo.bankName="";
      invoiceInfo.bankNo="";
      invoiceInfo.taxNo="";
    }
    //单位普通发票
    if (invoiceInfo.isPersonal == "0" && invoiceInfo.isCommonInvoice == "1") {
      invoiceInfo.bankName = "";
      invoiceInfo.bankNo = "";
    }
    //单位专用发票
    if (invoiceInfo.isPersonal == "0" && invoiceInfo.isCommonInvoice == "0") {
      console.log("专用发票,牛逼!");
    }
    this.data.prevPage.setData({ invoiceInfo:invoiceInfo});
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 导入微信发货抬头
   */
  importInvoiceFromWx:function(e){
    let that = this;
    let invoice = this.data.invoiceInfo;
    wx.chooseInvoiceTitle({
      success(res) {
        console.log(res);
      
        invoice.isPersonal = res.type;
        invoice.invoiceTitle = res.title;
        invoice.taxNo = res.taxNumber;
        invoice.bankName =res.bankName;
        invoice.bankNo = res.bankAccount;
        that.setData({ invoiceInfo:invoice});
      }
    })
  },
  /**
   * 导入微信收货地址
   */
  importAddrFromWx:function(e){
    let invoiceInfo = this.data.invoiceInfo;
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        invoiceInfo.reciveName = res.userName;
        invoiceInfo.reciveTel = res.telNumber;
        invoiceInfo.reciveAddr = res.provinceName+res.cityName+res.countyName+res.detailInfo;
        that.setData({ invoiceInfo: invoiceInfo});
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
      let invoiceInfo = this.data.invoiceInfo ; 
      let chooseTypeList = [false,false,false,false,false,false];
      if (invoiceInfo.isPersonal == "1"){
        chooseTypeList[0] = true;
      }else{
        chooseTypeList[3] = true;
      };
      if (invoiceInfo.isCommonInvoice =="1"){
        chooseTypeList[4] = true;
      }else{
        chooseTypeList[1] = true;
      }
      this.setData({ chooseTypeList: chooseTypeList})
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