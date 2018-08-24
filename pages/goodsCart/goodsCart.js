// pages/goodsCart/goodsCart.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function(e) {
        this.getTotal()
      }
    },
    toggleChoose: {
      type: Object,
      value: "",
      observer: function(e) {
        this.getTotal()
      }
    },
    cartGoods: {
      type: Object,
      value: {},
      observer: function(e) {
        this.getTotal()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    cover:false,
    goodsList: {},
    total: {}
  },
 

  /**
   * 组件的方法列表
   */
  methods: {
    coverHide: function () {
      this.goWait()
    },
    getTotal: function() {
      let goodsList = wx.getStorageSync("cartGoods");
      let total = wx.getStorageSync("total");
      this.setData({
        goodsList: goodsList,
        total: total
      })
    },
    goWait: function() {
      this.setData({
        show: false
      });
      var ifmove = true;
      var ifshow = {
        ifmove: ifmove
      }
      this.triggerEvent('ifmoveEvent', ifshow)
    },
    //展开产品选择页面
    edit: function(e) {
      let goods = {};
      // this.setData({show:false})
      let goodsList = wx.getStorageSync("cartGoods");
      goods = goodsList[e.target.dataset.index];
      var myEventDetail = {
        goods: goods
      } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('showGoodsSelectEvent', myEventDetail, myEventOption)
    },
    //清空购物车
    clear: function(e) {
      wx.removeStorageSync("cartGoods");
      wx.removeStorageSync("total");
      this.getTotal()

      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('refreshTotalEvent', myEventDetail, myEventOption)
    },
    /**
     * 下单
     */
    order: function(e) {
      if (!util.checkIsLogin()) {
        return;
      };
      let goodsList = wx.getStorageSync('cartGoods');
      if (goodsList.length < 1) {
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
        goods.realDiscount = selectedGoods.realDiscount; //折扣比率
        goods.totalPrice = selectedGoods.totalPrice; // 实际总金额(元)
        goods.packageCnt = selectedGoods.packageCnt; // 包装数量
        goods.goodsType = selectedGoods.goodsType;
        goods.skuList = selectedGoods.skuList;
        resultGoodsList.push(goods);
      }
      wx.navigateTo({
        url: '../checkOrder/checkOrder?goodsList=' + JSON.stringify(resultGoodsList),
      })
    },
  },
  ready: function() {


  }
})