

//document.getElementById("bar_state").onclick = function(){
//	localStorage.setItem('chart_type',"bar_state");
//	location.href="/project/"+project_name+"/"+sim_level;
//
//}
//document.getElementById("bar_result").onclick = function(){
//	localStorage.setItem('chart_type',"bar_result");
//	location.href="/project/"+project_name+"/"+sim_level;
//
//}
//document.getElementById("bar_group").onclick = function(){
//	localStorage.setItem('chart_type',"bar_group");
//	location.href="/project/"+project_name+"/"+sim_level;
//
//}
//document.getElementById("sim_time").onclick = function(){
//	localStorage.setItem('chart_type',"sim_time");
//	location.href="/project/"+project_name+"/"+sim_level;
//
//}


var db_HTML = document.getElementById('other_data') ;

var JsonData;

var xhr=new XMLHttpRequest();
xhr.open("GET", "/server_info/db_info", true);
xhr.send();

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


xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let JsonStr = xhr.responseText
        //console.log(JsonStr)
		JsonData = JSON.parse(JsonStr);
		console.log(JsonData);
		
		let server_info_data='<table class="server_info_table">'
		server_info_data+='<tr><td class="server_info_td">文件</td><td class="server_info_td">占用空间</td><td class="server_info_td">创建时间</td><td class="server_info_td">最近访问时间</td><td class="server_info_td">最近修改时间</td></tr>'
		for (i in JsonData){

			server_info_data+='<tr>';
			server_info_data+='<td class="server_info_td">'+JsonData[i]['name']+'</td>';
			server_info_data+='<td class="server_info_td">'+JsonData[i]['size']/1024+'KB</td>';
			server_info_data+='<td class="server_info_td">'+new Date(JsonData[i]['ctime']*1000).format("yyyy-MM-dd hh:mm:ss")+'</td>';
			server_info_data+='<td class="server_info_td">'+new Date(JsonData[i]['atime']*1000).format("yyyy-MM-dd hh:mm:ss")+'</td>';
			server_info_data+='<td class="server_info_td">'+new Date(JsonData[i]['mtime']*1000).format("yyyy-MM-dd hh:mm:ss")+'</td>';
			server_info_data+='</tr>';
		}
		
		db_HTML.innerHTML = server_info_data;
		document.getElementById("load_pic").style.display = "none";
    }

}


