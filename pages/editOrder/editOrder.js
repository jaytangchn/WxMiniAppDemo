// pages/checkOrder/checkOrder.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ordersCode:"",
    orderDate:"",
    index:0,
    roleType:"",
    remark:"",
    addrList:[],   //所有的收货地址
    orderAddr:{} , //商品收货地址
    accountClientList:[],//结算客户list
    accountClientIndex:0,//选中的结算客户index
    accountClient:{},//选中的收货地址
    orderClientIndex:0,
    orderClient:{},
    isInvoiceDeliver:['无需发票','发票随货','发票不随货'],
    isInvoiceDeliverIndex:1,
    invoiceInfo:{},//发票信息
    goodsList:[],
    total:{},
    offerTotal:"",
    totalPrice:"",
    realPrice:"",

    toggleChoose:"off",  //是否弹出商品规格页面
    selectedGoods:{},

    isSaleman:false,
    isGeneral:false,
    isLd:false

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
    //加载信息--订单，商品，地址，客户，
    var ordersCode = options.ordersCode;
    this.data.ordersCode = ordersCode;
    request.request('', "sellOrder", "load", { id:ordersCode },function(resp){
        console.log(resp);
        if(resp.data.success){
          var respObj = resp.data.resp;
          var orders = respObj.tmOrders;
          orders.extData = JSON.parse(orders.extData);
          var invoiceInfo = orders.extData.invoiceInfo;
          var isInvoiceDeliverIndex = 0;
          if(invoiceInfo == null){
          }else if(invoiceInfo.deliverType == "1"){
            isInvoiceDeliverIndex = "1"
          }else if(invoiceInfo.deliverType == "2"){
            isInvoiceDeliverIndex = "2"
          }
          that.setData({
            invoiceInfo:invoiceInfo,
            isInvoiceDeliverIndex:isInvoiceDeliverIndex,
            orderDate:dateUtil.formatDateByTs(orders.ordersDate),
            remark:orders.remark
          });
          that.getPartnerList(orders.extData.xdPartnerId,orders.extData.jsPartnerId,orders.extData.shAddressId);
        };
    },null)

    var goodsListQueryParam = {
      qryCond: {
          //isQueryBatchNoList:true,
          //isQueryDiliverCount:true,
          pageSize:0,
          condition:{},
          conditionMapList:[
              {
                searchOperator:"=",
                columnValue:ordersCode,
                columnName:"tgd.orders_code"
              }
          ]
      }
    }
    request.request('', "goodsDetail", "query", goodsListQueryParam,function(resp){
      console.log(resp);
      if(resp.data.success){
        var goodsList = resp.data.resp.rows;
        for (var i = goodsList.length - 1; i >= 0; i--) {
          var goods = goodsList[i];
          goods.goodsImgUrl = JSON.parse(goods.goodsImgUrl);
        }
        that.setData({ goodsList: goodsList});
        that.calTotalPrice();
      };
    },null);
  },



  /**
   * 将购物车中的商品添加
   **/
  addGWCGoods:function(e){
    let goodsList = wx.getStorageSync('cartGoods');
    if(goodsList.length<1){
      return;
    }
    let resultGoodsList = [];
    for (let i = 0; i < goodsList.length; i++) {
      let goods = {};
      let selectedGoods = goodsList[i];
      goods.goodsName = selectedGoods.goodsName;
      goods.tmGoodsSkuListCusts = selectedGoods.tmGoodsSkuListCusts;
      goods.goodsCode = selectedGoods.goodsCode;
      goods.excessCnt = selectedGoods.excessCnt;
      goods.realDiscount = selectedGoods.realDiscount;  //折扣比率
      goods.totalPrice = selectedGoods.totalPrice;// 实际总金额(元)
      goods.packageCnt = selectedGoods.packageCnt;// 包装数量
      //goods.packUnit = selectedGoods.tmGoodsSkuListCusts[0].packUnit;// 包装规格
      //goods.packMultiple = selectedGoods.tmGoodsSkuListCusts[0].packStandards[goodsDetail.packUnit].cnt;// 包装规格(倍数)
      goods.skuList = selectedGoods.skuList;
      goods.goodsType = selectedGoods.goodsType;
      resultGoodsList.push(goods);
    }

    var originGoodsList = this.data.goodsList;
    for (var j = resultGoodsList.length - 1; j >= 0; j--) {
      var newGoods = resultGoodsList[j];
      var needPush = true;
      for (var i = originGoodsList.length - 1; i >= 0; i--) {
        var originGoods = originGoodsList[i];
        if(newGoods.tmGoodsSkuListCusts[0].skuCode == originGoods.skuCode){
          originGoods.count += newGoods.excessCnt; ;
          originGoods.packCount += newGoods.packageCnt;
          originGoods.totalCount = originGoods.packCount * originGoods.packMultiple + originGoods.count;
          originGoods.realTotal = (originGoods.totalCount*originGoods.realPrice).toFixed(4);
          originGoods.discountTotal = ((originGoods.marketPrice-originGoods.realPrice)*originGoods.totalCount).toFixed(4);
          needPush = false;
          break;
        }
      }
      if(needPush){
        let goods = newGoods;
        let goodsDetail = {};
        goodsDetail.goodsName = goods.goodsName;
        goodsDetail.goodsImgUrl = goods.tmGoodsSkuListCusts[0].imgUrls;
        goodsDetail.goodsCode = goods.goodsCode;
        goodsDetail.skuCode = goods.tmGoodsSkuListCusts[0].skuCode;
        //goodsDetail.batchNo = goods.
        goodsDetail.unit = goods.tmGoodsSkuListCusts[0].skuUnit;   //计价单位
        goodsDetail.count = goods.excessCnt;      //零数
        goodsDetail.marketPrice = goods.tmGoodsSkuListCusts[0].marketPrice; //市场价
        goodsDetail.discountRatio = goods.realDiscount/100;  //折扣比率
        goodsDetail.realPrice = (goodsDetail.marketPrice * goodsDetail.discountRatio).toFixed(2); //实际价格
        goodsDetail.discountTotal = goodsDetail.marketPrice - goodsDetail.realPrice; // 折扣让利金额(元)
        goodsDetail.realTotal = goods.totalPrice;// 实际总金额(元)
        goodsDetail.packUnit = goods.tmGoodsSkuListCusts[0].packUnit;
        goodsDetail.packMultiple = goods.tmGoodsSkuListCusts[0].packStandards[goodsDetail.packUnit].cnt;// 包装规格(倍数)
        goodsDetail.packCount = goods.packageCnt;// 包装数量
        goodsDetail.packPrice = goods.tmGoodsSkuListCusts[0].packStandards[goodsDetail.packUnit].price;// 包装标价
        goodsDetail.packRealPrice = goodsDetail.packPrice * goodsDetail.discountRatio / 100;// 包装实际售价
        goodsDetail.totalCount = goodsDetail.packCount * goodsDetail.packMultiple + goodsDetail.count
        goodsDetail.ownerUid = this.data.orderClient.ownerUid;
        goodsDetail.goodsType = goods.goodsType;
        goodsDetail.extData = {
          goodsType: Object.keys(JSON.parse(goodsDetail.goodsType))[0]
        }
        originGoodsList.push(goodsDetail);
      }
    }
    this.setData({
      goodsList:originGoodsList
    });

    //wx.removeStorageSync("total");
    //wx.removeStorageSync("cartGoods");

    this.calTotalPrice();
  },


  editAddress:function(e){
    if (!this.data.orderClient || !this.data.orderClient.partnerId) {
      return;
    }
    let url = '../receiveAddress/receiveAddress?partnerId=' + this.data.orderClient.partnerId
    //如果是商品收货地址
    if (e.currentTarget.dataset.addrtype =="goods"){
      url = url +"&addrType=goods";
    }
    //如果是发票收货地址
    if (e.currentTarget.dataset.addrtype =="invoice"){
      url = url + "&addrType=invoice";
    }
    console.log(url);
    wx.navigateTo({
      url: url
    })

  },

  /**
   * 提交订单
   */
  submitOrder:function(e){
    if(this.data.goodsList.length <= 0){
      wx.showToast({
        title: '订单不能没有商品',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    let orders = {};
    orders.ordersCode = this.data.ordersCode;
    orders.ownerUid = this.data.orderClient.ownerUid;   //同下单人的所属人
    orders.ordersDate = this.data.orderDate;
    orders.partnerId = this.data.orderClient.partnerId;
    orders.remark = this.data.remark;
    orders.ordersSettleMoney = this.data.totalPrice;
    orders.goodsMoney = this.data.realPrice;
    orders.partnerChangeMoney = (0 - this.data.totalPrice);
    //发票信息
    let invoiceInfo = this.data.invoiceInfo;
    if (this.data.isInvoiceDeliverIndex=="0"){
      invoiceInfo = null;
    } else if (this.data.isInvoiceDeliverIndex=="1"){
      invoiceInfo.deliverType = "1";         //随货
    } else if (this.data.isInvoiceDeliverIndex=="2"){
      invoiceInfo.deliverType = "2";        //单独
    }
    orders.extData={
      xdPartnerId: this.data.orderClient.partnerId,
      xdPartnerName: this.data.orderClient.partnerName,
      jsPartnerId: this.data.orderClient.partnerId,
      jsPartnerName: this.data.orderClient.partnerName,
      shAddressId: this.data.orderAddr.addrId,
      jsAddressId: this.data.orderAddr.addrId,
      invoiceInfo:invoiceInfo
    };
    let goodsDetailList = [];
    for (let i = 0; i < this.data.goodsList.length;i++){
      let goods = this.data.goodsList[i];
      if(goods.tmGoodsSkuListCusts==null || goods.tmGoodsSkuListCusts==undefined){
          goodsDetailList.push(goods);
          continue;
      }
      let goodsDetail = {};
      goodsDetail.goodsName = goods.goodsName;
      goodsDetail.goodsImgUrl = goods.tmGoodsSkuListCusts[0].imgUrls;
      goodsDetail.goodsCode = goods.goodsCode;
      goodsDetail.skuCode = goods.tmGoodsSkuListCusts[0].skuCode;
      //goodsDetail.batchNo = goods.
      goodsDetail.unit = goods.tmGoodsSkuListCusts[0].skuUnit;   //计价单位
      goodsDetail.count = goods.excessCnt;      //零数
      goodsDetail.marketPrice = goods.tmGoodsSkuListCusts[0].marketPrice; //市场价
      goodsDetail.discountRatio = goods.realDiscount/100;  //折扣比率
      goodsDetail.realPrice = (goodsDetail.marketPrice * goodsDetail.discountRatio).toFixed(2); //实际价格
      goodsDetail.discountTotal = goodsDetail.marketPrice - goodsDetail.realPrice; // 折扣让利金额(元)
      goodsDetail.realTotal = goods.totalPrice;// 实际总金额(元)
      goodsDetail.packUnit = goods.tmGoodsSkuListCusts[0].packUnit;
      goodsDetail.packMultiple = goods.tmGoodsSkuListCusts[0].packStandards[goodsDetail.packUnit].cnt;// 包装规格(倍数)
      goodsDetail.packCount = goods.packageCnt;// 包装数量
      goodsDetail.packPrice = goods.tmGoodsSkuListCusts[0].packStandards[goodsDetail.packUnit].price;// 包装标价
      goodsDetail.packRealPrice = goodsDetail.packPrice * goodsDetail.discountRatio / 100;// 包装实际售价
      goodsDetail.totalCount = goodsDetail.packCount * goodsDetail.packMultiple + goodsDetail.count
      goodsDetail.ownerUid = this.data.orderClient.ownerUid;
      goodsDetail.goodsType = goods.goodsType;
      goodsDetail.extData = {
        goodsType: Object.keys(JSON.parse(goodsDetail.goodsType))[0]
      }
      goodsDetailList.push(goodsDetail);
    }

    var paramData = {
      ordersReq:orders,
      goodsDetailList:goodsDetailList,
      operate:"edit"
    };
    console.log(paramData);
    request.request('', "sellOrder", "update", paramData,function(resp){
        console.log(resp);
        if(resp.data.success){
          wx.showToast({
            title: '保存成功',
          });
          //wx.removeStorageSync("total");
          //wx.removeStorageSync("cartGoods");
        };
    },null)
  },
  bindChangeRemark:function(e){
    this.setData({remark:e.detail.value});
  },
  calTotalPrice:function(){
    let goodsList = this.data.goodsList;
    let offerTotal = 0;//优惠总金额
    let totalPrice = 0;//总金额(优惠后)
    let realPrice = 0 ;//优惠前总额
    for (let i = 0; i < goodsList.length; i++) {
      let goods = goodsList[i];
      if(goods.skuList==null || goods.skuList==undefined){
        offerTotal += Number(goods.discountTotal); 
        totalPrice += Number(goods.realTotal); 
        realPrice = realPrice+ offerTotal+totalPrice;
      }else{
        let sku = goodsList[i].skuList[0];
        offerTotal += (Number(sku.unitPrice) - sku.realPrice) * (goodsList[i].excessCnt + goodsList[i].packageCnt * sku.skuCnt);   
        totalPrice += Number(goodsList[i].totalPrice); 
        realPrice = realPrice+ offerTotal+totalPrice;
      }
    }


    this.setData({ totalPrice: totalPrice, realPrice:realPrice,offerTotal: offerTotal.toFixed(2)})
  },
  /**
   * 是否需要发票
   */
  bindInvoiceChange:function(e){
    let index  = e.detail.value;
    this.setData({ isInvoiceDeliverIndex:index});
  },
  /**
   * 下单客户
   */
  bindOrderClientChange:function(e){
    let index = e.detail.value;
    let orderClient = this.data.accountClientList[index];
    var accountClientIndex = index;
    var accountClient = orderClient;

    this.setData({
      orderClientIndex: index,
      orderClient: orderClient,
      accountClientIndex:accountClientIndex,
      accountClient:accountClient
    })
    this.getAddrList(null,true);
  },
  /**
   * 改变结算客户
   */
  bindAccountClientChange:function(e){
    var index = e.detail.value;
    //var currentId = this.data.accountClientList[index].id; // 这个id就是选中项的id
    let accountClient = this.data.accountClientList[index];
    this.setData({
      accountClientIndex: e.detail.value,
      accountClient: accountClient
    })

  },
  /**
   * 获取所有合作伙伴资料
   * 经销商: 自己
   * 业务员: 自己名下的经销商
   * 经理: 部门所有的合作伙伴
   */
  getPartnerList:function(xdPartnerId,jsPartnerId,addrId){
    let that = this;
    request.request("", "partnerM","queryByUserType",null,function(res){
      let invoiceInfo = {};
      let accountClientList = res.data.resp;
      let accountClient = res.data.resp[0];
      let orderClient = res.data.resp[0];
      let accountClientIndex = 0;
      let orderClientIndex = 0;

      for (var i = accountClientList.length - 1; i >= 0; i--) {
        var client = accountClientList[i];
        if(client.partnerId == xdPartnerId){
          orderClient = res.data.resp[i];
          orderClientIndex = i;
          break;
        }
      }
      for (var i = accountClientList.length - 1; i >= 0; i--) {
        var client = accountClientList[i];
        if(client.partnerId == jsPartnerId){
          accountClient = res.data.resp[i];
          accountClientIndex = i;
          break;
        }
      }
      that.setData({
        accountClientList:res.data.resp,
        accountClientIndex:accountClientIndex,
        accountClient: accountClient,
        orderClient:orderClient,
        orderClientIndex:orderClientIndex
      })
      that.getAddrList(addrId,false);
    },null)
  },
  /**
   * 获取选中的结算客户的所有收货地址
   */
  getAddrList: function (addrId,isUpdateInvoice) {
    let that = this;
    let partner = this.data.accountClient;
    let req = { partnerId: partner.partnerId};
    request.request("", "addrInfo", "queryByAddrInfo", { req:req }, function (res) {
      let addrList = res.data.resp;
      let addr = res.data.resp[0];
      for (var i = addrList.length - 1; i >= 0; i--) {
        var oneAddr = addrList[i];
        if(oneAddr.addrId == addrId){
          addr = addrList[i];
          break;
        }
      }
      if(addr){
        if(isUpdateInvoice){
          that.updateInvoice(addr);
        }
        that.setData({ orderAddr: addr, addrList: res.data.resp });
      }

    }, null);
  },
  /**
   * 更新发票收货地址
   */
  updateInvoice: function (addr){
    let invoiceInfo = this.data.invoiceInfo;
    if(invoiceInfo == null || invoiceInfo == undefined){
        invoiceInfo = {};
    }

    invoiceInfo.reciveName = addr.name;
    invoiceInfo.reciveTel = addr.mobile;
    invoiceInfo.reciveAddr = addr.addrInfo
    this.setData({ invoiceInfo: invoiceInfo});
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    console.log(pages, prevPage);
  },
  /**
   * 日期
   */
  bindDateChange:function(e){
    this.setData({
      orderDate: e.detail.value
    })
  },
  navToInvoice:function(){
    if(!this.data.isSaleman){
      return;
    }
    wx.navigateTo({
      url: '../invoiceEdit/invoiceEdit',
    })
  },
  deleteGoods:function(e){
    let index = e.target.dataset.index ;
    //todo : 删除商品
    this.data.goodsList.splice(index,1);
    this.setData({
      goodsList: this.data.goodsList
    });
    this.calTotalPrice();
  },
  changeGoods:function(e){
    console.log("1111111111111111")

    let index = e.target.dataset.index ;
    var goods = this.data.goodsList[index]
    this.setData({
      toggleChoose:'on',
      selectedGoods: {
        goods:goods,
        partnerId:this.data.orderClient.partnerId
      }
    })
    
    //this.calTotalPrice();
  },
  clearAll:function(){
    this.setData({
      goodsList:[]
    });
    this.calTotalPrice();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("隐藏");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
      console.log("卸载");
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


  refreshSelect:function(e){
    console.log(e);
    let newGoods = e.detail;

    var isDelete = false;
    if(newGoods.realTotal == 0){
      isDelete = true;
    }

    let goodsList = this.data.goodsList;
    var index = -1;
    for (var i = goodsList.length - 1; i >= 0; i--) {
      let goods = goodsList[i];
      if(newGoods.skuCode == goods.skuCode){
        index = i;
        break;
      }
    }
    if(index > -1){
      if(isDelete){
        this.data.goodsList.splice(index,1);
      }else{
        goodsList[i] = newGoods;
      }
    }
    this.setData({
      goodsList: this.data.goodsList
    });
    this.calTotalPrice();
  },
  refreshDelete:function(e){
    console.log(e)
  }
})