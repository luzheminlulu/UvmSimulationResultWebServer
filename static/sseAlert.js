

var source = new EventSource('/stream2');
var IP_JSON;
var ws ;

source.onmessage = function(e) {
	
    IP_JSON = JSON.parse(e.data);
    console.log(IP_JSON);
	
	

	
	
	
};



ws = new WebSocket("ws://192.168.51.28:5010/echo/");
//ws = new WebSocket("ws://127.0.0.1:5010/echo/");

//ws.onopen = function(){
//	console.log("WebSocket连接已建立...");
//    //var message = IP_JSON;
//    //ws.send(JSON.stringify(message));
//    ws.send(JSON.stringify({'state':'onopen'}));
//};
//
//ws.onmessage = function (event) {
//	console.log(event.data)
//};
//
//ws.onclose = function(){ 
//	console.log("WebSocket连接已关闭..."); 
//};

ws.addEventListener('open', function (event) {
	ws.send(JSON.stringify({'state':'open','url':window.location.href}));
	console.log("WebSocket连接已建立...");

});

ws.addEventListener('message', function (event) {
	//console.log(event.data)
	let data = JSON.parse(event.data);
	if(data['type']=='show_message'){
		//alert(data['message']);
		let confirm_result=confirm(data['message']);
		if (confirm_result) {
			// 用户点击了确认按钮
			ws.send(JSON.stringify({'state':'confirm','result':'已确认'}));
		} else {
			// 用户点击了取消按钮
			ws.send(JSON.stringify({'state':'confirm','result':'已取消'}));
		}
	}
});

ws.addEventListener('close', function (event) {
	console.log("WebSocket连接已关闭..."); 
});
   


//setInterval(function() {
//	ws.send("hello");
//}, 1000);


