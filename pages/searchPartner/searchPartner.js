// pages/searchPartner/searchPartner.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    partnerTypeList:['请选择','业务经理','业务员','经销商'],
    partnerTypeValueList: ['', 'role_type.serviceManager', 'role_type.salesman','role_type.general'],
    partnerIndex:0,
    arreasIndex:0,
    arrearsList:['请选择','是','否'],
    arrearsValueList:['','1','0'],
    partnerType:"",
    arreas:"",
    name:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  showErroeToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 3000
    })
  },
  search:function(){
    if (!this.data.name && !this.data.partnerType){
      this.showErroeToast("搜索内容不能为空");
      return ;
    }
    let url = "../searchPartnerResult/searchPartnerResult?name=" + this.data.name + "&arreas=" + this.data.arreas + "&partnerType=" + this.data.partnerType;
    //跳到 tabBar  只能switch
    // var pages = getCurrentPages();
    // var currPage = pages[pages.length - 1];   //当前页面
    // var prevPage = pages[pages.length - 2];
    // prevPage.setData({options:{ name: this.data.name, arreas: this.data.arreas, partnerType:this.data.partnerType }});
    wx.navigateTo({
      url: url
    })
    // let url = "../partner/partner?name=" + this.data.name + "&arreas=" + this.data.arreas + "&partnerType=" + this.data.partnerType;
    // wx.navigateTo({
    //   url: url
    // })
  },
  inputSearch:function(e){
    if(e.detail.value){
      this.setData({ name:e.detail.value});
    }
  },
  bindPickerChange:function(e){
    let value = this.data.partnerTypeValueList[e.detail.value];
    this.setData({
      partnerIndex:e.detail.value,
      partnerType:value
    });
  },
  bindArrearsChange:function(e){
    let value = this.data.arrearsValueList[e.detail.value];
    this.setData({
      arreasIndex: e.detail.value,
      arreas:value
    });
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
        partnerIndex: 0,
        arreasIndex: 0,
        partnerType: "",
        arreas: "",
        name: "",
        keyWord:""
      });
      console.log("xxxx");
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