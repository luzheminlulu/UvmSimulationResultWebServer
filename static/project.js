
var project_path = window.location.pathname;
var table_update_type = {"bar_state":"","bar_result":""};
var table_sim_type = {"bar_state":"","bar_group":""};
var table_case_type = {"bar_state":"","bar_result":"","bar_group":""};


console.log(project_name);
console.log(sim_level);


var chart_type;
var s_data={};

if (localStorage.getItem("chart_type") != null) {

	chart_type = localStorage.getItem('chart_type');
	//console.log(chart_type);
}
else{
	chart_type = "bar_state";
	//console.log(chart_type);
}



var chart_get=new XMLHttpRequest();
var myChart = echarts.init(document.getElementById("ChartDiv"));
var xdata=new Array();

var server_data;

var myTable = document.getElementById("TableDiv");

document.getElementById("bar_state").onclick = function(){
	GetServerData("bar_state");

}
document.getElementById("bar_result").onclick = function(){
	GetServerData("bar_result");

}
document.getElementById("bar_group").onclick = function(){
	GetServerData("bar_group");

}
document.getElementById("sim_time").onclick = function(){
	GetServerData("sim_time");

}

function deepClone(obj) {
  if (typeof obj !== 'object' || obj === null) {
    // 如果不是对象或数组，则直接返回
    return obj;
  }

  var newObj = Array.isArray(obj) ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 递归复制每个属性或元素
      newObj[key] = deepClone(obj[key]);
    }
  }
  return newObj;
}



function GetServerData(type){
	chart_type = type;
	localStorage.setItem('chart_type',chart_type);
	let url_get = "/chart/"+chart_type+"?project_name="+project_name+"&sim_level="+sim_level;
	//console.log(url_get);
	chart_get.open("GET", url_get, true);
	chart_get.send();
	document.getElementById("load_pic").style.display = "inline-block";
	myChart.showLoading();
}
 
chart_get.onreadystatechange = function() {

    if (chart_get.readyState === 4 && chart_get.status === 200) {
        let a = chart_get.responseText
        //console.log(a);
		server_data = JSON.parse(a);
		console.log(server_data);
		
		
		xdata = server_data["time_list"];
		//console.log(xdata);
		
		let dict={
			"pass":[],
			"s_pass":[],
			"fail":[],
			"s_fail":[],
			"sim":[],
			"unknow":[],
		};
		s_data={};
		
		for (key in xdata){
			let index;
			index = dict["pass"  ].indexOf(server_data[xdata[key]][0]); if (index !== -1) {dict["pass"  ].splice(index,1);}
			index = dict["s_pass"].indexOf(server_data[xdata[key]][0]); if (index !== -1) {dict["s_pass"].splice(index,1);}
			index = dict["fail"  ].indexOf(server_data[xdata[key]][0]); if (index !== -1) {dict["fail"  ].splice(index,1);}
			index = dict["s_fail"].indexOf(server_data[xdata[key]][0]); if (index !== -1) {dict["s_fail"].splice(index,1);}
			index = dict["sim"   ].indexOf(server_data[xdata[key]][0]); if (index !== -1) {dict["sim"   ].splice(index,1);}
			index = dict["unknow"].indexOf(server_data[xdata[key]][0]); if (index !== -1) {dict["unknow"].splice(index,1);}
			dict[server_data[xdata[key]][2]].push(server_data[xdata[key]][0])
			dict[server_data[xdata[key]][2]].sort();
			
			s_data[server_data[xdata[key]][1]]=deepClone(dict);
			//console.log(server_data[xdata[key]][1]);
			//console.log(s_data[server_data[xdata[key]][1]]);
		
		}
		
		//console.log(s_data);
		
		
		gen_chart();
		//console.log(xdata.length-1);
		gen_table(-1);
		
		if(chart_type=="bar_state"){
			document.getElementById("chart_button").innerHTML="仿真状态";
		}
		else if(chart_type=="bar_result"){
			document.getElementById("chart_button").innerHTML="仿真结果";
		}
		else if(chart_type=="bar_group"){
			document.getElementById("chart_button").innerHTML="人员分组";
		}
		else if(chart_type=="sim_time"){
			document.getElementById("chart_button").innerHTML="仿真时长";
		}
		else if(chart_type=="other"){
			document.getElementById("chart_button").innerHTML="其他数据";
		}
		
		
		document.getElementById("load_pic").style.display = "none";
    }
};




