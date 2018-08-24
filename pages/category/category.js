const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    randomNumber:0,
    cartGoods:[],
    sourceFrom:"",    //上一个页面的来源
    listid:0,     //选中的类别index
    height:0,       //滚动的行高
    goodsCategorties: [], //产品类别中文 list
    goodsList:[], // 产品列表
    reqParams:{}, //请求参数
    goodsCategortiesList:[], // 产品类别详细信息 list
    isAllGoods:false, //商品是否已经加载完所有
    show:false,   //是否弹出购物车
    toggleChoose:"off",  //是否弹出商品规格页面
    total:{}, // 购物车信息
    selectedGoods:{},
    ifmove:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.doOptions(options);
    this.getAllCategorties(options);
   
  },
  /**
   * 获取购物车信息计算数量以及总价(所有添加的商品)
   */
  getCartInfo:function(){
    let goodsList = wx.getStorageSync("cartGoods");
    let total = {};
    total.packageCnt = 0;
    total.excessCnt = 0;
    total.price = 0;
    total.cnt = 0;
    for (let i = 0; i < goodsList.length; i++) {
      total.packageCnt += goodsList[i].packageCnt;
      total.excessCnt += goodsList[i].excessCnt;
      total.price += Number(goodsList[i].totalPrice);
      total.cnt += ((goodsList[i].packageCnt * goodsList[i].skuList[0].skuCnt) + goodsList[i].excessCnt)
    }
    this.setData({
      total: total,
    })
    wx.setStorageSync("total", this.data.total)
  },

  refreshDelete:function(e){
    let randomNumber = Math.random(1)
    this.setData({ randomNumber: randomNumber });
  },

  refreshSelect:function(e){
    let goods = e.detail.goods;
    goods.packageCnt = e.detail.packageCnt;
    goods.excessCnt = e.detail.excessCnt;
    if (goods.packageCnt == 0 && goods.excessCnt == 0) {
      this.removeFromStorage(goods);
      this.setData({
        cartGoods: wx.getStorageSync("cartGoods")
      })
      this.getCartInfo();
      return;
    }
    this.saveToStorage(goods);
    this.getCartInfo();
  },

  /**
   * 从购物车缓存中移除指定商品
   */
  removeFromStorage:function(goods){
    let cacheGoods = wx.getStorageSync("cartGoods");
    let newGoods = [];
    for (let i = 0; i < cacheGoods.length; i++) {
      console.log(cacheGoods[i].goodsCode !== goods.goodsCode);
      if (cacheGoods[i].goodsCode !== goods.goodsCode) {
        newGoods.push(cacheGoods[i]);
      }
    }
    wx.removeStorageSync("cartGoods")
    wx.setStorageSync("cartGoods", newGoods);
  },
  /**
   * 保存到购物车缓存
   */
  saveToStorage:function(goods){
    let cartGoods = wx.getStorageSync("cartGoods")?
      wx.getStorageSync("cartGoods"):[];
    let index = "";
    for(let i=0;i<cartGoods.length;i++){
      if (cartGoods[i].goodsCode == goods.goodsCode) {
          index=i 
      }
    }
    //如果缓存中已有就替换
    if(index !== ""){
      cartGoods.splice(index,1,goods);
    }else {
      //没有就添加
      cartGoods.push(goods);
    }
    wx.setStorageSync("cartGoods", cartGoods);
    this.setData({ cartGoods: cartGoods});

  },




  /**
   * 结算
   */
  order:function(e){
    if (!util.checkIsLogin()) {
      return;
    };
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
      goods.goodsType = selectedGoods.goodsType;
      goods.skuList = selectedGoods.skuList;
      resultGoodsList.push(goods);
    }
    wx.navigateTo({
      url: '../checkOrder/checkOrder?goodsList=' + JSON.stringify(resultGoodsList),
    })
  },
  /**
   * 添加到购物车
   */
  addCart:function(e){
    if (!util.checkIsLogin()) {
      return;
    };
    let goods = this.data.goodsList[e.target.dataset.index] ;
    //如果已经点开了购物车,让购物车隐藏,这样改变值以便触发刷新购物车操作
    this.setData({
      show:false,
      toggleChoose:'on',
      selectedGoods: this.checkFromStorage(goods)
    })
  },
  /**
   * 从缓存中取购物车的信息
   */
  checkFromStorage: function (goods){
    var value = wx.getStorageSync('cartGoods');
    let user = wx.getStorageSync("user");
    let cartGoods = value ? value : [];
    goods.userId = user.userId;
    goods.packageCnt = 0;
    goods.excessCnt = 0;
    for (let i = 0; i < cartGoods.length; i++) {
      if (cartGoods[i].goodsCode == goods.goodsCode){
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
   * 跳转到详情页面
   */
  gotoDetail:function(e){
    console.log(e.currentTarget.dataset.code);
    wx.navigateTo({
      url: '../itemDetail/itemDetail?goodsCode='+e.currentTarget.dataset.code,

    })
    this.setData({
      show: false,
      toggleChoose: "off"
    })
  },
  refreshTotal:function(e){
    this.getCartInfo();
  },
  showGoodsSelect:function(e){
      this.setData({
        toggleChoose:"on",
        selectedGoods:e.detail.goods
      })
  },
  showErroeToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 3000
    })
  },
  /**
   * 获取获取商品列表
   */
  getGoods:function(){
      //从服务器获取商品
      let req = this.data.reqParams;
      let that = this;
      request.request("goods", "goodsInfo","queryGoods",{req:req},function(resp){
        let result = resp.data.resp.rows;
        if(result.length<1){
          that.showErroeToast("没有商品");
          return;
        }
        for(let i=0;i<result.length;i++){
          let imgUrls = result[i].tmGoodsSkuListCusts[0].imgUrls;
          result[i].imgUrl = imgUrls && JSON.parse(imgUrls).length>0 ? JSON.parse(imgUrls)[0].url:"";
        }
        that.setData({
          goodsList:result
        });
        //设置适合的触发滚动的高度
        //let height = that.data.goodsList.length > 9 ? (9 * 113) : (that.data.goodsList.length * 114);
        let height = 1000;
        that.setData({
          height:height,
          isAllGoods: that.data.goodsList.length == resp.data.resp.total ? true : false,
        })
      },null)
          
  },
  /**
   * 获取所有的商品分类[中文名]
   */
  getAllCategorties: function (options) {
    let that = this;
    request.request("goods", "goodsInfo", "queryGoodsType", null, function (resp) {
      console.log(resp);
      let goodsCategorties = ["全部商品"];
      for (let i = 0; i < resp.data.resp.length; i++) {
        goodsCategorties.push(resp.data.resp[i].name);
      }
      that.getGoods();
      that.setData({
        goodsCategorties: goodsCategorties,
        goodsCategortiesList: resp.data.resp
      })
      //定位到搜索页面选定的类别
      let goodsCategortiesList = that.data.goodsCategortiesList;
      for (let i = 0; i < goodsCategortiesList.length; i++) {
        if (options.typeCode == goodsCategortiesList[i].code) {
          that.setData({
            listid : i + 1
          })
        }
      }
    }, null)
  },
  lookCar: function (e) {
    if (!util.checkIsLogin()) {
      return;
    };
    this.setData({
      show: true,
      ifmove:false
    })
  },
  ifmove:function (e){
    this.setData({
      ifmove:e.detail.ifmove
    })
  },
  /**
 * 处理url参数
 */
  doOptions: function (options) {
    let params = {};
    params.goodsTypeCode = options.typeCode;
    params.dim = options.keyWord;
    params.pageSize = 10;
    params.pageNum = 1;
    params.isOnline = "Y";
    this.setData({
      reqParams: params,
      sourceFrom: options.sourceFrom,
    })
  },
  /**
 * 搜索框
 */
  navSearch: function () {
    //如果曾经点击过搜索框,则再次点击就是回退,搜索页面数据会保留
    if (this.data.sourceFrom == "search") {
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.navigateTo({
        url: '../search/search?from=goods',
      })
    }
  },
  /**
 * 滚动调到底部时,
 * 即触发翻页操作
 */
  lowerEvent: function (e) {
    if (this.data.isAllGoods) {
      console.log("已加载所有");
      return;
    }
    let params = this.data.reqParams;
    params.pageSize += 10;
    this.setData({ reqParams: params });
    this.getGoods();
  },
  /**
   * 切换类别
   */
  navTab: function (e) {
    //分类list 的index 需要 -1 
    this.setData({
      listid: e.target.dataset.listsid
    })
    let typeCode = e.target.dataset.listsid == 0 ?
      "GOODS_TYPE.04" : this.data.goodsCategortiesList[e.target.dataset.listsid - 1].code;
    let params = {};
    params.goodsTypeCode = typeCode
    params.pageSize = 10;
    params.pageNum = 1;
    params.isOnline= "Y";
    this.setData({
      reqParams: params,  //重置搜索条件
      goodsList: [],     //清空原有的商品list
    });
    this.getGoods();
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
    this.getCartInfo();
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