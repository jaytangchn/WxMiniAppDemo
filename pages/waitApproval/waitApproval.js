// pages/waitApproval/waitApproval.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: '01',
    od: false,
    getmes: false,
    mail: false
  },
  navTab: function (e) {
    this.setData({
      tab: e.target.dataset.tabid
    })
  },
  odToggle: function (e) {
    this.setData({
      od: !this.data.od
    })
  },
  getToogle: function () {
    this.setData({
      getmes: !this.data.getmes
    })
  },
  mailToogle: function () {
    this.setData({
      mail: !this.data.mail
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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