function gen_chart(){
	let chart_text   ;
	if(chart_type in table_update_type) {
		//console.log(server_data);

		
		let ypass=new Array();
		let yfail=new Array();
		let ysimu=new Array();
		let yunkn=new Array();
		
		for (key in s_data){
			//console.log(key);
			//console.log(s_data[key]);
			ypass.push([key,s_data[key]["pass"].length+s_data[key]["s_pass"].length]);
			yfail.push([key,s_data[key]["fail"].length+s_data[key]["s_fail"].length]);
			ysimu.push([key,s_data[key]["sim"].length]);
			yunkn.push([key,s_data[key]["unknow"].length]);
			
		}
		
		
		//console.log(ysimu);

		let chart_subtext;
		if(chart_type=="bar_state"){
			chart_text    = project_name+" "+sim_level+" 仿真状态";
			chart_subtext = '基于当前仿真状态统计';
		}
		else{
			chart_text    = project_name+" "+sim_level+" 仿真结果";
			chart_subtext = '基于最后一次仿真结果统计';
		}
		
		
		
		let option = {
			title : {
						text: chart_text,
						subtext: chart_subtext 
					
					},
			tooltip : {
							trigger: 'axis'
						
						},
			legend: {
						//itemGap:40,
						z:30,
						orient: 'vertical',
						x:'right',      //可设定图例在左、右、居中
						y:'center',     //可设定图例在上、下、居中
						padding:[0,10,0,0],   //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
						data:['pass','simulating','fail','unknow'],
						selected: {
							'simulating':chart_type=="bar_state"?true:false,
						
							},
						
					},
	
			calculable : true,
			xAxis : [
						{
							type : 'time',
							axisLabel: {
								formatter: function (value, index) {
									var date = new Date(value);
									return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
								}
							}
							//data : xdata
						}
					],
			yAxis : [{
						type : 'value',
						axisLabel : {
							formatter: '{value}'}
							}
					],
			//dataZoom: [
            //
			//			{
			//				type: 'inside',
			//				xAxisIndex: 0,
			//				start: 0,
			//				end: 100,
			//				filterMode: 'empty',
			//				showDetail :true,
			//			},
            //
			//			{
			//				type: 'inside',
			//				yAxisIndex: 0,
			//				start: 0,
			//				end: 100,
			//				filterMode: 'empty',
			//				showDetail :true,
			//			}
			//		],

			series : [

				{
					stack:'1',
					name:'unknow',
					type: 'line',
					data:yunkn,
					symbol:'circle',
					symbolSize:0,
					showSymbol:false,
					smooth:true,
					z:9,
					sampling:'max',
					itemStyle: {
						color: "#808080",
					},
					//encode:{
					//	x:[0],
					//	y:[1],
					//},
					areaStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [{
								offset: 0, color: 'rgba(128,128,128, 0.7)' // 0% 处的颜色
							}, {
								offset: 1, color: 'rgba(128,128,128, 0.1)' // 100% 处的颜色
							}],
							global: false // 缺省为 false
						}
					},

				},
				{
					stack:'1',
					name:'fail',
					type: 'line',
					data:yfail,
					symbol:'circle',
					symbolSize:0,
					showSymbol:false,
					smooth:true,
					z:8,
					sampling:'max',
					itemStyle: {
						color: "#C23531",
					},
					//encode:{
					//	x:[0],
					//	y:[1],
					//},
					areaStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [{
								offset: 0, color: 'rgba(194,53,49, 0.7)' // 0% 处的颜色
							}, {
								offset: 1, color: 'rgba(194,53,49, 0.1)' // 100% 处的颜色
							}],
							global: false // 缺省为 false
						}
					},

				},	
				
				{
					stack:'1',
					name:'simulating',
					type: 'line',
					data:ysimu,
					symbol:'circle',
					symbolSize:0,
					showSymbol:false,
					smooth:true,
					z:7,
					sampling:'max',
					itemStyle: {
						color: "#B9967A ",
					},
					//encode:{
					//	x:[0],
					//	y:[1],
					//},
					areaStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [{
								offset: 0, color: 'rgba(185,150,122, 0.7)' // 0% 处的颜色
							}, {
								offset: 1, color: 'rgba(185,150,122, 0.1)' // 100% 处的颜色
							}],
							global: false // 缺省为 false
						}
					},

				},	
			
				{
					stack:'1',
					name:'pass',
					type: 'line',
					data:ypass,
					symbol:'circle',
					symbolSize:0,
					showSymbol:false,
					smooth:true,
					z:6,
					sampling:'min',
					markPoint : {
						data : [
							//{type : 'max', name: '最大值'},
							//{type : 'min', name: '最小值'}
							]},
					itemStyle: {
						color: "#1FA2E3",
					},
					//encode:{
					//	x:[0],
					//	y:[1],
					//},
					areaStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [{
								offset: 0, color: 'rgba(31,162,227, 0.7)' // 0% 处的颜色
							}, {
								offset: 1, color: 'rgba(31,162,227, 0.1)' // 100% 处的颜色
							}],
							global: false // 缺省为 false
						}
					},


				},


			]
		};
		
		myChart.clear();
		myChart.setOption(option,true);
		myChart.hideLoading();
	}
	else if(chart_type=="bar_group"){
		//console.log("bar_group");
		//console.log(xdata.length-1);
		//console.log(xdata[xdata.length-1]);
		//console.log(server_data[xdata[xdata.length-1]][1]);
		let num = server_data[xdata[xdata.length-1]][1];
		console.log(s_data[num]);
		
		let pass_list   = {};
		let sim_list    = {};
		let fail_list   = {};
		let unknow_list = {};
		
		for (key in s_data[num]){
			//console.log(key);
			for (i in s_data[num][key]){
				//console.log(s_data[num][key][i]);
				let name = s_data[num][key][i].split("-");
				pass_list  [name[0]] = 0;
				sim_list   [name[0]] = 0;
				fail_list  [name[0]] = 0;
				unknow_list[name[0]] = 0;
			}
		}
		
		for (i in s_data[num]["pass"]){
			//console.log(s_data[num][key][i]);
			let name = s_data[num]["pass"][i].split("-");
			pass_list[name[0]] += 1;
		}
		for (i in s_data[num]["s_pass"]){
			//console.log(s_data[num][key][i]);
			let name = s_data[num]["s_pass"][i].split("-");
			pass_list[name[0]] += 1;
		}
		for (i in s_data[num]["sim"]){
			//console.log(s_data[num][key][i]);
			let name = s_data[num]["sim"][i].split("-");
			sim_list[name[0]] += 1;
		}
		for (i in s_data[num]["fail"]){
			//console.log(s_data[num][key][i]);
			let name = s_data[num]["fail"][i].split("-");
			fail_list[name[0]] += 1;
		}
		for (i in s_data[num]["s_fail"]){
			//console.log(s_data[num][key][i]);
			let name = s_data[num]["s_fail"][i].split("-");
			fail_list[name[0]] += 1;
		}
		for (i in s_data[num]["unknow"]){
			//console.log(s_data[num][key][i]);
			let name = s_data[num]["unknow"][i].split("-");
			unknow_list[name[0]] += 1;
		}
		
		//console.log(pass_list  );
		//console.log(sim_list   );
		//console.log(fail_list  );
		//console.log(unknow_list);
		
		let xx=new Array();
		let ypass=new Array();
		let yfail=new Array();
		let ysimu=new Array();
		let yunkn=new Array();
		
		
		for (key in pass_list){
			xx.push(key);
			ypass.push(pass_list[key]);
			yfail.push(fail_list[key]);
			ysimu.push(sim_list[key]);
			yunkn.push(unknow_list[key]);
			
		}
		
		chart_text = project_name+" "+sim_level+" 人员分组";
		let option = {
			title : {
				text: chart_text,
				subtext: "基于验证人员分组统计" },
			tooltip : {
				trigger: 'axis'},
			legend: {
				//itemGap:40,
				z:30,
				orient: 'vertical',
				x:'right',      //可设定图例在左、右、居中
				y:'center',     //可设定图例在上、下、居中
				padding:[0,10,0,0],   //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
				data:['pass','simulating','fail','unknow']},
			calculable : true,
			xAxis : [{
					type : 'category',
					axisLabel:{
						interval: 0
					},
					data : xx}],
			yAxis : [{
					type : 'value',
					axisLabel : {
						formatter: '{value}'}}],
			series : [
				{
					stack:'1',
					name:'pass',
					type:'bar',
					data:ypass,
					markPoint : {
						data : [
							//{type : 'max', name: '最大值'},
							//{type : 'min', name: '最小值'}
							]},
					itemStyle: {
						color: "#1F92A3",
					}

				},
				{
					stack:'1',
					name:'simulating',
					type:'bar',
					data:ysimu,
					itemStyle: {
						color: "#B9967A",
					}
				},
				{
					stack:'1',
					name:'fail',
					type:'bar',
					data:yfail,
					itemStyle: {
						color: "#C23531",
					}
				},
				{
					stack:'1',
					name:'unknow',
					type:'bar',
					data:yunkn,
					itemStyle: {
						color: "#808080",
					}
				}
			]
		};
		
	
		myChart.clear();
		myChart.setOption(option,true);
		myChart.hideLoading();
		
	}
	else if(chart_type=="sim_time"){
		//console.log("sim_time");
		//console.log(server_data[xdata[xdata.length-1][1]]);
		chart_text = project_name+" "+sim_level+" 仿真时长"
		let option = {
			title : {
				text: chart_text,
				subtext: "仿真时长分布(对数坐标)" },
			tooltip : {
				trigger: 'axis'},
			legend: {
				//itemGap:40,
				z:30,
				orient: 'vertical',
				x:'right',      //可设定图例在左、右、居中
				y:'center',     //可设定图例在上、下、居中
				padding:[0,10,0,0],   //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
				data:['数量']},
			calculable : true,
			xAxis : [{
					type : 'category',
					name : '仿真时长',
					axisLabel:{
						interval: "auto"
					},
					data : server_data["x_list"],
					axisLabel : {
						formatter: '{value}小时'}
					
					}],
			yAxis : [{

					type : 'log',
					logBase:10,
					min:1,
					axisLabel : {
						formatter: '{value}'}}],
			dataZoom: [
            
						{
							type: 'slider',
							xAxisIndex: 0,
							startValue: 0,
							endValue: 80,
							filterMode: 'empty',
							showDetail :true,
							//zoomOnMouseWheel:false,                  //如何触发缩放。可选值为：true：表示不按任何功能键，鼠标滚轮能触发缩放。false：表示鼠标滚轮不能触发缩放。'shift'：表示按住 shift 和鼠标滚轮能触发缩放。'ctrl'：表示按住 ctrl 和鼠标滚轮能触发缩放。'alt'：表示按住 alt 和鼠标滚轮能触发缩放。
							//moveOnMouseMove:false,                   //如何触发数据窗口平移。true：表示不按任何功能键，鼠标移动能触发数据窗口平移。false：表示鼠标滚轮不能触发缩放。'shift'：表示按住 shift 和鼠标移动能触发数据窗口平移。'ctrl'：表示按住 ctrl 和鼠标移动能触发数据窗口平移。'alt'：表示按住 alt 和鼠标移动能触发数据窗口平移。


						},
						
						
						
						
						
					],

			series : [
				{
					stack:'1',
					name:'数量',
					type:'bar',
					data:server_data["y_list"],
					markPoint : {
						data : [
							{type : 'max', name: '最大值'}
							//{type : 'min', name: '最小值'}
							]},
					itemStyle: {
						color: "#61A0A8",
					}

				},
				

			]
		};
		
	
		myChart.clear();
		myChart.setOption(option,true);
		myChart.hideLoading();
		
	}
	document.getElementById("header_text").innerHTML=chart_text;
};

