// config/background.js
var UserAgent = '';//useragent
var GetTaskStatus = false;
var StartTaskOpenUrl = false;

var last_watchdog_time = new Date().getTime();
var watchdog_timeout_count = 0;
var watchdog_timeout_time = 60000;
var last_watchdog_timeout_step = null;

//京东修改收货地址的登录地址
var jd_revise_address_login_url = "https://passport.jd.com/uc/login.aspx?ReturnUrl=http%3A%2F%2Feasybuy.jd.com%2Faddress%2FgetEasyBuyList.action#none";
var jd_revise_address_login_url = "https://passport.jd.com/new/login.aspx?ReturnUrl=http%3A%2F%2Feasybuy.jd.com%2Faddress%2FgetEasyBuyList.action";
//一号店修改收货地址的登录地址
var yhd_revise_address_login_url = "https://passport.yhd.com/passport/login_input.do?returnUrl=http%3A%2F%2Fmy.yhd.com%2Fmember%2Faddress%2FaddressBook.do";

//默认配置信息，设置到storage
var _cfg = {
	
	// 'host_status': 40001,
    // 'reported_status': 0,
    // 'isRunning': true,
    //'last_ip':'',

	'host_status': 0,
    'host_step': 0,
	'reported_status': 0,
	'isRunning': false
};

//一号店地址
var gbl_const_yhd_address_map = {
    '上海':1, '北京':2, '天津':3, '河北':4, '江苏':5, '浙江':6, '重庆':7, '内蒙古':8, '辽宁':9, '吉林':10, '黑龙江':11, '四川':12, '安徽':13, '福建':14, '江西':15, '山东':16, '河南':17, '湖北':18, '湖南':19, '广东':20, '广西':21, '海南':22, '贵州':23, '云南':24, '西藏':25, '陕西':26, '甘肃':27, '青海':28, '新疆':29, '宁夏':30, '山西':32
};

var _host_status = {
    "0": "...",
    "1": "暂停",
    "2": "账号重置",
    "3": "订单异常",

    "1000001": "[红]提交过订单，需人工核对",
    "1000002": "[红]账号异常,需要验证",

    "1001000": "Host开始运行",

    "1101000": "关闭Chrome窗口",
    "1102000": "进行ADSL拨号",
    "1103000": "获取IP地址",
    "1103001": "IP地址重复，等待重新拨号",
    "1103002": "IP地址错误，等待重新拨号",
    "1104000": "IP地址正常,准备请求服务器任务",

    "1201000": "开始请求服务器任务",
    "1202000": "得到服务器任务",
    "1202001": "请求服务器任务失败",
    "1203000": "任务开始执行",

    "1301000": "登录",
    "1301001": "[绿]登录,出现验证码",
    "1302000": "核对收货地址",
    "1303000": "添加收货地址",

    "1401000": "打开带后缀链接",
    "1401001": "[红]链接劫持,注意重单",
    "1401002": "[红]后缀链接重复打开",
    "1401003": "[红]提交过订单，需人工核对",

    "1402200": "手机端登录",
    "1402201": "手机登录出现验证码",
    "1403200": "手机登录自动打码",

    "1404000": "搜索关键词",
    "1404001": "[红]提交过订单，需人工核对",
    "1405000": "货比三家",
    "1406000": "打开主商品",
    "1406001": "[红]无货",
    "1406002": "[红]下柜",
    "1406003": "[红]无货或下柜",
    "1406004": "[红]库存不足",
    "1406005": "[红]该地区不支持配送",
    "1407000": "等待加入购物车",
    "1408000": "主商品加入购物车",
    "1409000": "购物车,提交结算",
    "1409101": "[红]赠品无货",
    "1409201": "[红]主产品不存在",
    "1409202": "[红]存在其他产品",
    "1409203": "[红]数量不一致",
    "1410000": "准备提交订单",
    "1410101": "[红]主产品不存在",
    "1410102": "[红]存在其他产品",
    "1410103": "[红]数量不一致",
    "1410104": "[红]支付密码错误",
    "1410005": "[红]提交订单错误",
    "1410006": "[红]出现多包裹",
    "1410007": "[红]提交订单有验证码",
    "1410208": "[红]提交订单商品或赠品无货",
    "1411000": "提交订单成功",
    "1412000": "手机PC登录，付款",
    "1413000": "我的订单去支付",
    "1414000": "跳转银行",
    "1414001": "[红]付款信息设置错误",

    "1501000": "银行付款",
    "1501001": "[红]中行账号信息设置错误",
    "1501002": "[红]工行账号信息设置错误",
    "1501003": "[绿]登录出现验证码",
    "1502000": "[绿]已发送手机口令",
    "1502001": "付款失败",
    "1503000": "付款成功",
    "1504000": "完成付款",

    "1601000": "付款失败重新来",
    "1602000": "保存订单数据",
    "1603000": "推送订单数据到服务器",


    "2000000": "任务完成"
};

