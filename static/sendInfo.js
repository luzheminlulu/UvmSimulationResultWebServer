

var server_data;
const xhr=new XMLHttpRequest();








if (localStorage.getItem("sim_analysis_time_now") != null) {
	let time_now   = JSON.parse(localStorage.getItem('sim_analysis_time_now')); 
	let time_st    = localStorage.getItem('sim_analysis_time_st'); 
	let time_end   = localStorage.getItem('sim_analysis_time_end');
			
	let url_get;
	if(time_now){
		url_get = "/bucket_info/"+"?project_name="+project_name+"&sim_level="+sim_level+"&time_st="+time_st+"&time_end="+"2099-01-01T00:00";
	}
	else{
		url_get = "/bucket_info/"+"?project_name="+project_name+"&sim_level="+sim_level+"&time_st="+time_st+"&time_end="+time_end;
	}

	xhr.open("GET", url_get, true);
	xhr.send();
	document.getElementById("load_pic").style.display = "inline-block";

}
else{
	alert("请返回前一页，刷新数据后再发送通知");
	location.href="/bucket/?project_name="+project_name+"&sim_level="+sim_level;
}

xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let a = xhr.responseText
		server_data = JSON.parse(a);
		
		//console.log(server_data);
		
		gen_table();
		document.getElementById("load_pic").style.display = "none";
		
    }
};


var start_before   =new Array;
var finish_betweeen=new Array;
var finish_after   =new Array;
var start_after    =new Array;
var start_unknow   =new Array;
var time_info;