function gen_table(numi){
	
	if(chart_type in table_case_type){
		
		if(xdata.length){
			
			let num;
			if(numi<0){
				num = server_data[xdata[xdata.length+numi]][1];
			}
			else{
				num = server_data[xdata[numi]][1];
			}
			let table_html="<table class=\"table_project\"><caption class=\"caption_time\">数据更新时间："+num+"</caption>";
			
			//console.log(num);
			
			let case_total = s_data[num]["pass"].length + s_data[num]["fail"].length + s_data[num]["sim"].length + s_data[num]["unknow"].length + s_data[num]["s_pass"].length + s_data[num]["s_fail"].length;
			let percent_ypass = Math.round((s_data[num]["pass"].length+s_data[num]["s_pass"].length)/case_total*10000)/100 + "%";
			let percent_yfail = Math.round((s_data[num]["fail"].length+s_data[num]["s_fail"].length)/case_total*10000)/100 + "%";
			let percent_ysimu = Math.round(s_data[num]["sim"].length/case_total*10000)/100 + "%";
			let percent_yunkn = Math.round(s_data[num]["unknow"].length/case_total*10000)/100 + "%";
			
			
			
			table_html += "<tr><th>pass<br>"+(s_data[num]["pass"].length+s_data[num]["s_pass"].length)+"/"+case_total+" "+percent_ypass;
			if(chart_type in table_sim_type){
				table_html += "</th><th>simulating<br>"+s_data[num]["sim"].length+"/"+case_total+" "+percent_ysimu;
			}
			table_html += "</th><th>fail<br>"+(s_data[num]["fail"].length+s_data[num]["s_fail"].length)+"/"+case_total+" "+percent_yfail+
						"</th><th>unknow<br>"+s_data[num]["unknow"].length+"/"+case_total+" "+percent_yunkn+
						"</th><th>废弃<br>不参与统计</th></tr>";
						
			let s_pass_dict={};
			let s_pass_dict_name = [];
			for (i in s_data[num]["s_pass"] ){
				let s_cast_owner_name = s_data[num]["s_pass"][i].split('-');
				//console.log(cast_owner_name);
				if(s_cast_owner_name[0] in s_pass_dict){
					s_pass_dict[s_cast_owner_name[0]].push(s_cast_owner_name[1]);
				}
				else{
					s_pass_dict_name.push(s_cast_owner_name[0]);
					s_pass_dict[s_cast_owner_name[0]] = [s_cast_owner_name[1]];
				}
			}
			
			
			let pass_dict={};
			let pass_dict_name = [];
			for (i in s_data[num]["pass"] ){
				let cast_owner_name = s_data[num]["pass"][i].split('-');
				//console.log(cast_owner_name);
				if(cast_owner_name[0] in pass_dict){
					pass_dict[cast_owner_name[0]].push(cast_owner_name[1]);
				}
				else{
					pass_dict_name.push(cast_owner_name[0]);
					pass_dict[cast_owner_name[0]] = [cast_owner_name[1]];
				}
			}
			
			//console.log(pass_dict_name);
			//console.log(pass_dict);
			
			
			table_height = Math.max((s_data[num]["pass"].length+s_data[num]["s_pass"].length),
									(s_data[num]["fail"].length+s_data[num]["s_fail"].length),
									s_data[num]["sim"].length,
									s_data[num]["unknow"].length,
									server_data["s_ignore"].length);
									
			//console.log(table_height);
			
			
			for(let i=0;i<table_height;i++){
				table_html += "<tr>";
				//if(i<s_data[num]["s_pass"].length){
				//	table_html += "<td class=\"testcase_info_p\"><a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+s_data[num]["s_pass"][i]+"\">"+s_data[num]["s_pass"][i]+"</a>"+"</td>";
				//}
				if(i<s_pass_dict_name.length){
					table_html += "<td class=\"testcase_info_p\">";
					table_html += "<span class=\"testcase_info_span\">"+s_pass_dict_name[i]+"的"+s_pass_dict[s_pass_dict_name[i]].length+"个手动pass的case</span>";
					table_html += "<div class=\"testcase_info_div\">";
					for (testcase_name in s_pass_dict[s_pass_dict_name[i]]){
						table_html += "<a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+s_pass_dict_name[i]+"-"+s_pass_dict[s_pass_dict_name[i]][testcase_name]+"\">"+s_pass_dict[s_pass_dict_name[i]][testcase_name] + "</a>";
						
					}
					
					table_html += "</div>"
					table_html += "</td>";
				}
				//else if(i<(s_data[num]["pass"].length+s_data[num]["s_pass"].length)){
				//	table_html += "<td class=\"testcase_info\"><a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+s_data[num]["pass"][i-s_data[num]["s_pass"].length]+"\">"+s_data[num]["pass"][i-s_data[num]["s_pass"].length]+"</a>"+"</td>";
				//}
				else if(i<(pass_dict_name.length+s_pass_dict_name.length)){
					table_html += "<td class=\"testcase_info\">";
					table_html += "<span class=\"testcase_info_span\">"+pass_dict_name[i-s_pass_dict_name.length]+"的"+pass_dict[pass_dict_name[i-s_pass_dict_name.length]].length+"个case</span>";
					table_html += "<div class=\"testcase_info_div\">";
					for (testcase_name in pass_dict[pass_dict_name[i-s_pass_dict_name.length]]){
						table_html += "<a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+pass_dict_name[i-s_pass_dict_name.length]+"-"+pass_dict[pass_dict_name[i-s_pass_dict_name.length]][testcase_name]+"\">"+pass_dict[pass_dict_name[i-s_pass_dict_name.length]][testcase_name] + "</a>";
						
					}
					
					table_html += "</div>"
					table_html += "</td>";
				}
				else{
					table_html += "<td>"+"</td>";
				}
				if(chart_type in table_sim_type){
					if(i<s_data[num]["sim"].length){
						table_html += "<td class=\"testcase_info\"><a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+s_data[num]["sim"][i]+"\">"+s_data[num]["sim"][i]+"</a>"+"</td>";
					}
					else{
						table_html += "<td>"+"</td>";
					}
				}
				if(i<s_data[num]["s_fail"].length){
					table_html += "<td class=\"testcase_info_f\"><a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+s_data[num]["s_fail"][i]+"\">"+s_data[num]["s_fail"][i]+"</a>"+"</td>";
				}
				else if(i<(s_data[num]["fail"].length+s_data[num]["s_fail"].length)){
					table_html += "<td class=\"testcase_info\"><a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+s_data[num]["fail"][i-s_data[num]["s_fail"].length]+"\">"+s_data[num]["fail"][i-s_data[num]["s_fail"].length]+"</a>"+"</td>";
				}
				else{
					table_html += "<td>"+"</td>";
				}
				if(i<s_data[num]["unknow"].length){
					table_html += "<td class=\"testcase_info\"><a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+s_data[num]["unknow"][i]+"\">"+s_data[num]["unknow"][i]+"</a>"+"</td>";
				}
				else{
					table_html += "<td>"+"</td>";
				}
				if(i<server_data["s_ignore"].length){
					table_html += "<td class=\"testcase_info_i\"><a class=\"testcase_info_link\" href=\"/project/"+project_name+"/"+sim_level+"/testcase/"+server_data["s_ignore"][i]+"\">"+server_data["s_ignore"][i]+"</a>"+"</td>";
				}
				else{
					table_html += "<td>"+"</td>";
				}
				
				
				table_html += "</tr>";
			}
			
			
			table_html += "</table>";
			myTable.innerHTML = table_html;
		}
		else{
			myTable.innerHTML = "<table class=\"table_project\"><caption class=\"caption_time\">暂无数据</caption></table>";
		}
	}
	else{
		let table_html="<table>";
		table_html += "<tr><td class=\"time_indo_td\">相关页面：  </td><td class=\"time_data_td\">"+"<a href=\"/heatmap/?project_name="+project_name+"&sim_level="+sim_level+"\">仿真时长热力图</a>"+"</td></tr>";
		table_html += "<tr><td class=\"time_indo_td\">总仿真数量：  </td><td class=\"time_data_td\">"+server_data["case_num"]+"个"          +"</td></tr>";
		table_html += "<tr><td class=\"time_indo_td\">总仿真时长：  </td><td class=\"time_data_td\">"+server_data["total_sim_time"]+"小时"  +"</td></tr>";
		table_html += "<tr><td class=\"time_indo_td\">仿真时长平均数：</td><td class=\"time_data_td\">"+server_data["average_sim_time"]+"小时"+"</td></tr>";
		table_html += "<tr><td class=\"time_indo_td\">仿真时长中位数：</td><td class=\"time_data_td\">"+server_data["middle_sim_time"]+"小时"+"</td></tr>";
		table_html += "<tr><td class=\"time_indo_td\">最短仿真时长：</td><td class=\"time_data_td\">"+server_data["min_sim_time"]+"小时"    +"</td></tr>";
		table_html += "<tr><td class=\"time_indo_td\">最长仿真时长：</td><td class=\"time_data_td\">"+server_data["max_sim_time"]+"小时"    +"</td></tr>";
		table_html += "<tr><td class=\"time_indo_td\">首次仿真时间：</td><td class=\"time_data_td\">"+server_data["first_time"]+"</td></tr>";
		table_html += "<tr><td class=\"time_indo_td\">末次仿真时间：</td><td class=\"time_data_td\">"+server_data["last_time"]+"</td></tr>";
		
		myTable.innerHTML = table_html;

	}
}