//手机端  useragent 配置
var _MobileUserAgent = [
//ipad
'Mozilla/5.0 (iPad; CPU OS 6_1_3 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25',
'Mozilla/5.0 (iPad; CPU OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3',
'Mozilla/5.0 (iPad; CPU OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53',
'Mozilla/5.0 (iPad; CPU OS 7_1_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D201 Safari/9537.53',
'Mozilla/5.0 (iPad; CPU OS 7_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D167 Safari/9537.53',
'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; zh-cn) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10',
'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53',
'Mozilla/5.0 (iPad; CPU OS 7_0_2 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A501 Safari/9537.53',
'Mozilla/5.0 (iPad; CPU OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B511 Safari/9537.53',
'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; zh-cn) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B367 Safari/531.21.10',
'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25',
'Mozilla/5.0 (iPad; CPU OS 6_1_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25',
'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
'Mozilla/5.0 (iPad; CPU OS 7_0_6 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B651 Safari/9537.53',
'Mozilla/5.0 (iPad; CPU OS 6_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B141 Safari/8536.25',
'Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B176 Safari/7534.48.3',
'Mozilla/5.0 (iPad; CPU iPhone OS 501 like Mac OS X) AppleWebKit/534.46 (KHTML like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3',
'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
'Mozilla/5.0 (iPad; CPU OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25',
'Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko ) Version/5.1 Mobile/9B176 Safari/7534.48.3',
//iphone
'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25',
'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B350 Safari/8536.25',
'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; zh-cn) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16',
'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53',
'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D201 Safari/9537.53',
'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D167 Safari/9537.53',
'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5',
'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; zh-cn) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7',
'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53',
'Mozilla/5.0 (iphone; CPU iphone os 7_0_2 like mac os x) Applewebkit/537.51.1 (khtml, like gecko) version/7.0 mobile/11a501 safari/9537.53',
'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B511 Safari/9537.53',
'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25',
'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_6 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B651 Safari/9537.53',
'Mozilla/5.0 (iphone; U; CPU iPhone OS 4_3_5 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
'Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3',
'Mozilla/5.0 (iPad; CPU iPhone OS 501 like Mac OS X) AppleWebKit/534.46 (KHTML like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3',
//android
'Mozilla/5.0 (Linux; U; Android 2.2; zh-cn; Desire_A8181 Build/FRF91) App3leWebKit/53.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 4.0.3; zh-cn; MIDC410 Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
'Mozilla/5.0 (Linux; U; Android 4.0.4; zh-cn; MIDC409 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
'Mozilla/5.0 (Linux; U; Android 4.1.1; zh-cn; Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
'Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19',
'Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; GT-N7100 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
'Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; GT-I9300 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
'Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; SM-T210R Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
'Mozilla/5.0 (Linux; U; Android 4.0.2; zh-cn; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
 'Mozilla/5.0 (Linux; Android 4.0.4; DROID RAZR Build/6.7.2-180_DHD-16_M4-31) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; Android 4.4.4; zh-cn; SAMSUNG SM-E7000 Build/KTU84P) AppleWebKit/537.36 (KHTML, like Gecko) Version/2.0 Chrome/34.0.1847.76 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 4.4.4; SM-E7000 Build/KTU84P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.89 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; U; Android 4.1.1; zh-cn; MI 2 Build/JRO03L) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.6 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; U; Android 4.1.1; zh-cn; MI 2 Build/JRO03L) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 XiaoMi/MiuiBrowser/2.1.1',
'Mozilla/5.0 (Linux; Android 4.1.1; MI 2 Build/JRO03L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.117 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 4.4.4; SM-N910V Build/KTU84P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.93 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; U; Android 4.1.1; zh-cn; GT-I9300 Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
'Mozilla/5.0 (Linux; Android 4.4.2; LG-D415 Build/KOT49I.D41510e) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.93 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.0.1; Nexus 5 Build/LRX22C) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile Safari/537.36 MicroMessenger/6.1.0.56_r1021013.540 NetType/WIFI',
'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 4.2.1; Nexus 7 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19',
'Mozilla/5.0 (Linux; Android 4.2.1; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19',
//HTC
'Mozilla/5.0 (Linux; U; Android 2.2; zh-cn; Desire_A8181 Build/FRF91) App3leWebKit/53.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.3.5; zh-cn; HTC_DesireHD_A9191 Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.3.5; zh-cn; HTC_DesireS_S510e Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 4.0.3; zh-cn; HTC_Desire_C Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
'Mozilla/5.0 (Linux; U; Android 4.0.3; zh-cn; HTC_Desire_VC_T328d Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
'Mozilla/5.0 (Linux; U; Android 2.1-update1; zh-cn; HTC Desire 1.19.161.5 Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari',
'Mozilla/5.0 (Linux; U; Android 2.2.2; zh-cn; HTC_Desire_A8181 Build/FRG83G) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.2.1; zh-cn; HTC_DesireZ_A7272 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.2; zh-cn; HTC_DesireHD_A9191 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.3.4; zh-cn; HTC Desire Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.3.3; zh-cn; HTC_DesireS_S510e Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 4.2.2; zh-cn; Desire HD Build/JDQ39E) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 CyanogenM',
'Mozilla/5.0 (Linux; U; Android 2.3.3; zh-cn; HTC_DesireZ_A7272 Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.2.2; zh-cn; HTC Desire Build/FRG83G) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'

];


