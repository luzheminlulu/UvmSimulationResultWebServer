console.log(project_name);
console.log(sim_level);
console.log(testname);

var myTable = document.getElementById("info_table");
var tc_get=new XMLHttpRequest();
var state_get=new XMLHttpRequest();
var comment_post=new XMLHttpRequest();

function GetServerData(){
	let url_get = "/tc_info?project_name="+project_name+"&sim_level="+sim_level+"&testname="+testname;
	//console.log(url_get);
	tc_get.open("GET", url_get, true);
	tc_get.send();
	document.getElementById("load_pic").style.display = "inline-block";
}
 
tc_get.onreadystatechange = function() {

    if (tc_get.readyState === 4 && tc_get.status === 200) {
        let a = tc_get.responseText
        //console.log(a)
		server_data = JSON.parse(a);
		//console.log(server_data)
		
		genTable();
		document.getElementById("load_pic").style.display = "none";
    }
};

var s_state;

function genSet(state_id){
	s_state=state_id;
	let state_url = "/state_set?project_name="+project_name+"&sim_level="+sim_level+"&testname="+testname+"&state_id="+state_id;
	//console.log(state_url);
	state_get.open("GET", state_url, true);
	state_get.send();
	document.getElementById("load_pic").style.display = "inline-block";

}

state_get.onreadystatechange = function() {

    if (state_get.readyState === 4 && state_get.status === 200) {
        let a = state_get.responseText
        //console.log(a)
        //console.log(a)
		b = JSON.parse(a);
		console.log(b);
		
		
		document.getElementById("s_state_text").innerHTML="特殊状态："+b["s_state"];
		
		if(b["s_state"]=="s_pass"){
			document.getElementById("s_pass").className="s_state_active";
			document.getElementById("s_pass").innerHTML="取消PASS";
			document.getElementById("s_fail").innerHTML="手动FAIL";
			document.getElementById("s_ignore").innerHTML="废弃CASE";
			document.getElementById("s_state_text").innerHTML="特殊状态：手动PASS";}
		else{
			document.getElementById("s_pass").className="s_state_normal";
			document.getElementById("s_pass").innerHTML="手动PASS";
			}
		
		if(b["s_state"]=="s_fail"){
			document.getElementById("s_fail").className="s_state_active";
			document.getElementById("s_pass").innerHTML="手动PASS";
			document.getElementById("s_fail").innerHTML="取消FAIL";
			document.getElementById("s_ignore").innerHTML="废弃CASE";
			document.getElementById("s_state_text").innerHTML="特殊状态：手动FAIL";}
		else{
			document.getElementById("s_fail").className="s_state_normal";
			document.getElementById("s_fail").innerHTML="手动FAIL";
			}
		
		if(b["s_state"]=="s_ignore"){
			document.getElementById("s_ignore").className="s_state_active";
			document.getElementById("s_pass").innerHTML="手动PASS";
			document.getElementById("s_fail").innerHTML="手动FAIL";
			document.getElementById("s_ignore").innerHTML="取消废弃";
			document.getElementById("s_state_text").innerHTML="特殊状态：废弃CASE";}
		else{
			document.getElementById("s_ignore").className="s_state_normal";
			document.getElementById("s_ignore").innerHTML="废弃CASE";
			}
			
		console.log(b["comment"]);
		if(b["comment"]!="None"){
			document.getElementById("info_comment").innerHTML = b["comment"];
		}
		document.getElementById("load_pic").style.display = "none";
    }
};

document.getElementById("s_pass").onclick = function(){
	genSet("s_pass");
	};
document.getElementById("s_fail").onclick = function(){
	genSet("s_fail");
	};
document.getElementById("s_ignore").onclick = function(){
	genSet("s_ignore");
	};
