


/**
 * @author:jackphang
 * @dateTime:2017/12/18 13:55
 * @desc:格式化金额
 * @param s:数据源
 * @param n:保留小数点后N位
 * @return formatMoney("12345.675910", 3)，返回12,345.676
 */
function formatMoney(s, n) {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + '';
    var l = s.split('.')[0].split('').reverse(), r = s.split('.')[1];
    let t = '';
    for (let i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? ',' : '');
    }
    return t.split('').reverse().join('') + '.' + r;
}

/**
 * @author:jackphang
 * @dateTime:2017/12/18 13:55
 * @desc:格式化金额
 * @param s:数据源
 * @param n:保留最多最多小数点后N位
 * @return formatMoney("12345.675910", 3)，返回12,345.676
 */
function formatMoneyMaxNDecimals(s, n) {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + '';
    s = Number(s)+"";
    var l = s.split('.')[0].split('').reverse(),
        r = s.split('.')[1];
    let t = '';
    for (let i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? ',' : '');
    }
    if(r==null || r==undefined){
         return t.split('').reverse().join('');
      }
    return t.split('').reverse().join('') + '.' + r;
}



module.exports = {
  formatMoney: formatMoney,
  formatMoneyMaxNDecimals: formatMoneyMaxNDecimals,
}