GetServerData(chart_type);
//GetServerData("bar_group");




window.addEventListener("resize", function () {
	myChart.resize();
});




// 监听鼠标事件
var isMouseDown = false; // 鼠标是否按下
var startX, endX; // 选区的起始位置和结束位置
var startXV, endXV; // 选区的起始位置和结束位置
var xIndex_log;
var zoom_flag=false;

myChart.getZr().on('mousedown', function (params) {
	//console.log(params.event.which);
	if (chart_type in table_update_type && params.event.which === 1) { // 鼠标左键按下
		
		startX = params.event.offsetX;
		//console.log(document.body.clientWidth);
		//console.log(startX);
		
		if(startX>document.body.clientWidth*0.05 && startX<document.body.clientWidth*0.9){
				isMouseDown = true;
				let x = params.event.offsetX; 
				let y = params.event.offsetY; 
				
				let result = myChart.convertFromPixel({                    
					seriesIndex:0,                    
					xAxisIndex:0,                
				},[x,y]);      
				
				let xAxisDataIndex= result[0];    
				
				let mix_distance;
				let calc_distance;
				let xIndex;
				for(xIndex=0;xIndex<xdata.length;xIndex++){
					calc_distance = Math.abs(xAxisDataIndex - Date.parse(server_data[xdata[xIndex]][1]));
				
					if(xIndex==0 || calc_distance<=mix_distance){
						mix_distance = calc_distance;
					}
					else{
						xIndex--;
						break;
					}
					
				}
				
				
				let xAxis = myChart.getModel().getComponent('xAxis');
				//let xNumber = xAxis.scale.parse(xIndex);
				//startX = Math.floor(myChart.convertToPixel({xAxisIndex: 0}, server_data[xdata[xIndex]][1]));
				startXV = Date.parse(server_data[xdata[xIndex]][1]);
				xIndex_log = xIndex;
		
		
		
			//console.log(startX);
			
			myChart.setOption({
				
				graphic: {
					elements: [

						{
							type: 'text',
							id: 's_label',
							left: startX-10,
							top: '8%',
							style: {
								text: 'Start',
								fill: '#FF98C3',
								fontSize: 12,
								fontWeight: 'bold',
								textAlign: 'center',
							},
							silent: true,
							z:20,
						},

						{
							type: 'text',
							id: 'e_label',
							left: startX-20,
							top: '8%',
							style: {
								text: 'End',
								fill: '#944C76',
								fontSize: 12,
								fontWeight: 'bold',
								textAlign: 'center',
							},
							silent: true,
							z:20,
						},						
						{
							type: 'line',
							id: 'x_line',
							shape: {
								x1: startX,
								y1: myChart.getHeight()/2,
								x2: startX,
								y2: myChart.getHeight()/2,
							},
							style: {
								stroke: 'rgba(127,127,127,0.25)',
								lineWidth: myChart.getHeight()*0.8,
							},
							silent: true,
							z:20,
						},
						]
					}
				});

		}
	}
});