function gen_table(){
	table_html = "<table class=\"bucket_info\">"
	time_info = server_data["time_st"]+" 到 ";
	if(server_data["time_end"]=="2099-01-01 00:00:00"){
		time_info += "现在";
	}
	else{
		time_info += server_data["time_end"];
	}
	
	
	table_html += "<caption class=\"bucket_time\">时间段：" + time_info + "</caption>";
	table_html += 	"<tr>"+
					"<td class=\"bucket_td\">"+"仿真在时间段前开始"+"</td>"+
					"<td class=\"bucket_td\">"+"仿真在时间段内开始并结束"+"</td>"+
					"<td class=\"bucket_td\">"+"仿真在时间段内开始未结束"+"</td>"+
					"<td class=\"bucket_td\">"+"仿真在时间段后开始"+"</td>"+
					"<td class=\"bucket_td\">"+"仿真开始时间未知"+"</td>"+
					"<td class=\"bucket_td\">"+"废弃case"+"</td>"+
					"</tr>";
	
	let table_height = Math.max(
								server_data["st_before"         ].length+server_data["fi_before_before"  ].length+server_data["fi_before_bewtten" ].length+server_data["fi_before_after"   ].length,
								server_data["fi_bewtten_bewtten"].length,
								server_data["st_bewtten"        ].length+server_data["fi_bewtten_after"  ].length,
								server_data["st_after"          ].length+server_data["fi_after_after"    ].length,
								server_data["fi_unknow_before"  ].length+server_data["fi_unknow_bewtten" ].length+server_data["fi_unknow_after"   ].length,
								server_data["s_ignore"          ].length
								);
	
	for(let i=0;i<table_height;i++){
		table_html += 	"<tr>";
		
		if(i<(server_data["st_before"].length+server_data["fi_before_before"].length+server_data["fi_before_bewtten"].length+server_data["fi_before_after"].length)){
			let case_name;
			if(i<(server_data["st_before"].length)){case_name = server_data["st_before"][i];}
			else if(i<(server_data["st_before"].length+server_data["fi_before_before"].length)){case_name = server_data["fi_before_before"][i-server_data["st_before"].length];}
			else if(i<(server_data["st_before"].length+server_data["fi_before_before"].length+server_data["fi_before_bewtten"].length)){case_name = server_data["fi_before_bewtten"][i-(server_data["st_before"].length+server_data["fi_before_before"].length)];}
			else if(i<(server_data["st_before"].length+server_data["fi_before_before"].length+server_data["fi_before_bewtten"].length+server_data["fi_before_after"].length)){case_name = server_data["fi_before_after"][i-(server_data["st_before"].length+server_data["fi_before_before"].length+server_data["fi_before_bewtten"].length)];}
			table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			start_before.push(case_name);
		}
		else{
			table_html += "<td></td>";
		}
				
		if(i<server_data["fi_bewtten_bewtten"].length){
			let case_name = server_data["fi_bewtten_bewtten"][i];
			table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			finish_betweeen.push(case_name);
		}
		else{
			table_html += "<td></td>";
		}
		
		if(i<(server_data["st_bewtten"].length+server_data["fi_bewtten_after"].length)){
			let case_name;
			if(i<(server_data["st_bewtten"].length)){case_name = server_data["st_bewtten"][i];}
			else if(i<(server_data["st_bewtten"].length+server_data["fi_bewtten_after"].length)){case_name = server_data["fi_bewtten_after"][i-server_data["st_bewtten"].length];}
			table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			finish_after.push(case_name);
		}
		else{
			table_html += "<td></td>";
		}
		
		if(i<(server_data["st_after"].length+server_data["fi_after_after"].length)){
			let case_name;
			if(i<(server_data["st_after"].length)){case_name = server_data["st_after"][i];}
			else if(i<(server_data["st_after"].length+server_data["fi_after_after"].length)){case_name = server_data["fi_after_after"][i-server_data["st_after"].length];}
			table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			start_after.push(case_name);
		}
		else{
			table_html += "<td></td>";
		}
		
		if(i<(server_data["fi_unknow_before"  ].length+server_data["fi_unknow_bewtten" ].length+server_data["fi_unknow_after"   ].length)){
			let case_name;
			if(i<(server_data["fi_unknow_before"].length)){case_name = server_data["fi_unknow_before"][i];}
			else if(i<(server_data["fi_unknow_before"].length+server_data["fi_unknow_bewtten"].length)){case_name = server_data["fi_unknow_bewtten"][i-server_data["fi_unknow_before"].length];}
			else if(i<(server_data["fi_unknow_before"].length+server_data["fi_unknow_bewtten"].length+server_data["fi_unknow_after"].length)){case_name = server_data["fi_unknow_after"][i-(server_data["fi_unknow_before"].length+server_data["fi_unknow_bewtten"].length)];}
			table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			start_unknow.push(case_name);
		}
		else{
			table_html += "<td></td>";
		}
		
		if(i<server_data["s_ignore"].length){
			let case_name = server_data["s_ignore"][i];
			table_html += "<td class=\""+"time_ignore"+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
		}
		else{
			table_html += "<td></td>";
		}
		
		table_html += 	"</tr>";
	}

	
	table_html += "</table>"
	document.getElementById("TableDiv").innerHTML = table_html;
	
	
	
	
	//console.log(start_before   );
	//console.log(finish_betweeen);
	//console.log(finish_after   );
	//console.log(start_after    );
	//console.log(start_unknow   );
	

}


var people_name={
	"xxx"      : {'name':"苏xx"  ,'mail':"suxxx@xxxx.com.cn"    },
	"yyy"     : {'name':"陆xx",'mail':"luxxx@xxxx.com.cn"  },

};




var update_ws_people;

ws.addEventListener('message', function (event) {
	let data = JSON.parse(event.data);
	//console.log(data);
	
	if(data['type']=='update_ws_people'){
		update_ws_people=data['data'];
		document.getElementById("update_ws_people").innerHTML = "";
		for(i in update_ws_people){
			document.getElementById("update_ws_people").innerHTML += "<span>"+update_ws_people[i]+"<br></span>";
		}
		
	}
	else if(data['type']=='update_message_state'){
		
		document.getElementById("message_state").innerHTML = "";
		for (i in data['data']){
			//console.log(i);
			document.getElementById("message_state").innerHTML +=  data['data'][i]['state']+" "+people_name[i]['name']+"<br>";
		}
	}

});

