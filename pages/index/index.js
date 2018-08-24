//index.js
//获取应用实例
const app = getApp()
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
Page({
  data: {
    isBar:true,
    banner: {},     //模板1的数据
    typelist: {},    //模板2数据
    list: {},   //模板3数据
  },
  /**
   * 跳转到广告页面
   */
  turnToAd:function(option){
    let item = option.target.dataset.item;
    if(!item.pageUrl){
      return ;
    }
    if(item.extDataMap.advType=="goodsAdv"){
      //内部商品详情
     wx.navigateTo({
       url: '../itemDetail/itemDetail?goodsCode='+item.pageUrl,
     })
    }
    //外部链接: 必须要有http:// 或htpps:// 开头
    if (item.extDataMap.advType =="imageAdv"){
       wx.navigateTo({
         url: '../web/web?url='+item.pageUrl,
       })
    }
    console.log(option);
  },
  onLoad: function () {
   
  },
  onShow:function(){
    this.getPageTemplate();
  },
  /**
   * 获取该页面的所有模板
   */
  getPageTemplate:function(){
    let that = this;
    let req = {
      clientType:"wx_app",
      ownerPageCode:"drp_wx_home"
    }
    request.request("", "programTemplate","queryProgram",{req:req},function(resp){
      let data = resp.data.resp;
      that.getTemplate(data);
        console.log(resp);
    },null)
  },
  getTemplate:function(list){
      for(let i=0;i<list.length;i++){
        //如果存在多个相同的模板 则需要通过band_key来判断
        let code = list[i].programaCode;
        if (code == "wx_home_001") {
          this.doTemplate1(list[i]);
        }
        if (code == "wx_home_002") {
          this.doTemplate2(list[i]);
        }
        if (code == "wx_home_003") {
          this.doTemplate3(list[i]);
        }
      }
  },
  doTemplate1:function(t){
    let req = {
      req:{
        // label:"banner",
        fileType:"img"
      }
    }
    this.requestDataUrl("",t, req);
  },
  doTemplate2: function (t) {
    let req = {
      qryCond: {
        pageSize: 4
      }
    }
   this.requestDataUrl("goods",t, null);
  },
  doTemplate3: function (t) {
    let req = {
      qryCond: {
        pageSize: 4
      }
    }
    this.requestDataUrl("goods",t, req);
  },
  doTemplate4: function (t) {
    //this.requestDataUrl(t,null);
    //console.log("轮播图");
  },
  requestDataUrl:function(domain,t,param){
    let that = this;
    if (t.detailList.length < 1) {
      return;
    }
    let detailList = t.detailList;
    //因为存在多个变量的可能,多个变量得到的数据都属于这个模板,根据变量的个数,模板生成相应的个数
    let data = {};
    let keyArray = [];
    let tmplateName = t.showTemplateCode;
    let templateData = {};
    for (let i = 0; i < detailList.length; i++) {
      let service = that.splitUrl(detailList[i].dataUrl);
      request.request(domain, service.name, service.method, param, function (resp) {
        let resultList = resp.data.resp;
        if (t.programaCode =="wx_home_003"){
          for(let i=0;i<resultList.length;i++){
              for(let j=0;j<resultList[i].list.rows.length;j++){
                let goods = resultList[i].list.rows[j];
                let sku = goods.tmGoodsSkuListCusts[0];
                if(goods&&sku&&sku.imgUrls){
                  resultList[i].list.rows[j].imgUrl = JSON.parse(sku.imgUrls).length>0 ? JSON.parse(sku.imgUrls)[0].url : "";
                }
              }
          }
        }
        data[detailList[i].bandKey] = resultList;
        keyArray.push(detailList[i].bandKey);
        data.key = keyArray;
        templateData[tmplateName] = data;
        that.setData(templateData);
      }, null)
    }
  },
  splitUrl:function(e){
    let service = {};
    let array = e.split("/");
    service.name = array[0];
    service.method = array[1];
    return service;
  },
  navigator:function(e){
    wx.navigateTo({
      url: '../category/category?typeCode=' + e.target.dataset.code +'&sourceFrom=index',
    })
    console.log(e);
  },

  navToSearch: function(){
    wx.navigateTo({
      url: '../search/search?from=index',
    })
  }
})
