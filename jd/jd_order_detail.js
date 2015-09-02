//京东订单详情页面

//客户端信息
var client_infos = '';

//全局变量
var storage_data = null;

//支付成功
var pay_success = false;

Task(index);

function index(local) {
    storage_data = local;

    //核对订单号
    var order_detail_id = $("#orderid").val();
    if (local.task.business_oid == order_detail_id) {


        //付款状态
        var pay_status = $('#orderstate span.ftx14').text();

        if (pay_status == "付款成功" || pay_status == "正在出库") {
            //确认付款状态 保存数据
            updateHostStatus(1602000);//确认付款

            pay_success = true;
            //保存信息到服务器
            order_ready_to_save();

        } else {
            //固定标签页面
            pinned_this_tab();
            pay_success = false;
            //判断状态 等待 付款完成状态
            if (local.host_status > 1501000) {//大于1501000(银行登录) ，银行已登录
                if (local.host_status == 1502001) {
                    updateHostStatus(1601000);
                    //支付失败，重新去支付
                    clue("支付失败，重新支付");
                    $("#pay-button-" + order_detail_id + " a")[0].click();
                    //已重新支付，关闭当前
                    setTimeout(close_this_tab, 5000);
                    return false;
                }

            }
            //刷新页面 等待 付款状态
            reload_page();
        }

    } else {
        console.log("不是" + order_detail_id + ",应该是" + local.order_id + ",\r\n" + local.order_id + ' != ' + order_detail_id);
    }
}

//刷新页面
function reload_page() {
    clue(_t.order_detail_refresh_hz + "秒后，刷新");
    setTimeout(function () {

        window.location.reload(true);

    }, _t.order_detail_refresh_hz * 1000);

}


//关闭页面
function close_page() {

    if (storage_data.order_detail_auto_close && pay_success) {
        send_close_msg();
    }
}


//是否获取完整信息判断
function order_ready_to_save() {

    //if(is_have_pay_info() && is_good_body()){
    clue('确认付款, 正在保存数据中 >>>>>>', 'log', 0);
    console.log('订单信息完整，提交订单');
    //保存订单
    order_details_save();
    // }else{
    //     console.log('订单信息不完整，延迟1s提交');
    //     setTimeout(function(){
    //         order_ready_to_save();
    //     },1000);
    // }

}

//保存信息到服务器  
function order_details_save() {

    var params = {
        action: "order_detail_save",
        order_id: $("#orderid").val(),
        order_url: location.href,
        order_html: $('html').html(),
        force_update: 1
    };

    var url = 'https://disi.se/index.php/Home/Api/order_detail_save';
    //var url = 'http://b2.poptop.cc/index.php/Home/Api/order_detail_save';
    $.post(url, params, function (ret) {
        console.log('保存神器数据成功！');
    }, 'JSON');

    //完成
    finish_sendmsg(params);


}


//关闭窗口消息
function send_close_msg() {
    var msg = {
        cmd: 'order_detail_close'
    };
    //发送消息
    chrome.runtime.sendMessage(msg, function (response) {

    });
}


function finish_sendmsg(order) {

    //订单状态
    var order_status = $('#orderstate').find('strong').text();
    //付款状态
    var pay_status = $('#orderstate span.ftx14').text();

    //提交时间
    var submit_time = $('#track_time_0').text();
    //订单号
    var order_id = $("#orderid").val();

    //订单信息
    var $lis = $('#orderinfo .fore').find('li');

    //支付单号
    var pay_no = $("#ordertrack .fore0 .fore2").text();

    var user = '';
    var mobile = '';
    var address = '';

    if ($lis.length >= 3) {
        user = $($lis[0]).text().split('：')[1];
        address = $($lis[1]).text().split('：')[1];
        mobile = $($lis[2]).text().split('：')[1];
    }

    //金额信息      
    var $plis = $('div[class="total"]').find('li');
    var payStr = '';
    $plis.each(function (i) {

        var $li = $(this);

        var span_text = $li.find('span:eq(0)').text();
        if (span_text != '总商品金额：' && span_text != '- 返现：') {
            payStr += $.trim($li.text()).replace(/[\s+\+]/g, '');
        }

    });


    //应付金额
    var should_pay = $('div[class="extra"]').filter(":contains('应付总额')").text().replace(/[\s+\+]/g, '');
    var pay_result = payStr.replace(/\s/g, '');

    //计算折扣金额
    discount_fee = 0;
    $("#orderinfo .total ul li").each(function (j) {
        var li = $(this);
        li_text = li.text();
        if (li_text.indexOf('-') >= 0 && li_text.indexOf('返现') < 0) {
            //优惠,,不计算返现
            discount_fee += parseFloat(li_text.match(/\d+(=?.\d{0,2})/g));
        }
    });


    var items = [
        {title: "", message: user + ' (' + mobile.match(/\d+/)[0] + ')'},
        {title: "", message: address},
        {title: "", message: pay_result},
        {title: "", message: should_pay}       //应付总额
    ];

    should_pay = should_pay.match(/\d+(=?.\d{0,2})/g)[0];

    var storage_order = {
        "order_id": order_id,
        "order_status": order_status,
        "pay_status": pay_status,
        "pay_no": pay_no,
        "submit_time": submit_time,
        "consignee_user": user,
        "consignee_mobile": mobile,
        "consignee_address": address,
        "pay_result": pay_result,
        "jingdou": get_jingdou(),//京豆
        "yunfei": get_yunfei(),//运费
        "discount_fee": discount_fee,//折扣，，返现
        "payment_fee": should_pay//应付款金额
    };
    //设置一下
    var order_info = {
        //'finish_order_id'       :order_id,
        //'finish_user'           :user,
        //'finish_mobile'         :mobile,
        //'finish_address'        :address,
        //'finish_pay_result'     :pay_result,
        //'finish_jingdou'        :get_jingdou(),
        //'finish_yunfei'         :get_yunfei(),
        //'finish_should_pay'     :should_pay,
        'orderinfo': storage_order
    };
    set_order_info_storage(order_info);

}


//设置信息到storage
function set_order_info_storage(items) {

    chrome.storage.local.set(items, function (data) {
        updateHostStatus(1603000);//开始保存数据
        sendMessageToBackground('save_host_task_order_detail');
    });
}


//是否已经有支付信息，支付信息为延迟加载
function is_have_pay_info() {
    return ($('div[class="tb-ul"]').children().length > 0);
}

//是否是这完整的body
function is_good_body() {
    var match_len = $('html').html().match(/<\/body>/).length;

    return (match_len > 0);
}

/*************** 获取订单上的内容 ******************/

//获取京豆
function get_jingdou() {

    //京豆
    var $li_jingdou = $('div[class="total"] li').filter(":contains('京豆')");

    if ($li_jingdou.length > 0) {
        return $li_jingdou.html().match(/￥(\d+\.\d{2})/)[1];
    } else {
        return 0;
    }
}

//获取运费
function get_yunfei() {

    //运费
    var $li = $('div[class="total"] li').filter(":contains('运费')");

    if ($li.length > 0) {
        return $li.html().match(/(\d+\.\d{2})/)[1];
    } else {
        return 0;
    }
}

/*************** 获取订单上的内容 ******************/