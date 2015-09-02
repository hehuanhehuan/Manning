//config/common.js

//时间参数配置
var _t = {
	order_detail_refresh_hz: 5, //订单详情 确认订单状态页面 刷新频率 5s

    lazy_rand_time_start: 3,//10 //步骤间隔时间
    lazy_rand_time_end: 6,//20 //步骤间隔时间

    write_rand_msec_start: 150,//500 //字符输入间隔
    write_rand_msec_end: 300,//1000 //字符输入间隔

    main_product_wait_rand_time_start: 1*60,//3*60 //主商品停留时间
    main_product_wait_rand_time_end: 2*60,//5*60 //主商品停留时间
    aux_product_wait_rand_time_start: 50, //1*60 //副商品停留时间
    aux_product_wait_rand_time_end: 60, //3*60 //副商品停留时间


    product_rand_open_count: 2, //货比商品数量
	config: true
}

//主机步骤
var _host_step = {
    get_task: 0,
    check_address_login: 1,
    update_address: 2,
    open_promotion_link: 3,
    view_product: 4,
    settle_accounts: 5,
    submit_order: 6,
    payment: 7,
    save_order_info: 8
}