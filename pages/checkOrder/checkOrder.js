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
    orderDate:"",
    index:0,
    roleType:"",
    remark:"",
    addrList:[],   //所有的收货地址
    orderAddr:{} , //商品收货地址
    accountClientList:[],//结算客户list
    // accountClientIndex:0,//选中的结算客户index
    // accountClient:{},//选中的收货地址
    orderClientIndex:0,
    orderClient:{},
    isInvoiceDeliver:['无需发票','发票随货','发票不随货'],
    isInvoiceDeliverIndex:2,
    invoiceInfo:{},//发票信息
    goodsList:[],
    total:{},
    offerTotal:"",
    totalPrice:"",
    realPrice:""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let roleType = util.checkRole();
    //let orderClientIndex = roleType=="1"?1:0;  //经销商默认选中自己, 业务员不能默认
    //this.setData({ orderClientIndex: orderClientIndex});

    let total = wx.getStorageSync("total");
    let orderDate = dateUtil.formatDateByTs(new Date().getTime()+24*3600*1000)
    this.setData({ roleType: roleType, orderDate: orderDate, goodsList: JSON.parse(options.goodsList)});
 
    this.getPartnerList();
    this.calTotalPrice();
  },
  showErroeToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
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
   * 
   */
  saveOrder:function(e){
    if (!this.data.orderClient || !this.data.orderClient.partnerId) {
      this.showErroeToast("请选择结算客户");
      return;
    }
    // if (!this.data.orderAddr.addrId) {
    //   this.showErroeToast("请填写收货信息");
    //   return;
    // }
    if (this.data.goodsList.length < 1) {
      this.showErroeToast("商品不能为空");
      return;
    }
    let orders = {};
    orders.status ="drp_orders_status.sale_draft";
    this.sendData(orders);
  },
  /**
   * 提交订单
   */
  submitOrder:function(e){
    if (!this.data.orderClient || !this.data.orderClient.partnerId){
        this.showErroeToast("请选择结算客户");
        return ;
    }
    // if (!this.data.orderAddr.addrId) {
    //   this.showErroeToast("请填写收货信息");
    //   return;
    // }
    if (this.data.goodsList.length<1) {
      this.showErroeToast("商品不能为空");
      return;
    }
    let orders = {};
    this.sendData(orders);
  },
  sendData:function(orders){
    orders.ownerUid = this.data.orderClient.ownerUid;   //同下单人的所属人
    orders.ordersDate = this.data.orderDate;
    orders.partnerId = this.data.orderClient.partnerId;
    orders.remark = this.data.remark;
    orders.ordersSettleMoney = this.data.totalPrice;
    orders.goodsMoney = this.data.realPrice;
    orders.partnerChangeMoney = (0 - this.data.totalPrice);
    //发票信息
    let invoiceInfo = this.data.invoiceInfo;
    if (this.data.isInvoiceDeliverIndex == "0") {
      invoiceInfo = null;
    } else if (this.data.isInvoiceDeliverIndex == "1") {
      invoiceInfo.deliverType = "1";         //随货
    } else if (this.data.isInvoiceDeliverIndex == "2") {
      invoiceInfo.deliverType = "2";        //单独
    }
    orders.extData = {
      xdPartnerId: this.data.orderClient.partnerId,
      xdPartnerName: this.data.orderClient.partnerName,
      jsPartnerId: this.data.orderClient.partnerId,
      jsPartnerName: this.data.orderClient.partnerName,
      shAddressId: this.data.orderAddr.addrId,
      jsAddressId: this.data.orderAddr.addrId,
      invoiceInfo: invoiceInfo
    };
    let goodsDetailList = [];
    for (let i = 0; i < this.data.goodsList.length; i++) {
      let goods = this.data.goodsList[i];
      let goodsDetail = {};
      goodsDetail.goodsName = goods.goodsName;
      goodsDetail.goodsImgUrl = goods.tmGoodsSkuListCusts[0].imgUrls;
      goodsDetail.goodsCode = goods.goodsCode;
      goodsDetail.skuCode = goods.tmGoodsSkuListCusts[0].skuCode;
      //goodsDetail.batchNo = goods.tmGoodsSkuListCusts[0].tmGoodsInventoryListCustList[0].batchNo
      //goodsDetail.batchNo = goods.
      goodsDetail.unit = goods.tmGoodsSkuListCusts[0].skuUnit;   //计价单位
      goodsDetail.count = goods.excessCnt;      //零数
      goodsDetail.marketPrice = goods.tmGoodsSkuListCusts[0].marketPrice; //市场价
      goodsDetail.discountRatio = goods.realDiscount / 100;  //折扣比率
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
        goodsType: Object.keys(JSON.parse(goodsDetail.goodsType))[0],
        // mnemonics: goodsDetail.tmGoodsSkuListCusts[0].mnemonics,
        // skuBarcode: goodsDetail.tmGoodsSkuListCusts[0].skuBarcode
      }
      goodsDetailList.push(goodsDetail);
    }
    request.request('', "sellOrder", "save", { ordersReq: orders, goodsDetailList: goodsDetailList }, function (resp) {
      console.log(resp);
      if (resp.data.success) {
        wx.showToast({
          title: '提交成功',
        });
        wx.removeStorageSync("total");
        wx.removeStorageSync("cartGoods");
        setTimeout(function () {
          wx.switchTab({
            url: '../index/index',
          })
        }, 1500)
      };
    }, null)
  },
  bindChangeRemark:function(e){
    this.setData({remark:e.detail.value});
  },
  deleteGoods:function(e){
    let index = e.target.dataset.index;
    let goodsList = this.data.goodsList;
    let cacheList=[];
    for(let i=0;i<goodsList.length;i++){
      if(i!= index){
        cacheList.push(goodsList[i]);
      }
    }
    this.setData({ goodsList: cacheList});
    wx.setStorageSync("cartGoods", cacheList)
    this.calTotalPrice();
    this.calTotalCount();
  },
  calTotalCount: function () {
    let goodsList = wx.getStorageSync("cartGoods");
    let total = {};
    //包装规格数量
    total.packageCnt = 0;
    //散货数量
    total.excessCnt = 0;
    //总价
    total.price = 0;
    //总数(计价规格数量)
    total.cnt = 0;
    for (let i = 0; i < goodsList.length; i++) {
      total.packageCnt += goodsList[i].packageCnt;
      total.excessCnt += goodsList[i].excessCnt;
      total.price += Number(goodsList[i].totalPrice);
      total.cnt += (goodsList[i].packageCnt * goodsList[i].skuList[0].skuCnt) + total.excessCnt
    }
    this.setData({
      total: total,
    })
    wx.setStorageSync("total", this.data.total)
  },
  calTotalPrice:function(){
    let goodsList = this.data.goodsList;
    let offerTotal = 0;//优惠总金额
    let totalPrice = 0;//总金额(优惠后)
    let realPrice = 0 ;//优惠前总额
    for (let i = 0; i < goodsList.length; i++) {
      let sku = goodsList[i].skuList[0];
      offerTotal += (Number(sku.unitPrice) - sku.realPrice) * (goodsList[i].excessCnt + goodsList[i].packageCnt * sku.skuCnt);   
      totalPrice += Number(goodsList[i].totalPrice); 
      realPrice = realPrice+ offerTotal+totalPrice;
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
   * 结算客户
   */
  bindOrderClientChange:function(e){
    let index = e.detail.value;
    if (index == 0 && this.data.roleType == "1"){
      return;
    }
    let orderClient = this.data.accountClientList[index];
    this.setData({
      orderClientIndex: index,
      orderClient: orderClient
    })
    this.getAddrList();
  },
  /**
   * 获取所有合作伙伴资料
   * 经销商: 自己
   * 业务员: 自己名下的经销商
   * 经理: 部门所有的合作伙伴
   */
  getPartnerList:function(){
    let that = this;
    request.request("", "partnerM","queryByUserType",null,function(res){
      let invoiceInfo = {};
      let clientList = that.data.roleType == "1" ? []: [{ partnerName: "请选择" }];
      for (let i = 0; i < res.data.resp.length; i++) {
        clientList.push(res.data.resp[i]);
      }
      let orderClient = that.data.roleType == "1" ? clientList[0] : null;
      if(orderClient!=null){
        invoiceInfo.invoiceTitle = orderClient.partnerName; // 发票抬头
        invoiceInfo.taxNo = orderClient.taxNo; //税号
        invoiceInfo.bankName = orderClient.bankName; //开户银行
        invoiceInfo.bankNo = orderClient.bankNo; //银行账户
        invoiceInfo.isPersonal = "0"; //发票类型: 公司开票
        invoiceInfo.isCommonInvoice = "1"; //是否是普通发票
        invoiceInfo.isPaperInvoice = "1"; //是否是纸质发票
      }


      that.setData({
        accountClientList: clientList,
        orderClient: orderClient,
        invoiceInfo:invoiceInfo
      })
      if(that.data.roleType == "1"){
        that.getAddrList();
      }
    },null)
  },
  /**
   * 获取选中的结算客户的所有收货地址
   */
  getAddrList: function () {
    let that = this;
    let partner = this.data.orderClient;
    let req = { partnerId: partner.partnerId};
    request.request("", "addrInfo", "queryByAddrInfo", { req:req }, function (res) {
      let addr = null;
      let addrList = [];
      if(res.data.resp.length<1){
        //that.showErroeToast("");
        console.log("该用户没有收货地址");
        addr = null;
      }else{
        addr = res.data.resp[0];
        addrList = res.data.resp;
      }
      that.updateInvoice(addr);
      that.setData({ orderAddr: addr, addrList: addrList});
      

    }, null);
  },
  /**
   * 更新发票收货地址
   */
  updateInvoice: function (addr){

    let invoiceInfo = this.data.invoiceInfo;
    let orderClient = this.data.orderClient;
    invoiceInfo.invoiceTitle = orderClient.partnerName; // 发票抬头
    invoiceInfo.taxNo = orderClient.taxNo; //税号
    invoiceInfo.bankName = orderClient.bankName; //开户银行
    invoiceInfo.bankNo = orderClient.bankNo; //银行账户
    if (addr != null) {
      invoiceInfo.addrId = addr.addrId;
      invoiceInfo.reciveName = addr.name;
      invoiceInfo.reciveTel = addr.mobile;
      invoiceInfo.reciveAddr = addr.addrInfo
    }else{
      invoiceInfo.addrId = null;
      invoiceInfo.reciveName = null;
      invoiceInfo.reciveTel = null;
      invoiceInfo.reciveAddr = null
    }

    this.setData({ invoiceInfo: invoiceInfo});
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    let currentRole = this.data.roleType;
    if(currentRole=="1"){
      return;
    }
    wx.navigateTo({
      url: '../invoiceEdit/invoiceEdit',
    })
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
  
  }
})