var _host_step_action_url = {
    1: {
        "jd": [
            "https://passport.jd.com/new/login.aspx?ReturnUrl=http%3A%2F%2Feasybuy.jd.com%2Faddress%2FgetEasyBuyList.action",
            "https://passport.jd.com/new/login.aspx?ReturnUrl=http%3A%2F%2Feasybuy.jd.com%2Faddress%2FgetEasyBuyList.action"
        ],
        "yhd": [
            "https://passport.yhd.com/passport/login_input.do?returnUrl=http%3A%2F%2Fmy.yhd.com%2Fmember%2Faddress%2FaddressBook.do",
            "https://passport.yhd.com/passport/login_input.do?returnUrl=http%3A%2F%2Fmy.yhd.com%2Fmember%2Faddress%2FaddressBook.do"
        ]
    },
    2: {
        "jd": ["http://easybuy.jd.com/address/getEasyBuyList.action", "http://easybuy.jd.com/address/getEasyBuyList.action"],
        "yhd": ["http://my.yhd.com/member/address/addressBook.do", "http://my.yhd.com/member/address/addressBook.do"]
    },
    3: {
        "jd": ["{promotion_url}"],
        "yhd": ["{promotion_url}"]
    },
    4: {
        "jd": ["http://item.jd.com/{item_id}.html", "http://item.m.jd.com/product/{item_id}.html"],
        "yhd": ["http://item.yhd.com/item/{item_id}", "http://item.m.yhd.com/item/{item_id}"]
    },
    5: {
        "jd": ["http://cart.jd.com/cart/cart.html", "http://p.m.jd.com/cart/cart.action"],
        "yhd": ["http://cart.yhd.com/cart/cart.do", "http://cart.m.yhd.com/cart/showCart"]
    },
    6: {
        "jd": ["http://trade.jd.com/shopping/order/getOrderInfo.action", "http://p.m.jd.com/norder/order.action"],
        "yhd": ["http://buy.yhd.com/checkoutV3/index.do", "http://buy.m.yhd.com/checkout/order.do"]
    },
    7: {
        "jd": ["http://order.jd.com/center/list.action", "http://order.jd.com/center/list.action"],
        "yhd": ["http://my.yhd.com/order/myOrder.do", "http://my.yhd.com/order/myOrder.do"]
    },
    8: {
        "jd": ["http://order.jd.com/center/list.action", "http://order.jd.com/center/list.action"],
        "yhd": ["http://my.yhd.com/order/myOrder.do", "http://my.yhd.com/order/myOrder.do"]
    }
};
