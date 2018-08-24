// pages/order/order.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    isInit:false,
    tab:'01',
    ordersList:[],
    pageNum:1,
    pageSize:10,
    totalCount:0,
    qryCond:{},
    isSaleman:false,
    isGeneral:false,
    isLd:false
  },
  navTab: function (e) {
    this.data.tab = e.target.dataset.tabid;
    this.initOrdersListAndQuery();
    this.setData({
      tab: e.target.dataset.tabid
    })
  },
  toSearch:function(){
    wx.navigateTo({
      url: '../searchOrder/searchOrder',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    if(!this.data.isInit){
      var roleList = wx.getStorageSync("roleList");
      for (var i = roleList.length - 1; i >= 0; i--) {
        var role = roleList[i];
        if(role.roleTypeCode == 'role_type.general'){
          this.data.isGeneral = true;
        }else if(role.roleTypeCode == 'role_type.salesman'){
          this.data.isSaleman = true;
        }else if(!util.isBank(role.roleTypeCode)){
          //其他默认为领导
          this.data.isLd = true;
        }
      }
      //this.initOrdersListAndQuery();
      this.data.isInit = true;
    }
    this.initOrdersListAndQuery();
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
    console.log("11111")
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   console.log("2222222");
   if(this.data.ordersList.length < this.data.totalCount){
    this.data.pageNum = this.data.pageNum+1;
    this.queryOrders();
   }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },


  initOrdersListAndQuery(){
    this.setData({
      ordersList:[],
      totalCount:0
    })
    this.data.pageNum = 1;
    this.data.totalCount = 0;
    this.data.ordersList = [];
    this.queryOrders();
  },

  queryOrders:function(){
    var that = this;
    var paramData = {
       qryCond: {
          pageNum:this.data.pageNum,
          pageSize:this.data.pageSize,
          conditionMapList:[]
        }
    }

    if(this.data.tab == '01'){
      var roleList = wx.getStorageSync("roleList");
      var conditionMap = {
        columnName:'tor.status',
        searchOperator:'value_range',
        columnValue:''
      };

      for (var i = roleList.length - 1; i >= 0; i--) {
        var role = roleList[i];
        if(role.roleTypeCode == 'role_type.general'){
          if(conditionMap.columnValue != ''){
            conditionMap.columnValue = conditionMap.columnValue + ",";
          }
          conditionMap.columnValue = conditionMap.columnValue + "drp_orders_status.sale_draft";
        }else if(role.roleTypeCode == 'role_type.salesman'){
          if(conditionMap.columnValue != ''){
            conditionMap.columnValue = conditionMap.columnValue + ",";
          }
          conditionMap.columnValue = conditionMap.columnValue + "drp_orders_status.sale_draft,drp_orders_status.sale_unconfirmed";
        }else if(!util.isBank(role.roleTypeCode)){
          //其他默认为领导
          if(conditionMap.columnValue != ''){
            conditionMap.columnValue = conditionMap.columnValue + ",";
          }
          conditionMap.columnValue = conditionMap.columnValue + "drp_orders_status.sale_wait_for_audit";
        }
      }
      paramData.qryCond.conditionMapList.push(conditionMap);
    }

    request.request("","sellOrder", "query", paramData, function (resp) {
      console.log(resp);
      if (resp.data.status == "0000") {
        if(that.data.ordersList == null){
          that.data.ordersList = [];
        }
        var ordersList = resp.data.resp.rows;
        for (var i = 0; i < ordersList.length; i++) {
          var orders = ordersList[i];
          orders.status = JSON.parse(orders.status);
          orders.createTimeStr = dateUtil.formatDateByTs(orders.createTime)
          //确定可以拥有的按钮
          var ordersStatus = util.selectMap.sellOrderStatus;
          if(orders.status.value == ordersStatus[1].value){
            //草稿
            if(that.data.isGeneral || that.data.isSaleman){
              orders.editButton = true;
              orders.submitButton = true;
              orders.invalidButton = true;
            }
          }else if(orders.status.value == ordersStatus[2].value){
            //待确认
            if(that.data.isSaleman){
              orders.editButton = true;
              orders.affirmPassButton = true;
              orders.affirmRejectButton = true;
              orders.invalidButton = true;
            }
          }else if(orders.status.value == ordersStatus[3].value){
            //待审核
            if(that.data.isLd){
              orders.checkPassButton = true;
              orders.checkRejectButton = true;
              orders.invalidButton = true;
            }
          }else if(orders.status.value == ordersStatus[6].value){
            //待收货
            if(that.data.isLd){
              orders.forceFinishButton = true;
            }
          }
          that.data.ordersList.push(orders);
        }
        that.setData({
          ordersList: that.data.ordersList,
          totalCount:resp.data.resp.total
        })
      }
    }, null)

  },

  update:function(e){
    var that = this;
    console.log(e);
    var index = e.target.dataset.index;
    var orders = this.data.ordersList[index];
    var operate = e.target.dataset.operate;
    var paramData = {
      ordersReq:{
        ordersCode:orders.ordersCode,
        operateToken:orders.operateToken
      },
      goodsDetailList:[],
      operate:operate
    }
    request.request("","sellOrder", "update", paramData, function (resp) {
      console.log(resp);
      that.initOrdersListAndQuery();
    }, null)
  },

  edit:function(e){
    var that = this;
    var index = e.target.dataset.index;
    var orders = this.data.ordersList[index];
    wx.navigateTo({
       url: '../editOrder/editOrder?ordersCode='+orders.ordersCode
    });
  },
  lower:function(e){
    console.log(e)
  }


})

