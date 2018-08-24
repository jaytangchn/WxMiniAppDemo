

    /**
     * 毫秒数转换为指定格式的字符串
     * @param ts 日期对象毫秒数, 如果缺省，
     * @param format 日期格式,默认格式定义如下 yyyy-MM-dd(默认)
     *
     * YYYY/yyyy/YY/yy 表示年份
     * MM/M 月份
     * W/w 星期
     * dd/DD/d/D 日期
     * hh/HH/h/H 时间
     * mm/m 分钟
     * ss/SS/s/S 秒
     * @return string 指定格式的时间字符串
     */
function formatDateByTs(date, format) {
  if(typeof date == "number"){
    date = new Date(date);
  }
  let str = (format ? format : "yyyy-MM-dd");
  let Week = ['日', '一', '二', '三', '四', '五', '六'];
  str = str.replace(/yyyy|YYYY/, date.getFullYear().toString());
  str = str.replace(/yy|YY/, (date.getFullYear() % 100) > 9 ? (date.getFullYear() % 100).toString() : '0' + (date.getFullYear() % 100));
  str = str.replace(/MM/, date.getMonth() + 1 > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1));
  str = str.replace(/M/g, date.getMonth().toString());
  str = str.replace(/w|W/g, Week[date.getDay()]);

  str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
  str = str.replace(/d|D/g, date.getDate().toString());

  str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
  str = str.replace(/h|H/g, date.getHours().toString());
  str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
  str = str.replace(/m/g, date.getMinutes().toString());

  str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
  str = str.replace(/s|S/g, date.getSeconds().toString());

  return str;
}

  /**
     * 获取某月的第一天
     */
function getTheFirstOfThisMonth(date) {
  var nowMonth = date.getMonth(); //月
  var nowYear = date.getFullYear(); //年
  var monthStartDate = new Date(nowYear, nowMonth, 1);
  return monthStartDate;
}

    /**
     * 获得某月的天数
     */
function getMonthDays(date) {
  var month = date.getMonth(); //月
  var year = date.getFullYear(); //年
  var monthStartDate = new Date(year, month, 1);
  var monthEndDate = new Date(year, month + 1, 1);
  var days = (monthEndDate.getTime() - monthStartDate.getTime()) / (1000 * 60 * 60 * 24);
  return days;
}


function getTimeSelectData(intervalHour, intervalMinute){
  var minuteList = []
  for (var i = 0; i < 60; i = i + intervalMinute){
    var showStr = i+'';
    if(i < 10){
      showStr = '0' + showStr;
    }
    minuteList.push(showStr);
  }
  var hourList = [];
  for (var i = 0; i < 24; i = i + intervalHour) {
    var showStr = i + '';
    if (i < 10) {
      showStr = '0' + showStr;
    }
    hourList.push(showStr);
  }
  return [hourList, minuteList]
}

  /**
   *将分钟转为显示字符串：80-->(1小时20分钟)
  **/
  function getDurationMinuteShowStr(durationMinute){
    var value = durationMinute;
    if (value == 0) {
      return "(0分钟)";
    }
    var day = parseInt(value / (60 * 8) + "");
    var hour = parseInt((value % (60 * 8)) / 60 + "");
    var minute = value % 60;
    var str = ""
    if (day > 0) {
      str += day + "天"
    }
    if (hour > 0) {
      str += hour + "小时"
    }
    if (minute > 0) {
      str += minute + "分钟"
    }
    return '('+str+')';
  }


  /**
   *展示2个时间点构成的时间段
   **/
  function getDateShowStr(startTime, endTime){

    //显示字符串处理
    var resultStr = startTime + "-" +endTime
    if (startTime.substring(0, 11) == endTime.substring(0, 11)){
      var showStr1 = startTime.substring(0, 11)
      var showStr2 = startTime.substring(11) + '-' + endTime.substring(11)
      showStr2 = '(' + showStr2+')';
      resultStr = showStr1 + showStr2;
    } else if (startTime.substring(0, 8) == endTime.substring(0, 8)){
       var showStr1 = startTime.substring(0, 8)
      var showStr2 = startTime.substring(8) + '-' + endTime.substring(8)
      showStr2 = '(' + showStr2+')';
      resultStr = showStr1 + showStr2;
    } else if (startTime.substring(0, 5) == endTime.substring(0, 5)) {
       var showStr1 = startTime.substring(0, 5)
      var showStr2 = startTime.substring(5) + '-' + endTime.substring(5)
      showStr2 = '(' + showStr2+')';
      resultStr = showStr1 + showStr2;
    }
    return resultStr;
  }









module.exports = {
  formatDateByTs: formatDateByTs,
  getTheFirstOfThisMonth: getTheFirstOfThisMonth,
  getMonthDays: getMonthDays,
  getTimeSelectData: getTimeSelectData,
  getDurationMinuteShowStr:getDurationMinuteShowStr,
  getDateShowStr:getDateShowStr
}