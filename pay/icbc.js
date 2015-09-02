//工行付款

var bank = 'icbc';
var bank_card = null;


setTimeout(function(){
    Task(index);
},5000);

//var observer_config = {
//	attributes: true,
//	childList: true,
//	characterData: true,
//	attributeOldValue: true,
//	characterDataOldValue: true,
//	subtree: true
//}
//
//addMutationObserver($("body")[0], function(mutation){
//    console.log(mutation.type);
//    console.log(mutation.target);
//    console.log(mutation);
//
//}, observer_config);

//工行
function index(local){

    if(location.href.indexOf("icbc.com.cn/servlet/ICBCINBSReqServlet") != -1){

        var verify_token = $("iframe[name='VerifyimageFrameToken']");
        if(verify_token.length > 0){
            $("#payareadiv").children('table').width(100);
            var body = $("body");
            window.scrollTo(0,body.height());
            verify_token.height(40);
            verify_token.width(400);
            $(verify_token.contents()[0]).find('img').height(40);
        }else{
            lazy(function(){
                clicking($("#payareadiv a[href='javascript:mysubmit();']:visible"));
            },3);
        }



    }else{
        bank_card = local.pay.icbc_paycard;
        //银行付款
        updateHostStatus(1501000);

        if(local.task.business_slug == 'jd'){
            $("#paytype2")[0].click();
        }else{
            $("#ebankpaydiv #tabs a:contains('网银支付')")[0].click();
        }

        lazy(function(){
            if(bank_card.length <=0){
                updateHostStatus(1501002);
                clue('没有设置工行账号','error');
                return false;
            }
            writing($("#paycard_h"),bank_card,function(){

                clicking($("#ebankpaydiv a[href=\"javascript:verify('1');\"]"));

            });
        },3)
    }

}


