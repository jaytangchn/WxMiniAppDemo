// pages/hasApproval/hasApproval.js

const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const moneyUtil = require("../../utils/moneyUtil.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: '01',
    isBar: true,
    od: false,
    getmes: false,
    mail: false,
    orders:{},
    ordersCode:'',
    operateToken:'',
    xdPartner:{},
    jsPartner:{},
    shAddress:{},
    jsAddress:{},
    goodsList:[],
    deliverList:[],
    isSaleman:false,
    isGeneral:false,
    isLd:false

  },
  navTab: function (e) {
    this.setData({
      tab: e.target.dataset.tabid
    })
  },
  odToggle: function (e) {
    this.setData({
      od: !this.data.od
    })
  },
  getToogle: function () {
    this.setData({
      getmes: !this.data.getmes
    })
  },
  mailToogle: function () {
    this.setData({
      mail: !this.data.mail
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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



    var that = this;
    this.data.ordersCode = options.ordersCode;
    //查询订单信息
    this.loadOrdersDetail();
    //查询订单的商品
    this.loadGoodsList();
    //查询发货信息
    this.loadDeliverList();
  },

  loadDeliverList:function(){
    var that = this;
    var ordersCode = this.data.ordersCode;
    var paramData = {
      ordersCode:ordersCode
    }
    request.request("","sellOrder", "queryDeliverByOrdersCode", paramData, function (resp) {
      console.log(resp);
      if (resp.data.status == "0000") {
        var deliverList = resp.data.resp;
        for (var i = deliverList.length - 1; i >= 0; i--) {
          var deliver = deliverList[i];
          deliver.waybillStatus = JSON.parse(deliver.waybillStatus);
          deliver.updateTimeStr = dateUtil.formatDateByTs(deliver.updateTime,"yyyy-MM-dd hh:mm");
          deliver.createTimeStr = dateUtil.formatDateByTs(deliver.createTime,"yyyy-MM-dd hh:mm");
          deliver.packCount = 0;
          deliver.count = 0;

          var waybillDetailList = deliver.waybillDetailList;
          for (var j = waybillDetailList.length - 1; j >= 0; j--) {
            var detail = waybillDetailList[j];
            deliver.packCount += Number(detail.packCount);
            deliver.count += Number(detail.count);
          }
        }
        that.setData({
          deliverList:deliverList
        })
      }
    }, null)
  },

  loadGoodsList:function(){
    var that = this;
    var ordersCode = this.data.ordersCode;
    var paramData = {
      qryCond: {
          //isQueryBatchNoList:true,
          isQueryDiliverCount:true,
          pageSize:0,
          condition:{
          },
          conditionMapList:[
              {
                  searchOperator:"=",
                  columnValue:ordersCode,
                  columnName:"tgd.orders_code"
              }
          ]
      }
    }
    request.request("","goodsDetail", "query", paramData, function (resp) {
      console.log(resp);
      if (resp.data.status == "0000") {
        var goodsList = resp.data.resp.rows;
        for (var i = goodsList.length - 1; i >= 0; i--) {
          var goods = goodsList[i]
          goods.bzgg = goods.packMultiple+goods.unit+"/"+goods.packUnit;
          if(goods.unit == goods.packUnit && goods.packMultiple==1){
              goods.bzgg = goods.packUnit;
          }
          //箱数零数
          goods.shouldPackCount = Math.floor(goods.shouldTotalCount/goods.packMultiple);
          goods.shouldCount = goods.shouldTotalCount%goods.packMultiple;
          goods.alreadyPackCount = Math.floor(goods.alreadyTotalCount/goods.packMultiple);
          goods.alreadyCount = goods.alreadyTotalCount%goods.packMultiple;


          //if(goods.packMultiple && goods.unit && goods.packUnit){
            var weightUnitList = ["公斤", "毫克", "克", "升", "毫升", "千克"];
            if (weightUnitList.indexOf(goods.unit) < 0) {
                if (goods.packMultiple == 1 && goods.unit == goods.packUnit) {
                    //箱数放到零数上
                    goods.shouldCount = goods.shouldPackCount + goods.shouldCount;
                    goods.shouldPackCount = 0;
                    goods.alreadyCount = goods.alreadyPackCount + goods.alreadyCount;
                    goods.alreadyPackCount = 0;
                }
            }
          //}




        }

        that.setData({
          goodsList:goodsList
        })
      }
    }, null)
  },

  loadOrdersDetail:function(){
    var that = this;
    var id = this.data.ordersCode;
    var paramData = {
      id:id
    }
    request.request("","sellOrder", "load", paramData, function (resp) {
      console.log(resp);
      if (resp.data.status == "0000") {
        var orders = resp.data.resp.tmOrders;
        var xdPartner = resp.data.resp.xdPartner;
        var jsPartner = resp.data.resp.jsPartner;
        var shAddress = resp.data.resp.shAddress;
        var jsAddress = resp.data.resp.jsAddress;
        that.data.operateToken = resp.data.resp.operateToken;
        orders.status = JSON.parse(orders.status);
        orders.createTimeStr = dateUtil.formatDateByTs(orders.createTime);
        orders.ordersDateStr = dateUtil.formatDateByTs(orders.ordersDate);
        orders.ownerUname = resp.data.resp.ownerUname;
        orders.selamanName = resp.data.resp.selamanName;
        orders.extData = JSON.parse(orders.extData);
        orders.ordersSettleMoneyStr = moneyUtil.formatMoneyMaxNDecimals(orders.ordersSettleMoney,4);

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


        that.setData({
          orders:orders,
          xdPartner:xdPartner,
          jsPartner:jsPartner,
          shAddress:shAddress,
          jsAddress:jsAddress,
        })
      }
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

  },
  affirmReceive:function(e){
    var that = this;
    console.log(e.target.dataset.id);
    var paramData = {
      waybill:{
        waybillId:e.target.dataset.id,
        ordersCode:this.data.ordersCode,
        operateToken:this.data.operateToken
      },
      operate:'pass'
    }
    request.request("","sellOrder", "updateDeliverOrders", paramData, function (resp) {
      console.log(resp);
      if (resp.data.status == "0000") {
        //查询订单信息
        that.loadOrdersDetail();
        //查询订单的商品
        //that.loadGoodsList();
        //查询发货信息
        that.loadDeliverList();
      }
    }, null)
  },

  update:function(e){
    var that = this;
    console.log(e);
    var operate = e.target.dataset.operate;
    var paramData = {
      ordersReq:{
        ordersCode:this.data.ordersCode,
        operateToken:this.data.operateToken
      },
      goodsDetailList:[],
      operate:operate
    }
    request.request("","sellOrder", "update", paramData, function (resp) {
      console.log(resp);
      that.loadOrdersDetail();
    }, null)
  },


})