myChart.getZr().on('mousemove', function (params) {
  if (chart_type in table_update_type && isMouseDown) { // 鼠标左键按下
    let X = params.event.offsetX;
    //updateDataZoom();
	myChart.setOption({
		
		graphic: {
			elements: [

				{

					id: 'e_label',
					left: X-10,

				},
				
				{
					id: 'x_line',
					shape: {
						x1: startX,
						y1: myChart.getHeight()/2,
						x2: X,
						y2: myChart.getHeight()/2,
					},

				},
				
			]
		}
	});
	
	}
});


myChart.getZr().on('globalout', function (params) {
	if(chart_type in table_update_type && isMouseDown){
		isMouseDown = false;
		myChart.setOption({
			graphic: {
				elements: [

					{
						id: 's_label',
						$action: 'remove',
					},

					{
						id: 'e_label',
						$action: 'remove',
					}, 
					{
						id: 'x_line',
						$action: 'remove',
					}
				]
			}
		});
	}
});


myChart.getZr().on('mouseup', function (params) {
  if (chart_type in table_update_type && params.event.which === 1 && isMouseDown) { // 鼠标左键松开
    isMouseDown = false;
    endX = params.event.offsetX;
	//console.log(endX);
	
	myChart.setOption({
		graphic: {
			elements: [

				{
					id: 's_label',
					$action: 'remove',
				},

				{
					id: 'e_label',
					$action: 'remove',
				}, 
				{
					id: 'x_line',
					$action: 'remove',
				}
			]
		}
	});
	
	if(endX>document.body.clientWidth*0.1 && endX<document.body.clientWidth*0.95){

		
			let x = params.event.offsetX; 
			let y = params.event.offsetY; 
			
			let result = myChart.convertFromPixel({                    
				seriesIndex:0,                    
				xAxisIndex:0,                
			},[x,y]);      
			
			let xAxisDataIndex= result[0];      
			//console.log(xAxisDataIndex);
			//xTimeIndex = echarts.format.formatTime('yyyy-MM-dd hh:mm:ss', xAxisDataIndex);
			
			//console.log(xTimeIndex);
			let mix_distance;
			let calc_distance;
			let xIndex;
			for(xIndex=0;xIndex<xdata.length;xIndex++){
				calc_distance = Math.abs(xAxisDataIndex - Date.parse(server_data[xdata[xIndex]][1]));
			
				if(xIndex==0 || calc_distance<=mix_distance){
					mix_distance = calc_distance;
				}
				else{
					xIndex--;
					break;
				}
				
			}

				
			//let xData= xdata.indexOf(xTimeIndex);   
			
			//console.log(xIndex);
			if(xIndex>xdata.length-1){
				xIndex=xdata.length-1
			}
			gen_table(xIndex);
			
			if(xIndex == xIndex_log){
				xIndex ++;
			}
			
			let xAxis = myChart.getModel().getComponent('xAxis');
			//let xNumber = xAxis.scale.parse(xIndex);
			//endX = Math.ceil(myChart.convertToPixel({xAxisIndex: 0}, server_data[xdata[xIndex]][1]));
			endXV = Date.parse(server_data[xdata[xIndex]][1]);
			
			
			//console.log(endX);
		
	
		
		updateDataZoom();
	}
	
  }
});