function get_info_str(case_list,people_name){
	let c_num=0;
	let str=""
	for (c in case_list){
		let cast_owner_name = case_list[c].split('-');
		if(cast_owner_name[0]==people_name){
			c_num++;
			if(c_num < 6){
				str += cast_owner_name[1]+', ';
			}
		}
	}
	if(c_num>=6){
		str += "和其他"+(c_num-5)+"个case,";
	}
	return {'str':str,'c_num':c_num}
	
}


function gen_info_data(){
	let info_obj = {'people':[]};
	
	let check_start_before    = document.getElementById('start_before').checked;
	let check_finish_betweeen = document.getElementById('finish_betweeen').checked;
	let check_finish_after    = document.getElementById('finish_after').checked;
	let check_start_after     = document.getElementById('start_after').checked;
	let check_start_unknow    = document.getElementById('start_unknow').checked;
	//console.log(check_start_before   );
	//console.log(check_finish_betweeen);
	//console.log(check_finish_after   );
	//console.log(check_start_after    );
	//console.log(check_start_unknow   );
	let arr=new Array;
	if(check_start_before   ){ arr = arr.concat(start_before   ); }
	if(check_finish_betweeen){ arr = arr.concat(finish_betweeen); }
	if(check_finish_after   ){ arr = arr.concat(finish_after   ); }
	if(check_start_after    ){ arr = arr.concat(start_after    ); }
	if(check_start_unknow   ){ arr = arr.concat(start_unknow   ); }

	//console.log(arr);
	
	for (i in arr){
		let cast_owner_name = arr[i].split('-');
		if(!info_obj['people'].includes(cast_owner_name[0])){
			info_obj['people'].push(cast_owner_name[0]);
		}
	}
	//console.log(info_obj);


	
	
	for (i in info_obj['people']){
		
		let str_start_before   ={'str':''};
		let str_finish_betweeen={'str':''};
		let str_finish_after   ={'str':''};
		let str_start_after    ={'str':''};
		let str_start_unknow   ={'str':''};
		

		if(check_start_before   ){ str_start_before    = get_info_str(start_before   ,info_obj['people'][i]); }
		if(check_finish_betweeen){ str_finish_betweeen = get_info_str(finish_betweeen,info_obj['people'][i]); }
		if(check_finish_after   ){ str_finish_after    = get_info_str(finish_after   ,info_obj['people'][i]); }
		if(check_start_after    ){ str_start_after     = get_info_str(start_after    ,info_obj['people'][i]); }
		if(check_start_unknow   ){ str_start_unknow    = get_info_str(start_unknow   ,info_obj['people'][i]); }

		//console.log(str_start_before    );
		//console.log(str_finish_betweeen );
		//console.log(str_finish_after    );
		//console.log(str_start_after     );
		//console.log(str_start_unknow    );
		
		if(str_start_before   ['str']){if(!info_obj[info_obj['people'][i]]){info_obj[info_obj['people'][i]]="你有"} info_obj[info_obj['people'][i]]+=str_start_before   ['c_num']+"个case仿真未开始："            +str_start_before    ['str'] +"\n" ; }
		if(str_finish_betweeen['str']){if(!info_obj[info_obj['people'][i]]){info_obj[info_obj['people'][i]]="你有"} info_obj[info_obj['people'][i]]+=str_finish_betweeen['c_num']+"个case仿真开始并结束："        +str_finish_betweeen ['str'] +"\n" ; }
		if(str_finish_after   ['str']){if(!info_obj[info_obj['people'][i]]){info_obj[info_obj['people'][i]]="你有"} info_obj[info_obj['people'][i]]+=str_finish_after   ['c_num']+"个case仿真开始但未结束："      +str_finish_after    ['str'] +"\n" ; }
		if(str_start_after    ['str']){if(!info_obj[info_obj['people'][i]]){info_obj[info_obj['people'][i]]="你有"} info_obj[info_obj['people'][i]]+=str_start_after    ['c_num']+"个case之后才开始仿真："        +str_start_after     ['str'] +"\n" ; }
		if(str_start_unknow   ['str']){if(!info_obj[info_obj['people'][i]]){info_obj[info_obj['people'][i]]="你有"} info_obj[info_obj['people'][i]]+=str_start_unknow   ['c_num']+"个case是否进行过仿真无法确认："+str_start_unknow    ['str'] +"\n" ; }
		
	   
	
		
	}
	
	//console.log(info_obj);
	return info_obj;
	
}





