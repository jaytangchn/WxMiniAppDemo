// pages/partner/partner.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBar: true,
    partners:[],
    leaders:[],
    options:{},
    roleType:"0",
    selfObj:{}
  },

  searchPartner:function (){
    wx.navigateTo({
      url: '../searchPartner/searchPartner',
    })
  },
  showErroeToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 3000
    })
  },
  goPartner:function (e){
    let roleType = e.currentTarget.dataset.partner;
    let currentRole = util.checkRole();
    console.log(currentRole);
    let goFlag = false;
    if (currentRole == "1" ){
        //判断领导有哪些权限
        goFlag = true;
    }
    if (currentRole =='2'){
        goFlag = true;
    } 
    if (currentRole == '3'){
      goFlag = true;
    }
    if(!goFlag){
      return ;
    }
    if (roleType == 'role_type.salesman') {
      wx.navigateTo({
        url: '../partnerDetail/partnerDetail?partnerId=' + e.currentTarget.dataset.id,
      })
    } else if (roleType == "role_type.serviceManager"){
      return ;
    }else {
      wx.navigateTo({
        url: '../partnerDetailJxs/partnerDetailJxs?partnerId=' + e.currentTarget.dataset.id,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        options: options
      });
    console.log("load");

  },
  getAllPartner:function (){
    let that = this;
    //todo: 获取options, 得到商品搜索参数  this.data.options
    let option = this.data.options;
    let currentRole = util.checkRole();
    let roleType ;
    if (currentRole=="1"){
      roleType ="role_type.general"
    }
    if(currentRole=="2"){
      roleType = "role_type.salesman"
    }
    if(currentRole=="3"){
      roleType = "role_type.serviceManager"
    }
    let req = {
      // "comName": option.name,
     // "roleType": roleType,
      // "arreasFlag": option.arreas,
      "pageSize":9999
    }
    let user = wx.getStorageSync("user");
    request.request("", "partnerM","queryPartnersList",{req:req},function (resp){
      let arr = resp.data.resp;
      if(arr.length<1){
        that.showErroeToast("没有合作伙伴");
      }
      let selfObj = null;
      let partnerList = [];  //合作伙伴List
      let leaderList = [];   //领导list
      for(let i=0 ;i<arr.length;i++){
        arr[i].statusName = arr[i].contractStatus? JSON.parse(arr[i].contractStatus).desc:"";
        if (arr[i].contactUid == user.userId){
          selfObj = arr[i];
        } else if (arr[i].roleType =="role_type.serviceManager"){
          leaderList.push(arr[i]);
        }else{
          //刨去本人
          if (arr[i].contactUid != user.userId){
            partnerList.push(arr[i]);
          }
        }
      }
      let roleType = 'role_type.serviceManager';
      //that.leaderHead(arr,roleType);
      that.setData({
        partners: partnerList,
        leaders: leaderList,
        selfObj: selfObj
      })
    },null)
  },

  // 更改数组顺序，把业务经理放在第一个
  leaderHead:function(e,roleName){
    for(let i=0;i<e.length;i++){
      if(e[i].roleType==roleName){
        var manager = e[i];
        var index= i;
      }
    }
    e.splice(index,1);
    e.unshift(manager);
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
    if (!util.checkIsLogin()) {
      return;
    };
    let currentRole = util.checkRole();
    this.setData({
      roleType: currentRole
    })
    this.getAllPartner();
    console.log("show");
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