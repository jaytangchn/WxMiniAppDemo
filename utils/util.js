const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const app = getApp();

function checkIsLogin(){
  if (!app.globalData.isLogin) {
    wx.navigateTo({
      url: '../login/login',
    })
    return false;
  }
  return true;
}

function checkRole(){
    let roleList = wx.getStorageSync("roleList");
    let role = "";
    for(let i=0;i<roleList.length;i++){
      if (roleList[i].roleTypeCode =="role_type.general"){
        role=(role=='2'||role=='3')?role:"1";
      }
      if (roleList[i].roleTypeCode == "role_type.salesman"){
        role=role=='3'?role:"2"
      }
      if (roleList[i].roleTypeCode == "role_type.serviceManager" ){
        role="3"
      }
    }
    return role;  /**1:经销商, 2.业务员 3.业务经理*/
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


function getDefualtImageUrl(name,fg,bg){
   if(name == null || name.trim() == ""){
    name = "佚名";
  }
  if(fg == null || fg.trim() == ""){
    fg = "AABBCC";
  }
   if(bg == null || bg.trim() == ""){
    bg = "EEDDAA";
  }
  var url = "http://iph.href.lu/100x100?text={0}&fg={1}&bg={2}"
  return url.replace("{0}",name).replace("{1}",fg).replace("{2}",bg);
}

function isBank(value){
  if(value==null || value==undefined){
    return true
  }
  if(typeof value == "string" && value.trim()==""){
    return true
  }
  return false
}


function getUrlFromPictureList(pictureList){
  var pictureUrlList = [];
  for (var i = 0; i < pictureList.length; i++) {
    var picture = pictureList[i];
    if(typeof picture == "string"){
      pictureUrlList.push(picture);
    }else{
      pictureUrlList.push(picture.url);
    }
  }
  return pictureUrlList;
}


const selectMap = {
  "sellOrderStatus":[
      { value: '', name: '请选择' },
      { value: 'drp_orders_status.sale_draft', name: '草稿' },
      { value: 'drp_orders_status.sale_unconfirmed', name: '待确认' },
      { value: 'drp_orders_status.sale_wait_for_audit', name: '待审核' },
      { value: 'drp_orders_status.sale_warehouse_unconfirmed', name: '待仓库确认' },
      { value: 'drp_orders_status.sale_wait_for_deliver', name: '待发货' },
      { value: 'drp_orders_status.sale_wait_for_receive', name: '待收货' },
      { value: 'drp_orders_status.sale_accomplish', name: '已完成' },
      { value: 'drp_orders_status.sale_invalid', name: '作废' },
  ],
  "overtime":[
      { name: '请选择', value: '' },
      { name: '平时加班', value: 'workday' },
      { name: '节日加班', value: 'holiday' },
  ]
}


function getNameByValue(type,value){
  var data = secondCategoryMap[type];
  for (var i = data.length - 1; i >= 0; i--) {
    if(data[i].value == value){
      return data[i].name;
    }
  }
  return "";
}

function getValueBySelectObj(selectObj){
  if(selectObj.data == null || selectObj.data == undefined || selectObj.data.length == 0 ){
    return null;
  }
  return selectObj.data[selectObj.index][selectObj.valueKey]
}



module.exports = {
  formatTime: formatTime,
  getDefualtImageUrl:getDefualtImageUrl,
  isBank:isBank,
  getUrlFromPictureList:getUrlFromPictureList,
  getNameByValue:getNameByValue,
  checkIsLogin: checkIsLogin,
  checkRole: checkRole,
  selectMap: selectMap,
  getValueBySelectObj:getValueBySelectObj
}