// 更新dataZoom组件
function updateDataZoom() {
	let xAxis = myChart.getModel().getComponent('xAxis').axis;
	//let startValue = xAxis.coordToData(startX);
	//let endValue = xAxis.coordToData(endX);
	
	//console.log(startX);
	//console.log(startValue);
	//console.log(endX);
	//console.log(endValue);
	
	myChart.setOption({

		dataZoom: {
			type: 'inside',
			show: false,
			zoomLock:true,
			moveOnMouseMove: false, 
			//startValue: startValue,
			//endValue: endValue			
			startValue: startXV,
			endValue: endXV
		},
		
		graphic: {
			elements: [{
				type: 'text',
				id: 'f_label',
				left: '45%',
				top: '5%',
				style: {
					text: '按F恢复',
					fill: '#11A4F8',
					fontSize: 24,
					textAlign: 'center',
				},
				silent: true,
				z:20,
			}],
		},
		
		
	});

	zoom_flag=true;
}



window.onkeypress=function(e){
	
	//console.log(e.key);
	if (chart_type in table_update_type){
		if(e.key=='f' || e.key=='F'){
			
			myChart.setOption({
		
				dataZoom: {
					type: 'inside',
					show: false,
					zoomLock:true,
					moveOnMouseMove: false, 
					startValue: Date.parse(server_data[xdata[0]][1]),
					endValue: Date.parse(server_data[xdata[xdata.length-1]][1]),
				},
				});
				
			if(zoom_flag){
				myChart.setOption({
					graphic: {
						elements: [
						{
							id: 'f_label',
							$action: 'remove',
						},
						]					
					},
				});
				zoom_flag=false;
			}
			
			gen_table(-1);
			
		}
	}
	
}