function copyToClipboard(text) {
	const tempElement = document.createElement('textarea');
	tempElement.value = text;
	document.body.appendChild(tempElement);
	tempElement.select();
	document.execCommand('copy');
	document.body.removeChild(tempElement);
}

function sendEmail(recipient, cc, subject, body) {
	let mailtoLink = `mailto:${recipient}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	//console.log(mailtoLink);
	window.location.href = mailtoLink;
}




document.getElementById("gen_ulink").onclick = function() {
	let info_obj = gen_info_data();

	let ulink_str="Hi, 自"+time_info+"\n\n";
	
	
	for (people in info_obj["people"]){
		if(info_obj["people"][people] in people_name){
			ulink_str+="@"+people_name[info_obj["people"][people]]['name']+'\n';
		}
		else{
			ulink_str+="@用户"+info_obj["people"][people]+'\n';
		}
		
		ulink_str+=info_obj[info_obj["people"][people]]+'\n';
		
	}
	ulink_str+="以上内容由UVM仿真结果统计平台自动生成，如有差错，及时联系";
	
	copyToClipboard(ulink_str);
	document.getElementById("copydone").innerHTML="已复制到剪贴板";

}


document.getElementById("gen_mail").onclick = function() {


	let info_obj = gen_info_data();

	let recipient = '';
	let cc = 'luzhemin@icrd.com.cn';
	let subject = 'UVM仿真结果统计';
	let body = "Hi, 自"+time_info+"\n\n";

	
	for (people in info_obj["people"]){
		if(info_obj["people"][people] in people_name){
			recipient += people_name[info_obj["people"][people]]['mail']+";";
			body+=people_name[info_obj["people"][people]]['name']+'\n';
		}
		else{
			body+=info_obj["people"][people]+"（无匹配邮箱，请确认）"+'\n';
		}
		
		body+=info_obj[info_obj["people"][people]]+'\n';
		
	}
	body+="以上内容由平台自动生成，如有差错，及时联系";
	
	


	sendEmail(recipient, cc, subject, body);

	document.getElementById("maildone").innerHTML="已打开邮件客户端";
}

Date.prototype.format = function (fmt) {
  var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ?
        (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}


document.getElementById("info_send").onclick = function() {
	let info_obj = gen_info_data();
	
	let message = {};

	message["people"]=info_obj["people"];
	for (people in info_obj["people"]){
		message[info_obj["people"][people]]="Hi, "+people_name[info_obj["people"][people]]['name']+
											"\n\n自"+time_info+"\n"+info_obj[info_obj["people"][people]]+
											"\n请检查确认，谢谢\n以上内容由UVM仿真结果统计平台自动生成，如有差错，及时联系\n"+
											"发送时间："+new Date().format("yyyy-MM-dd hh:mm");
		
	}
	
	if(ws.readyState === ws.OPEN){
		ws.send(JSON.stringify({'state':'send_message',"message":message}));
		console.log("已发送");

		document.getElementById("infodone").innerHTML="已发送";
	}
	else{
		
		document.getElementById("infodone").innerHTML="ws连接失败";
	}

}

if(ws.readyState === ws.OPEN){
   ws.send(JSON.stringify({'state':'send_info'}));
}
 

