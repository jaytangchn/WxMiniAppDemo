// pages/chooseSku.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
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

      selectedInfo:{
        type:Object,
        value:{},
        observer:function(e){
          //只有打开弹窗才查询, 如果没有这个判断, 这个对象一改变就会触发查询.
          if (this.data.toggleChoose!="on"){
            return;
          }
          // if(!e.goodsCode||e.goodsCode==this.data.goods.goodsCode){

          // }
          let req = {
            goodsCode: e.goodsCode
          }
          let that = this;
          request.request("goods", "goodsInfo", "queryGoods", { req: req }, function (resp) {
            let result = resp.data.resp.rows[0];
            console.log("choosesku querygoods");
            if (result.tmGoodsSkuListCusts) {
              let skuList = result.tmGoodsSkuListCusts;
              result.skuList = [];
              for (let i = 0; i < skuList.length; i++) {
                let skuDetail = skuList[i];
                //图片url JSON转化成数组
                skuDetail.imgUrls = skuDetail.imgUrls? JSON.parse(skuDetail.imgUrls):[];
                //各种规则:包装,最小,计价规格信息 JSON 转成obj
                if (typeof skuDetail.packStandards == "string") {
                  skuDetail.packStandards = JSON.parse(skuDetail.packStandards);
                }
                //每种包装规格的信息
                let skuPriceDetail = {};
                //包装规格包含的商品数量: 例如: (每箱) 100包
                skuPriceDetail.sku = skuDetail.packStandards[skuDetail.packUnit].cnt /
                  skuDetail.packStandards[skuDetail.skuUnit].cnt + skuDetail.skuUnit;
                //包装规格价格
                skuPriceDetail.skuPrice = skuDetail.packStandards[skuDetail.packUnit].price;
                skuPriceDetail.skuCnt = skuDetail.packStandards[skuDetail.packUnit].cnt /
                  skuDetail.packStandards[skuDetail.skuUnit].cnt;
                 //包装规格名字: 箱 , 盒, 袋等
                skuPriceDetail.packUnit = skuDetail.packUnit;
                //计价规格单价
                skuPriceDetail.unitPrice = Number(skuDetail.skuPrice).toFixed(2);
                result.skuList.push(skuPriceDetail);
              }
              let goodsCache = that.checkFromStorage(result);
              that.setData({
                goods: goodsCache,
                packageCnt: goodsCache.packageCnt,
                excessCnt: goodsCache.excessCnt
              })
            }
            //如果没有登录
            if (!app.globalData.isLogin){
              let goods = that.data.goods;
              goods.isOrderGoods =  false;
              //无合同折扣
              goods.discount = "100";
              //实际无折扣
              goods.realDiscount = "100";
              let sku = goods.skuList[0];
              sku.realPrice = sku.unitPrice;
              goods.skuList[0] = sku;
              goods.isDealer = true;
              if (goods.tmGoodsSkuListCusts[0].tmGoodsInventoryListCustList.length < 1) {
                goods.isSale = false;
                //that.showErroeToast("该商品暂无库存");
              } else {
                goods.isSale = true;
              }
              that.setData({
                goods: goods
              })
              that.calTotalPrice();
              return ;
            }else{
              let roleType = util.checkRole();
              //经销商 只有合同折扣
              if(roleType=="1"){
                //获取合同折扣信息
                request.request("", "partnerM", "getDiscountBySkuCode", { skuCode: e.goodsCode }, function (resp) {
                  let discount = resp.data.resp.goodsDiscountDetailCust;
                  let goods = that.data.goods;
                  goods.isOrderGoods = discount ? true : false;
                  goods.discount = goods.isOrderGoods ? discount.discountRatio : '100'
                  goods.realDiscount = goods.discount;
                  goods.isDealer = true;
                  let sku = goods.skuList[0];
                  sku.realPrice = goods.isOrderGoods ? discount.contractPrice : sku.unitPrice;
                  goods.skuList[0] = sku;
                  if (goods.tmGoodsSkuListCusts[0].tmGoodsInventoryListCustList.length < 1) {
                    goods.isSale = false;
                    //that.showErroeToast("该商品暂无库存");
                  } else {
                    goods.isSale = true;
                  }
                  that.setData({
                    goods: goods
                  })
                  that.calTotalPrice();
                }, null)
              }else{
                let goods = that.data.goods;
                goods.isOrderGoods = true;
                if (goods.tmGoodsSkuListCusts[0].tmGoodsInventoryListCustList.length<1){
                  goods.isSale = false;
                  //that.showErroeToast("该商品暂无库存");
                }else{
                  goods.isSale = true;
                }
                goods.isDealer = false;
                goods.discount = goods.discount ? goods.discount: 100;
                goods.realDiscount = goods.realDiscount ?goods.realDiscount:goods.discount;
                let sku = goods.skuList[0];
                sku.realPrice =  sku.unitPrice*goods.realDiscount/100;
                goods.skuList[0] = sku;
                that.setData({
                  goods: goods
                });
                that.calTotalPrice();
              }
            }
          }, null)
        }
      }

  },

  /**
   * 组件的初始数据
   */
  data: {
    reqParams: {},
    packageCnt:0,
    excessCnt:0,
    goods:{}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    coverHide:function(){
      this.setData({
        toggleChoose:"off"
      });
      var ifmove = this.data.toggleChoose;
      var ifPara = { ifmove: ifmove };
      this.triggerEvent('ifMoveEvent', ifPara)
    },
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
          goods.skuList = cartGoods[i].skuList;
          goods.totalPrice = cartGoods[i].totalPrice;
          goods.userId = user.userId;
        }
      }
      return goods;
    },
    showErroeToast: function (msg) {
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 3000
      })
    },
    delete:function(){
      this.setData({
        packageCnt:0,
        excessCnt:0
      })
      this.calTotalPrice();
      this.changeEmit();
    },
    deleteEmit:function(){
      var myEventDetail = this.data // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('deleteEvent', myEventDetail, myEventOption)
    },
    /**
     * 改变选择时触发
     */
    changeEmit:function(){
      var myEventDetail = this.data // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      let goods = this.data.goods;
      goods.packageCnt = this.data.packageCnt;
      goods.excessCnt = this.data.excessCnt;
      this.setData({ goods: goods})
      this.triggerEvent('changeEvent', myEventDetail, myEventOption)
    },
    /**
     * 自定义实际折扣
     */
    inputRealDiscount:function(e){
      let discount = e.detail.value;
      if(discount>100){
        discount=100;
      }
      if(discount<0 || discount===0){
        discount=0.1
      }
      let goods = this.data.goods;
      goods.realDiscount = discount;
      goods.skuList[0].realPrice = goods.skuList[0].unitPrice * goods.realDiscount / 100;
      this.setData({
        goods:goods 
      })
      this.calTotalPrice();
    },
    //计算规格价格和总价
    calTotalPrice: function () {
      let goods = this.data.goods;
      let data = this.data;
      goods.totalPrice = (data.packageCnt * Number(data.goods.skuList[0].skuCnt) + data.excessCnt) * Number(data.goods.skuList[0].realPrice);
      goods.totalPrice = goods.totalPrice.toFixed(2)
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
      //箱数-
      if (type == "package-" && packageCnt > 0) {
        packageCnt--;
      }
      //箱数+
      if (type == "package+") {
        packageCnt++;
      }
      //零数-
      if (type == "excess-" && excessCnt > 0) {
        excessCnt--;
      }
      //零数+
      if (type == "excess+") {
        excessCnt++;
      }
      if (type == "excessInput") {
        excessCnt = Number(e.detail.value);
      }
      if (type == "packageInput") {
        packageCnt = Number(e.detail.value);
      }
      this.setData({
        excessCnt: excessCnt,
        packageCnt: packageCnt
      })
      this.calTotalPrice();
    },
    /**
     * 库存提醒
     */
    checkStorage:function(){
      //如果数目为0 则不用校验库存
      if (this.data.excessCnt<1 && this.data.packageCnt<0){
        return false;
      }
      let goods = this.data.goods;
      let totalFlag = goods.totalPrice > 0 ? true : false;   //是否购买了商品,通过总价判断
      let checkStorageFlag = util.checkRole() == "1" ? false : true; //经销商身份判断
      let storageFlag = false;
      if (goods.tmGoodsSkuListCusts.length < 1 && totalFlag && checkStorageFlag) {
        storageFlag=true;
      } else {
        let skus = this.data.goods.tmGoodsSkuListCusts;
        for (let i = 0; i < skus.length; i++) {
          let sku = skus[i];
          if (sku.tmGoodsInventoryListCustList.length < 1 && totalFlag && checkStorageFlag) {
            storageFlag = true;
          } else {
            let storage = sku.tmGoodsInventoryListCustList;
            let elseFlag = false; //是否有库存  默认没有
            for (let j = 0; j < storage.length; j++) {
              if (storage[j].inventoryCount > 1) {
                elseFlag = true;
              }
            }
            if (elseFlag && totalFlag && checkStorageFlag) {
              storageFlag = true;
            }
          }
        }
      }
      return storageFlag;
    },
    /**
     * 隐藏该页面
     */
    chooseToggle:function(e){

      let goods = this.data.goods;
      this.setData({
        toggleChoose: e.target.dataset.toggle
      })
      var ifmove = this.data.toggleChoose;
      var ifPara = { ifmove: ifmove };
      this.triggerEvent('ifMoveEvent', ifPara);
      //如果没有库存 延迟一秒展示提醒 然后继续执行
      if(this.checkStorage()){
        this.showErroeToast("该商品没有库存");
        let that = this;
        setTimeout(function () {
          that.changeEmit();
        }, 1000);
        return ;
      }
      this.changeEmit();
    },
    close:function(e){
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
  ready:function(){
  }
})