/*
myChart.getZr().on('click', function (param) {
	
	
	let x = param.offsetX; 
	let y = param.offsetY; 
	
	let result = myChart.convertFromPixel({                    
		seriesIndex:0,                    
		xAxisIndex:0,                
	},[x,y]);      
	
	let xAxisDataIndex= result[0];      
	//console.log(xAxisDataIndex);
	//xTimeIndex = echarts.format.formatTime('yyyy-MM-dd hh:mm:ss', xAxisDataIndex);
	
	//console.log(xTimeIndex);
	let mix_distance;
	let calc_distance;
	let xIndex;
	for(xIndex=0;xIndex<xdata.length;xIndex++){
		calc_distance = Math.abs(xAxisDataIndex - Date.parse(server_data[xdata[xIndex]][1]));
	
		if(xIndex==0 || calc_distance<=mix_distance){
			mix_distance = calc_distance;
		}
		else{
			xIndex--;
			break;
		}
		
	}
		
	//let xData= xdata.indexOf(xTimeIndex);   
	
	//console.log(xIndex);
	if(chart_type in table_update_type) {gen_table(xIndex);}
});

*/



//var xhr=new XMLHttpRequest();
//
//function sendData(){
//	let send_data={"unique_id":new Date().getTime(),};
//	let jsonstring = JSON.stringify (send_data)
//	xhr.open('POST', './upload', true);
//	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//	xhr.send(jsonstring);
//};
//
//xhr.addEventListener('load', function(event) {
//	console.log('已发送数据并加载响应。');
//    let JsonStr = xhr.responseText;
//	let JsonData = JSON.parse(JsonStr);
//	console.log(JsonData);
//});
//xhr.addEventListener('error', function(event) {console.log('出问题了。');});
// 
