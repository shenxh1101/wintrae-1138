export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/inventory/index',
    'pages/promotion/index',
    'pages/tasks/index',
    'pages/reports/index',
    'pages/inventory-check/index',
    'pages/replenishment/index',
    'pages/near-expiry/index',
    'pages/promotion-detail/index',
    'pages/task-detail/index',
    'pages/handover/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '智慧零售',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/dashboard/index',
        text: '看板'
      },
      {
        pagePath: 'pages/inventory/index',
        text: '商品'
      },
      {
        pagePath: 'pages/promotion/index',
        text: '促销'
      },
      {
        pagePath: 'pages/tasks/index',
        text: '任务'
      },
      {
        pagePath: 'pages/reports/index',
        text: '报表'
      }
    ]
  }
})
