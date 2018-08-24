// pages/itemDetail/itemDetail.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
let wxparse = require("../wxParse/wxParse.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      '../../images/xhl/de01(2).jpg',
      '../../images/xhl/de01(3).jpg',
      '../../images/xhl/de01(8).jpg'
    ],
    toggleChoose: 'off',
    toggleDetail: 'off',
    goods:{},  //仅仅作为数据展示 
    selectedGoods:{}, //实际购买数量以及折扣价格等绑定在此,发送出去的是这个obj
    reqParams:{},
    conponent:{},
    goodsDescs:""
  },

  ifMove:function(e){
    this.setData({
      toggleChoose:e.detail.ifmove
    })
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    let req = {};
    req.goodsCode = options.goodsCode
    this.setData({
      reqParams: req
    });
    this.getGoods();
  },
  /**
   * 获取获取商品列表
   */
  getGoods: function () {
    let req = this.data.reqParams;
    let that = this;
    request.request("goods", "goodsInfo", "queryGoods", { req: req }, function (resp) {
      let result = resp.data.resp.rows[0];
      if (!result) { return; }   //没有结果则退出
      if (result.tmGoodsSkuListCusts) {       
        let skuList = result.tmGoodsSkuListCusts;
        result.skuList = [];
        //遍历规格list
        for (let i = 0; i < skuList.length; i++) { 
          let skuDetail = skuList[i];
          //图片url JSON转化成数组
          skuDetail.imgUrls = skuDetail.imgUrls ? JSON.parse(skuDetail.imgUrls) : [];  
           //各种规则:包装,最小,计价规格信息 JSON 转成obj
          if (typeof skuDetail.packStandards == "string") {     
            skuDetail.packStandards = JSON.parse(skuDetail.packStandards); 
          }
          let skuPriceDetail = {};
          //包装规格包含的商品数量: 例如: (每箱) 100包
          skuPriceDetail.sku = skuDetail.packStandards[skuDetail.packUnit].cnt /
            skuDetail.packStandards[skuDetail.skuUnit].cnt + skuDetail.skuUnit;
          //包装规格价格
          skuPriceDetail.skuPrice = skuDetail.packStandards[skuDetail.packUnit].price;
          //包装规格名字: 箱 , 盒, 袋等
          skuPriceDetail.packUnit = skuDetail.packUnit;
          //计价规格单价
          skuPriceDetail.unitPrice = Number(skuDetail.skuPrice).toFixed(2);
          result.skuList.push(skuPriceDetail);
        }
      }
      that.setData({
        goods: result,
        selectedGoods:result
      })
      //解析html 显示商品详情
      wxparse.wxParse('goodsDescs', 'html', result.goodsBody, that, 5);
    }, null)
  },
  /**
   * 获取购物车信息计算数量以及总价(所有添加的商品)
   */
  getCartInfo: function () {
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
  /**
   * 规格选择组件发出的更新事件
   */
  refreshSelect: function (e) {
    let goods = e.detail.goods;
    goods.packageCnt = e.detail.packageCnt;
    goods.excessCnt = e.detail.excessCnt;
    this.setData({
      selectedGoods:goods
    })
    //如果箱数和零数都为0 则移除该商品
    if (goods.packageCnt == 0 && goods.excessCnt == 0) {
      this.removeFromStorage(goods);
      this.getCartInfo();
      return;
    };
    //保存购物车
    this.saveToStorage(goods);
    //计算总价,总量
    this.getCartInfo();
    //跳结算
    let that = this;
    if(!this.data.addCart){
      that.checkOrder()
    }

  },
  /**
   * 添加商品到购物车并缓存
   */
  saveToStorage: function (goods) {
    let cartGoods = wx.getStorageSync("cartGoods") ?
      wx.getStorageSync("cartGoods") : [];
      //判断是否已有该商品
    let index = "";
    for (let i = 0; i < cartGoods.length; i++) {
      if (cartGoods[i].goodsCode == goods.goodsCode) {
        index = i
      }
    }
    //如果缓存中已有就替换
    if (index !== "") {
      cartGoods.splice(index, 1, goods);
    } else {
      //没有就添加
      cartGoods.push(goods);
    }
    this.setData({ cartGoods: cartGoods });
    wx.setStorageSync("cartGoods", cartGoods);
  },
  /**
   * 点击购买按钮
   */
  buy:function(){
    //判断是否登录,否则直接退出
    if (!util.checkIsLogin()) {
      return;
    };
    this.setData({
      addCart: false
    });
    this.checkOrder();
  },
  checkOrder:function(){
 
    //如果没有选择商品, 则弹出规格选择页面
    let selectedGoods = this.data.selectedGoods;
    if (!selectedGoods.goodsCode ||(!selectedGoods.packageCnt  && !selectedGoods.excessCnt)){
      this.setData({
        toggleChoose:"on",
        selectedGoods: this.checkFromStorage(selectedGoods)   //传递的参数
      })
      return ;
    };
    //点击购买时只会下单当前的商品而不是整个购物车
    let goodsList = [] ;
 
    let goods = {};
    goods.goodsName = selectedGoods.goodsName;
    goods.tmGoodsSkuListCusts = selectedGoods.tmGoodsSkuListCusts;
    goods.goodsCode = selectedGoods.goodsCode;
    goods.excessCnt = selectedGoods.excessCnt;    
    goods.realDiscount = selectedGoods.realDiscount ;  //折扣比率
    goods.totalPrice = selectedGoods.totalPrice;// 实际总金额(元)
    goods.packageCnt = selectedGoods.packageCnt;// 包装数量
    goods.goodsType = selectedGoods.goodsType;
    goods.skuList = selectedGoods.skuList;
    goodsList.push(goods);

    wx.navigateTo({
      url: '../checkOrder/checkOrder?goodsList='+JSON.stringify(goodsList),
    })
  },

  //展示  规格选择弹窗
  chooseToggle:function (e){
    console.log(e.target.dataset.toggle)
    if (!util.checkIsLogin()) {
      return;
    };
    let goods = this.data.goods;
    this.setData({
      toggleChoose: e.target.dataset.toggle,
      selectedGoods: this.checkFromStorage(goods),
      addCart:true
    })
    console.log(this.data.goods);
  },
  /**
   * 将点击的商品传递到规格选择页面
   * 有的可能已经添加过了,有的没有
   * 所以要从缓存中取一遍
   */
  checkFromStorage: function (goods) {
    var value = wx.getStorageSync('cartGoods');
    let user = wx.getStorageSync("user");
    let cartGoods = value ? value : [];
    goods.userId = user.userId;
    goods.packageCnt = 0;
    goods.excessCnt = 0;
    for (let i = 0; i < cartGoods.length; i++) {
      if (cartGoods[i].goodsCode == goods.goodsCode) {
        goods.packageCnt = cartGoods[i].packageCnt;
        goods.excessCnt = cartGoods[i].excessCnt;
        goods.isOrderGoods = cartGoods[i].isOrderGoods;
        goods.isDealer = cartGoods[i].isDealer;
        goods.discount = cartGoods[i].discount;
        goods.realDiscount = cartGoods[i].realDiscount;
        goods.totalPrice = cartGoods[i].totalPrice;
        goods.skuList = cartGoods[i].skuList;
        goods.userId = user.userId;
      }
    }
    return goods;
  },
  /**
   * 商品参数弹窗
   */
  detailToggle:function (e){
    console.log(e);
    this.setData({
      toggleDetail: e.target.dataset.detail,
    })
  },

  scrollTop: function(){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  scrollToDetail: function () {
    wx.pageScrollTo({
      scrollTop: 600,
      duration: 300
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '自定义转发标题',
      path: '/page/user?id=123',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let conponent = this.selectComponent("#chooseSku");
    this.setData({
      conponent: conponent
    })
  },
  //购物车移除某件商品
  removeFromStorage: function (goods) {
    let cacheGoods = wx.getStorageSync("cartGoods");
    let newGoods = [];
    for (let i = 0; i < goods.length; i++) {
      if (cacheGoods[i].goodsCode != goods.goodsCode) {
        newGoods.push(cacheGoods[i]);
      }
    }
    wx.removeStorageSync("cartGoods")
    wx.setStorageSync("cartGoods", newGoods);
  },
  msg: function (msg) {
    wx.showToast({
      title: msg,
    })
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