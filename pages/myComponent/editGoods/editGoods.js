// pages/myComponent/editGoods/editGoods.js
// pages/chooseSku.js
const request = require("../../../utils/request.js");
const dateUtil = require("../../../utils/dateUtil.js");
const util = require("../../../utils/util.js");
const app = getApp();
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    toggleChoose: String,
    selectedInfo: {
      type: Object,
      value: {},
      observer: function (e) {
        var that = this;
        if(!e.goods){
          return;
        }

        var goods = e.goods;
        this.data.partnerId = e.partnerId;

        goods.defaultDiscount = '1'
        this.setData({
          goods: goods
        })

        var req = {
          skuCode:e.goods.skuCode,
          partnerId:e.partnerId
        }
        //获取合同折扣信息
        request.request("", "partnerM", "getDiscountBySkuCodeAndPartnerId",req, function (resp) {
          let discount = resp.data.resp.goodsDiscountDetailCust;
          goods.defaultDiscount = discount ? discount.discountRatio/100 : '1'
          that.setData({
            goods: goods
          })
        }, null);


        //角色
        var roleList = wx.getStorageSync("roleList");
        for (var i = roleList.length - 1; i >= 0; i--) {
          var role = roleList[i];
          if(role.roleTypeCode == 'role_type.salesman'){
            that.setData({
              isSaleman: true
            })
          }
        }
      }   
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    reqParams: {},
    packageCnt: 0,
    excessCnt: 0,
    goods: {},
    isSaleman :false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    coverHide:function (){
      this.setData({
        toggleChoose: false
      })
    },
    showErroeToast: function (msg) {
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 3000
      })
    },
    delete: function () {
      let goods = this.data.goods;
      goods.totalCount = 0;
      goods.packCount = 0;
      goods.count = 0;
      goods.realTotal = 0;

      this.setData({
        toggleChoose: "off"
      })
      this.changeEmit();
    },
    deleteEmit: function () {
      var myEventDetail = this.data // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('deleteEvent', myEventDetail, myEventOption)
    },
    /**
     * 改变选择时触发
     */
    changeEmit: function () {
      let goods = this.data.goods;
      var myEventDetail = goods; // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('changeEvent', myEventDetail, myEventOption)
    },
    /**
     * 自定义实际折扣
     */
    inputRealDiscount: function (e) {
      let discount = e.detail.value;
      if (discount > 100) {
        discount = 100;
      }
      if (discount < 0 || discount === 0) {
        discount = 0.1
      }
      let goods = this.data.goods;
      goods.discountRatio = discount/100;
      goods.realPrice = goods.marketPrice*goods.discountRatio;
      this.calTotalPrice();
      this.setData({
        goods: goods
      })
    },

    calTotalCount: function() {
      var goods = this.data.goods;
      goods.totalCount = goods.packCount*goods.packMultiple+goods.count;
      goods.totalCount = goods.totalCount.toFixed(2)
    },
    //计算规格价格和总价
    calTotalPrice: function () {
      let goods = this.data.goods;
      goods.realTotal = goods.totalCount*goods.realPrice;
      goods.realTotal = goods.realTotal.toFixed(2)
      this.setData({ goods: goods });
    },
    /**
     * 订货数量加减
     */
    changeShoppingCnt: function (e) {
      //将002, 000之类的输入值转化成number;
      let type = e.currentTarget.dataset.type;
      let packageCnt = this.data.packageCnt;
      let excessCnt = this.data.excessCnt;

      var goods = this.data.goods;
      //箱数-
      if (type == "package-" && goods.packCount > 0) {
        goods.packCount -= 1;
      }
      //箱数+
      if (type == "package+") {
        goods.packCount += 1;
      }
      //零数-
      if (type == "excess-" && goods.count > 0) {
        goods.count -= 1;
      }
      //零数+
      if (type == "excess+") {
        goods.count += 1;
      }
      if (type == "excessInput") {
        goods.count = Number(e.detail.value);
      }
      if (type == "packageInput") {
        goods.packCount = Number(e.detail.value);
      }
      this.calTotalCount();
      this.calTotalPrice();
      this.setData({
        goods:goods
      })
    },
    /**
     * 隐藏该页面
     */
    chooseToggle: function (e) {
      //todo: 商品库存判断
      console.log(this.data.goods);
      let goods = this.data.goods;
      
      this.setData({
        toggleChoose: e.target.dataset.toggle
      })
      this.changeEmit();
    },
    close: function (e) {
      this.setData({
        toggleChoose: "off"
      })
    }
  },
  /**
   * 生命周期函数: 在组件实例进入页面节点树时执行
   */
  attached: function () {

  },
  /**
   * 加载完成
   */
  ready: function () {
  }
})
