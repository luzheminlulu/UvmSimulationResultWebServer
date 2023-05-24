

var db_HTML = document.getElementById('data_base_list') ;

var JsonData;

var xhr=new XMLHttpRequest();
xhr.open("GET", "./db_list", true);
xhr.send();




xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let JsonStr = xhr.responseText
        //console.log(JsonStr)
		JsonData = JSON.parse(JsonStr);
		console.log(JsonData);
		
		let db_li="<ul>" 
		for (key in JsonData) {
			db_li += "<li><a href=\"project/"+JsonData[key]+"\">"+JsonData[key]+"</a></li>"
		}
		db_li += "</ul>"

		
		db_HTML.innerHTML = db_li;
		document.getElementById("load_pic").style.display = "none";
    }

}