document.getElementById("comment").onclick = function(){


	//let x;
	//let person=prompt("请输入你的名字","Harry Potter");
	//if (person!=null && person!=""){
	//	x="你好 " + person + "! 今天感觉如何?";
	//	console.log(x);
	//}
	
	document.getElementById("input_label").style.display = "block";
	
	if (localStorage.getItem("comment_user") != null) {
	
		document.getElementById("Q0").value = localStorage.getItem('comment_user');
	}
	else{
		document.getElementById("Q0").value =  "请输入备注作者";
		console.log(chart_type);
	}
	

	};

function sendData(){
	let Q0_data = document.getElementById('Q0').value;
	let Q1_data = document.getElementById('Q1').value;
	
	if(Q0_data!="" && Q0_data!="请输入备注作者" && Q1_data!=""){
		
		localStorage.setItem('comment_user',Q0_data);
		
		
		let send_data={
			"db_file":project_name,
			"sim_level":sim_level,
			"testname":testname,
			"c_user":Q0_data,
			"c_data":Q1_data,
		};
		
		
		let jsonstring = JSON.stringify (send_data);
		comment_post.open('POST', '/comment');
		comment_post.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		comment_post.send(jsonstring);
		
		Q0_data = document.getElementById('Q1').value = "";
		document.getElementById("input_label").style.display = "none";
	}
	else{
		alert("请检查输入...");
	}

	

	
};


function CancelsendData(){
	
		document.getElementById("input_label").style.display = "none";
}

comment_post.addEventListener('load', function(event) {
	var JsonStr = comment_post.responseText;
	console.log(JsonStr);
	genSet("get_info");
});

comment_post.addEventListener('error', function(event) {
	console.log('哎呀！提交失败！');
});




function genTable(){
	
	let table_html="<table class=\"tc_info\">";
	
	table_html += 
				 "<tr><th>ID"+
				"</th><th>状态"+
				"</th><th>testcase"+
				"</th><th>用户"+
				"</th><th>服务器"+
				"</th><th style=\"min-width:100px;\">开始"+
				"</th><th style=\"min-width:100px;\">结束"+
				"</th><th>时长"+
				"</th><th>UVM_ERROR"+
				"</th><th>UVM_FATAL"+
				"</th><th>CHECK_OK!!"+
				"</th><th>data_mis"+
				"</th><th>fps_mis "+
				"</th><th>violation"+
				"</th><th>ASSERT"+
				"</th><th>路径"+
				"</th></tr>";
	
	for (key in server_data){
		table_html += "<tr>";
		table_html += "<td>"+server_data[key]["ID"               ]+"</td>";
		table_html += "<td>"+server_data[key]["stage"            ]+"</td>";
		table_html += "<td>"+server_data[key]["case_name"        ]+"</td>";
		table_html += "<td>"+server_data[key]["user_name"        ]+"</td>";
		table_html += "<td>"+server_data[key]["ip_address"       ]+"</td>";
		table_html += "<td>"+server_data[key]["sim_st_time"      ]+"</td>";
		table_html += "<td>"+server_data[key]["sim_end_time"     ]+"</td>";
		table_html += "<td>"+server_data[key]["sim_duration"     ]+"小时</td>";
		table_html += "<td>"+server_data[key]["UVM_ERROR_CNT"    ]+"</td>";
		table_html += "<td>"+server_data[key]["UVM_FATAL_CNT"    ]+"</td>";
		table_html += "<td>"+server_data[key]["CHECK_OK_CNT"     ]+"</td>";
		table_html += "<td>"+server_data[key]["data_mismatch_CNT"]+"</td>";
		table_html += "<td>"+server_data[key]["fps_mismatch_CNT" ]+"</td>";
		table_html += "<td>"+server_data[key]["violation_CNT"    ]+"</td>";
		table_html += "<td>"+server_data[key]["ASSERT_ERROR_CNT" ]+"</td>";
		table_html += "<td id=\"path_td\">"+server_data[key]["sim_path"]+"</td>";

		table_html += "</tr>";
	}
	
	table_html += "</table>";
	myTable.innerHTML = table_html;
	
	
}





genSet("get_info");
GetServerData();






