// pages/search/search.js
const app = getApp()
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsCategortiesList:[],
    goodsCategorties: [],       // 
    index: 0,
    keyWord:"",
    sourceFrom:""    //来源有三个: index 首页 , goods 商品分类 , orders 订单
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    this.setData({
      sourceFrom: option.from
    })
  
    //this.data.sourceFrom = option.from;
  },
  /**
   * 输入
   */
  inputSearch:function(e){
    this.data.keyWord = e.detail.value;
  },
  showErroeToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 3000
    })
  },
  /**
   * 点击搜索
   */
  search:function(){
    if (!this.data.keyWord && this.data.index == 0){
      this.showErroeToast("搜索内容不能为空");
      return;
    }
    if (this.data.sourceFrom == "goods"|| this.data.sourceFrom == "index") {
      let typeCode = this.data.index == 0 ? "" : this.data.goodsCategortiesList[this.data.index-1].code
        wx.navigateTo({
          url: '../category/category?typeCode=' + typeCode + "&keyWord=" + this.data.keyWord +"&sourceFrom=search",
        })
    }
  },
  /**
   * 清除输入字符
   */
  clear:function(){
    this.setData({
      keyWord : ""},
    );
  },
  //获取所有的商品分类
  getAllCategorties: function () {
    let that = this;
    request.request("goods", "goodsInfo", "queryGoodsType", null, function (resp) {
      let goodsCategorties=["请选择"];
      for(let i=0;i<resp.data.resp.length;i++){
        goodsCategorties.push(resp.data.resp[i].name);
      }
      that.setData({
        goodsCategortiesList: resp.data.resp,
        goodsCategorties: goodsCategorties
      })
    }, null)
  },
  bindPickerChange: function (e) {
    //由于0位添加了自定义选项,index要偏移1个单位
    if(e<1){
      return ;
    }
    this.setData({
      index: e.detail.value
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
    this.setData({
      index: 0,
      keyWord: "",
    })
    this.getAllCategorties();
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