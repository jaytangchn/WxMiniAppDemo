// pages/myComponent/money-text/money-text.js
const util = require("../../../utils/util.js");
const moneyUtil = require("../../../utils/moneyUtil.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    money:{
        type:String,
        value:'',
        observer:function(e){
        } 
      },
  },

  /**
   * 组件的初始数据
   */
  data: {
    moneyStr:'',
  },

  attached: function(){
    console.log("attached");
    if(!util.isBank(this.properties.money)){
      this.setData({
        moneyStr:moneyUtil.formatMoneyMaxNDecimals(this.properties.money,4)
      })
    }
    console.log(this.data.money);
  },
  moved: function(){
    console.log("moved");
    console.log(this.properties.money);
  },
  detached: function(){
    console.log("detached");
    console.log(this.properties.money);
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
