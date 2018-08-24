// pages/searchOrder/searchOrder.js
const request = require("../../utils/request.js");
const dateUtil = require("../../utils/dateUtil.js");
const util = require("../../utils/util.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyWord:'',
    ordersStatus:{
      index:0,
      showkey:'name',
      valueKey:'value',
      data:util.selectMap.sellOrderStatus,
    },
    debtSelect:{
      index:0,
      showkey:'key',
      valueKey:'value',
      data:[
        {key:'请选择',value:''},
        {key:'无欠款',value:'0'},
        {key:'有欠款',value:'1'},
      ]
    },
    startCreateDate:'请选择',
    endCreateDate:'请选择',
    jxsSelect:{
      index:0,
      showkey:'comName',
      valueKey:'partnerID',
      data:[]
    },
    salemanSelect:{
      index:0,
      showkey:'realName',
      valueKey:'id',
      data:[]
    },
    addressSelect:{
      index:0,
      showkey:'realName',
      valueKey:'addrId',
      data:[]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //查询客户
    let that = this;
    let req = {
      "roleType": "role_type.general",
    }
    request.request("", "partnerM","queryPartnersList",{req:req},function (resp){
      console.log("general");
      console.log(resp);
      let arr = resp.data.resp;
      that.data.jxsSelect.data = arr;
      arr.splice(0, 0, {comName:'请选择'});

      that.setData({
        jxsSelect:that.data.jxsSelect
      });
    },null)
    //查询业务员
    let salemanReq = {
      "roleType": "role_type.salesman",
    }
    request.request("", "partnerM","queryPartnersList",{req:salemanReq},function (resp){
      console.log("salesman");
      console.log(resp);
      let arr = resp.data.resp;
      arr.splice(0, 0, {realName:'请选择'});
      that.data.salemanSelect.data = arr;

      that.setData({
        salemanSelect:that.data.salemanSelect
      });
    },null)
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
    this.setData({
      keyWord:'',
      ordersStatus:{
        index:0,
        showkey:'name',
        valueKey:'value',
        data:util.selectMap.sellOrderStatus,
      },
      debtSelect:{
        index:0,
        showkey:'key',
        valueKey:'value',
        data:[
          {key:'请选择',value:''},
          {key:'无欠款',value:'0'},
          {key:'有欠款',value:'1'},
        ]
      },
      startCreateDate:'请选择',
      endCreateDate:'请选择',
      addressSelect:{
        index:0,
        showkey:'realName',
        valueKey:'addrId',
        data:[]
      }
    });

    this.data.jxsSelect.index = 0;
    this.data.salemanSelect.index = 0;

    this.setData({
      jxsSelect:this.data.jxsSelect,
      salemanSelect:this.data.salemanSelect
    });

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


  ordersStatusIndexChange: function(event){
    console.log(event)
    this.data.ordersStatus.index = event.detail.value;
    this.setData({
      ordersStatus:this.data.ordersStatus
    })
  },

  debtIndexChange: function(event){
    console.log(event)
    this.data.debtSelect.index = event.detail.value;
    this.setData({
      debtSelect:this.data.debtSelect
    })
  },

  jxsIndexChange: function(event){
    var that = this;
    console.log(event)
    var jxsSelect = this.data.jxsSelect;
    this.data.jxsSelect.index = event.detail.value;
    this.setData({
      jxsSelect:this.data.jxsSelect
    })

    //查询地址信息
    var paramData = {
      qryCond: {
        pageSize:0,
        conditionMapList:[
          {
            columnName:'tai.partner_id',
            searchOperator:'=',
            columnValue:jxsSelect.data[jxsSelect.index]["partnerID"]
          },
        ]
      }
    }
    request.request("", "addrInfo","query",paramData,function (resp){
      console.log(resp);
      if (resp.data.status == "0000") {
        //that.data.addressSelect.
        var addressSelect = {
          index:0,
          showkey:'name',
          valueKey:'addrId',
          data:[]
        }
        addressSelect.data = resp.data.resp.rows;
        addressSelect.data.splice(0, 0, {name:'请选择'});
        that.data.addressSelect = addressSelect;
        that.setData({
          addressSelect:that.data.addressSelect
        })
      }
    },null)
  },

  salemanIndexChange: function(event){
    console.log(event)
    this.data.salemanSelect.index = event.detail.value;
    this.setData({
      salemanSelect:this.data.salemanSelect
    })
  },

  addressIndexChange: function(event){
    console.log(event)
    this.data.addressSelect.index = event.detail.value;
    this.setData({
      addressSelect:this.data.addressSelect
    })
  },

  startCreateDateChange:function(event){
    this.data.startCreateDate = event.detail.value;
     this.setData({
      startCreateDate:this.data.startCreateDate
    })
  },
  endCreateDateChange:function(event){
    this.data.endCreateDate = event.detail.value;
     this.setData({
      endCreateDate:this.data.endCreateDate
    })
  },

  keyWordInput:function(event){
    this.data.keyWord = event.detail.value;
     this.setData({
      keyWord:this.data.keyWord
    })
  },

  submit: function(event){
    var data = this.data;
    var qry = {};
    var qryStr = '';
    if(!util.isBank(data.keyWord)){
      qry.keyWord = data.keyWord;
      qryStr = qryStr+"&keyWord="+data.keyWord;
    }
    if(!util.isBank(util.getValueBySelectObj(data.ordersStatus))){
      qry.ordersStatus = util.getValueBySelectObj(data.ordersStatus);
      qryStr = qryStr+"&ordersStatus="+util.getValueBySelectObj(data.ordersStatus);
    }
    if(!util.isBank(util.getValueBySelectObj(data.debtSelect))){
      qry.debtStatus = util.getValueBySelectObj(data.debtSelect);
      qryStr = qryStr+"&debtStatus="+util.getValueBySelectObj(data.debtSelect);
    }
    if(!util.isBank(data.startCreateDate) && data.startCreateDate!='请选择'){
      qry.startCreateDate = data.startCreateDate;
      qryStr = qryStr+"&startCreateDate="+data.startCreateDate;
    }
    if(!util.isBank(data.endCreateDate) && data.endCreateDate!='请选择'){
      qry.endCreateDate = data.endCreateDate;
      qryStr = qryStr+"&endCreateDate="+data.endCreateDate;
    }
    if(!util.isBank(util.getValueBySelectObj(data.jxsSelect))){
      qry.jxsId = util.getValueBySelectObj(data.jxsSelect);
      qryStr = qryStr+"&jxsId="+util.getValueBySelectObj(data.jxsSelect);
    }
    if(!util.isBank(util.getValueBySelectObj(data.salemanSelect))){
      qry.salemanId = util.getValueBySelectObj(data.salemanSelect);
      qryStr = qryStr+"&salemanId="+util.getValueBySelectObj(data.salemanSelect);
    }
    if(!util.isBank(util.getValueBySelectObj(data.addressSelect))){
      qry.addressId = util.getValueBySelectObj(data.addressSelect);
      qryStr = qryStr+"&addressId="+util.getValueBySelectObj(data.addressSelect);
    }
    if(qryStr != ''){
      qryStr = qryStr.substring(1);
    }
    console.log(qryStr);

    //遍历qry
    if(Object.keys(qry)==null || Object.keys(qry).length==0){
      wx.showToast({
        title: '搜索内容不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    //存入缓存
    wx.setStorage({
      key:"ordersQryCond",
      data:qry
    })
    // wx.navigateBack({
    //   delta: 1
    // })
    wx.navigateTo({
      url: '../searchOrderResult/searchOrderResult',
    })
  }


})