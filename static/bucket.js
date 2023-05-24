


console.log(project_name);
console.log(sim_level);






document.getElementById("bar_state").onclick = function(){
	localStorage.setItem('chart_type',"bar_state");
	location.href="/project/"+project_name+"/"+sim_level;

}
document.getElementById("bar_result").onclick = function(){
	localStorage.setItem('chart_type',"bar_result");
	location.href="/project/"+project_name+"/"+sim_level;

}
document.getElementById("bar_group").onclick = function(){
	localStorage.setItem('chart_type',"bar_group");
	location.href="/project/"+project_name+"/"+sim_level;

}
document.getElementById("sim_time").onclick = function(){
	localStorage.setItem('chart_type',"sim_time");
	location.href="/project/"+project_name+"/"+sim_level;

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

var server_data;
const xhr=new XMLHttpRequest();


const myTime = document.getElementById("SetTime");
const myTable = document.getElementById("TableDiv");

const time_st_dateControl = document.getElementById('time_st');
const time_end_dateControl = document.getElementById('time_end');
const time_now_dateControl = document.getElementById('time_now');
const time_submit_button = document.getElementById('time_submit');
const time_more = document.getElementById('time_more');

if (localStorage.getItem("sim_analysis_time_now") != null) {
	time_now_dateControl.checked = JSON.parse(localStorage.getItem('sim_analysis_time_now')); 
}


if (localStorage.getItem("sim_analysis_time_st" ) != null) {
	time_st_dateControl.value    = localStorage.getItem('sim_analysis_time_st'); 
}
else{
	time_st_dateControl.value    = new Date((new Date().getTime() - 24*60*60*1000)).format("yyyy-MM-ddThh:mm");
}

if (localStorage.getItem("sim_analysis_time_end") != null) { 
	time_end_dateControl.value   = localStorage.getItem('sim_analysis_time_end');
}
else{
	time_end_dateControl.value   = new Date().format("yyyy-MM-ddThh:mm");
}




time_submit_button.onclick = function() {GetServerData();}



time_now_dateControl.onclick = function(){time_now_checkboxOnclick();};


function time_now_checkboxOnclick(){

	if ( time_now_dateControl.checked == true){
		time_end_dateControl.disabled="disabled";
	}else{
		time_end_dateControl.disabled= false ;
	}
 
}
time_now_checkboxOnclick()

time_more.onclick = function (){
	if(server_data){
		gen_table();
	}
}







function GetServerData(){
	
	let time_st = time_st_dateControl.value;
	let time_end = time_end_dateControl.value;
	let time_now = time_now_dateControl.checked;
	
	console.log(time_st);
	console.log(time_end);
	console.log(time_now);
	
	if(!time_st || !time_end){
		alert("请确认输入时间...");
		return;
	}
	else{
		
		if(time_now && time_st>=new Date().format("yyyy-MM-ddThh:mm")){
			alert("请确保开始时间小于现在...");
			return;
		}
		if(!time_now && time_st>=time_end){
			alert("请确保开始时间小于结束时间...");
			return;
		}
	}
	
	let url_get;
	if(time_now){
		url_get = "/bucket_info/"+"?project_name="+project_name+"&sim_level="+sim_level+"&time_st="+time_st+"&time_end="+"2099-01-01T00:00";
	}
	else{
		url_get = "/bucket_info/"+"?project_name="+project_name+"&sim_level="+sim_level+"&time_st="+time_st+"&time_end="+time_end;
	}

	//console.log(url_get);
	xhr.open("GET", url_get, true);
	xhr.send();
	document.getElementById("load_pic").style.display = "inline-block";

	localStorage.setItem('sim_analysis_time_st',time_st);
	localStorage.setItem('sim_analysis_time_end',time_end);
	localStorage.setItem('sim_analysis_time_now',time_now);
	


}

xhr.onreadystatechange = function() {

    if (xhr.readyState === 4 && xhr.status === 200) {
        let a = xhr.responseText
        //console.log(a);
		server_data = JSON.parse(a);
		
		console.log(server_data);
		
		gen_table();
		document.getElementById("load_pic").style.display = "none";
		time_more.style.display = "inline-block";

    }
};



function gen_table(){
	

	table_html = "<table class=\"bucket_info\">"
	
	if(time_more.checked){
		table_html += "<caption class=\"bucket_time\">时间段："+server_data["time_st"]+" 到 ";

		if(server_data["time_end"]=="2099-01-01 00:00:00"){
			table_html += "现在";
		}
		else{
			table_html += server_data["time_end"];
		}
		
		table_html += "</caption>";
		
		
		table_html += 	"<tr>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>前开始未结束"+"</td>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>内开始未结束"+"</td>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>后开始未结束"+"</td>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>前开始前结束"+"</td>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>前开始内结束"+"</td>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>前开始后结束"+"</td>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>内开始内结束"+"</td>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>内开始后结束"+"</td>"+
						"<td class=\"bucket_td\">"+"仿真在时间段<br>后开始后结束"+"</td>"+
						"<td class=\"bucket_td\">"+"未知开始时间<br>时间段前结束"+"</td>"+
						"<td class=\"bucket_td\">"+"未知开始时间<br>时间段内结束"+"</td>"+
						"<td class=\"bucket_td\">"+"未知开始时间<br>时间段后结束"+"</td>"+
						"<td class=\"bucket_td\">"+"废弃case"+"</td>"+
						"</tr>";
		
		let table_height = Math.max(
									
									server_data["st_before"         ].length,
									server_data["st_bewtten"        ].length,
									server_data["st_after"          ].length,
									server_data["fi_before_before"  ].length,
									server_data["fi_before_bewtten" ].length,
									server_data["fi_before_after"   ].length,
									server_data["fi_bewtten_bewtten"].length,
									server_data["fi_bewtten_after"  ].length,
									server_data["fi_after_after"    ].length,
									server_data["fi_unknow_before"  ].length,
									server_data["fi_unknow_bewtten" ].length,
									server_data["fi_unknow_after"   ].length,
									server_data["s_ignore"          ].length
		                            
									);
		
		for(let i=0;i<table_height;i++){
			table_html += 	"<tr>";
			
			if(i<server_data["st_before"].length){
				let case_name = server_data["st_before"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
					
			if(i<server_data["st_bewtten"].length){
				let case_name = server_data["st_bewtten"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["st_after"].length){
				let case_name = server_data["st_after"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_before_before"].length){
				let case_name = server_data["fi_before_before"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_before_bewtten"].length){
				let case_name = server_data["fi_before_bewtten"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_before_after"].length){
				let case_name = server_data["fi_before_after"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_bewtten_bewtten"].length){
				let case_name = server_data["fi_bewtten_bewtten"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_bewtten_after"].length){
				let case_name = server_data["fi_bewtten_after"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_after_after"].length){
				let case_name = server_data["fi_after_after"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_unknow_before"].length){
				let case_name = server_data["fi_unknow_before"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_unknow_bewtten"].length){
				let case_name = server_data["fi_unknow_bewtten"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<server_data["fi_unknow_after"].length){
				let case_name = server_data["fi_unknow_after"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
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
	}
	else{
		
		table_html += "<caption class=\"bucket_time\">时间段："+server_data["time_st"]+" 到 ";

		if(server_data["time_end"]=="2099-01-01 00:00:00"){
			table_html += "现在";
		}
		else{
			table_html += server_data["time_end"];
		}
		
		table_html += "</caption>";
		
		
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
			}
			else{
				table_html += "<td></td>";
			}
					
			if(i<server_data["fi_bewtten_bewtten"].length){
				let case_name = server_data["fi_bewtten_bewtten"][i];
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<(server_data["st_bewtten"].length+server_data["fi_bewtten_after"].length)){
				let case_name;
				if(i<(server_data["st_bewtten"].length)){case_name = server_data["st_bewtten"][i];}
				else if(i<(server_data["st_bewtten"].length+server_data["fi_bewtten_after"].length)){case_name = server_data["fi_bewtten_after"][i-server_data["st_bewtten"].length];}
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
			}
			else{
				table_html += "<td></td>";
			}
			
			if(i<(server_data["st_after"].length+server_data["fi_after_after"].length)){
				let case_name;
				if(i<(server_data["st_after"].length)){case_name = server_data["st_after"][i];}
				else if(i<(server_data["st_after"].length+server_data["fi_after_after"].length)){case_name = server_data["fi_after_after"][i-server_data["st_after"].length];}
				table_html += "<td class=\""+server_data["sim_result"][case_name]+"\"><a class=\"bucket_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+case_name+"\">"+case_name+"</a>"+"</td>";
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
		
	}
	
	
	
	
	
	
	
	
	
	
	table_html += "</table>"
	myTable.innerHTML = table_html;


}





GetServerData();
document.getElementById("chart_button").innerHTML="分时段";

