

console.log(project_name);
console.log(sim_level);



var chart_get=new XMLHttpRequest();
var myChart = echarts.init(document.getElementById("heatmap"));

var server_data;
var step=0.02;
var size=0.02;


window.addEventListener("resize", function () {
	myChart.resize();
});



function GetServerData(){


	let url_get = "/heatmap_data/"+"?project_name="+project_name+"&sim_level="+sim_level;
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
		//console.log(server_data);
		for (key in server_data){
			server_data[key].sort(function(a, b){return a[1]-b[1]})
		}
		
		genChart();
		
		myChart.hideLoading();
		
		document.getElementById("load_pic").style.display = "none";
    }
};



function searchStrSplit(str, target) {
   return str.split(target).length - 1
}


function genChart(){
	
	let people_axis=new Array;
	let time_axis=[0];
	let heatmapData=new Array;
	let max=0;
	let a_list=new Array;
	let case_name_data={};
	
	for (key in server_data){
		people_axis.push(key);
		let j=0;
		let local_max=server_data[key][server_data[key].length-1][1];
		

		for (let i=0;i<(local_max/step);i++){
			//console.log(i)
			
			let a=0;
			let c="";
			
			for (;j<server_data[key].length;j++){
				//console.log(j)
				if(server_data[key][j][1]<=i*step+size){
					a++;
					c+=server_data[key][j][0]+","
					if(searchStrSplit(c,',')%5==0){
						c+="<br>";
					}
				}
				else{
					break;
				}
				
			}
			
			if(i>time_axis[time_axis.length-1]){
				time_axis.push(i);
			}
			
			
			if(a>0){
				if(a>max){
					max=a;
				}
				a_list.push(a);
				
				heatmapData.push([
					i,
					key,
					a,
					c
				]);
				
				
				
				if(key in case_name_data){
					case_name_data[key]++;
				}
				else{
					case_name_data[key]=0;
					//case_name_data[key]={[i]:0};
					//console.log(i);
				}
				
			}
			
		}
		
		
	}
	
	//console.log(people_axis);
	//console.log(time_axis);
	//console.log(heatmapData);
	
	people_axis.sort(function(a, b){return case_name_data[b]-case_name_data[a]});
	console.log(people_axis);
	a_list.sort(function(a, b){return a-b});
	//let range_a=a_list[Math.round(a_list.length*0.01)];
	let range_a=2;
	//let range_b=a_list[Math.round(a_list.length*0.99)];
	let range_b=a_list[a_list.length-2];
	console.log(range_a,range_b);
	console.log(a_list);
			
	let option = {
		tooltip: {
			position: 'bottom',
			formatter: function(params) {
				//console.log(case_name_data);
				//return case_name_data[params.value[1]][params.value[0]];
				return params.value[1]+" "+(params.value[0]*step).toFixed(2)+"小时<br>"+params.value[3];
			}
		},
		
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
		
		//animation: false,
		
		grid: {
			height: '70%',

		},
		
		xAxis: {
			type: 'category',
			data: time_axis,
			axisLabel:{
				formatter: function(value) {
					return (value*step).toFixed(2)+'小时';
				}
			}
		},
		
		yAxis: {
			type: 'category',
			data: people_axis,
		},
		
		visualMap: {
			min: 1,
			max: max,
			dimension: 2,
			type: 'continuous',
			range:[range_a,range_b],
			inRange:{
				//color: ['#20bfff','#F7EA15','#DD4106','#EE0000',],
				//color: ['WhiteSmoke','#B65353','Brown'],
				//color: ['#F8E9BC','#F0D99C','#C65A58','#C2484F','#BF444C',],
				color: ['#F8E9BC','#C65A58','#C2484F','#BF444C',],
				
						
			},
			outOfRange:{
				color: ['#FAFAFA','#BD2F2F',],
				
			},
			calculable: true,
			orient: 'horizontal',
			left: 'center',
			text:["最大值:"+max,"最小值:1"],
			bottom: '10%',
		},
		
		series: [{
			name: 'heatmap',
			type: 'heatmap',
			data: heatmapData,
			label: {
				show: true
			},
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowColor: 'rgba(0, 0, 0, 0.5)'
				}
			}
		}]
		};
	
	
	
	
	
	
	
	myChart.clear();
	myChart.setOption(option,true);
	
}


















GetServerData();