//京东 订单列表 jd/list.js
var order_id = null;
Task(index);

function index(local) {

    var task = local.task;
    order_id = task.business_oid;
    if(order_id){
        sendMessageToBackground('save_user_cookies_to_remote', 'jd.com', function(){
            findOrder();
        });//save cookies

    }else{
        clue('任务中未找到平台订单号数据');
    }
}

function findOrder(){
    var order = $('#idUrl'+order_id);
    console.log(order);
    if(order.length > 0){
        orderPay();
    }else{
        clue('列表中未找到分配的付款订单');
    }
}

function orderPay(){
    var pay = $('#operate'+order_id).find('a.btn');
    console.log(pay);
    if(pay.length > 0){
        var pay_btn = pay[0];
        console.log(pay_btn);
        if(pay_btn.innerHTML.indexOf('付')!=-1 && pay_btn.innerHTML.indexOf('款')!=-1){
            console.log(pay_btn.innerHTML);
            pay_btn.click();
        }else{
            goOrderDetail();
        }
    }else{
        orderPayNew();
    }
}

function orderPayNew(){
    var pay = $('#operate'+order_id).find('a.btn-pay');
    console.log(pay);
    if(pay.length > 0){
        var pay_btn = pay[0];
        console.log(pay_btn);
        if(pay_btn.innerHTML.indexOf('付')!=-1 && pay_btn.innerHTML.indexOf('款')!=-1){
            console.log(pay_btn.innerHTML);
            pay_btn.click();
        }else{
            goOrderDetail();
        }
    }else{
        goOrderDetail();
    }
}

function goOrderDetail(){
    var order_id_links = $('#idUrl' + order_id);
    if(order_id_links.length > 0){
        order_id_links[0].click();
    }else{
        setTimeout(function () {
            window.location.reload(true);
        },10000);
    }

}
