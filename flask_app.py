from flask import Flask,request,url_for,render_template,Response
from datetime import timedelta
import json
import sqlite3_database
import os
import logging
import time

#log = logging.getLogger('werkzeug')
#log.setLevel(logging.ERROR)

app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index.html')





@app.route('/project/<string:project_name>/<string:sim_level>/testcase/<string:testname>/')
def testcase(project_name,sim_level,testname):
	
	#return project_name+" "+sim_level+" "+testname+" 的详情页面，开发中..."
	return render_template('testcase.html',project_name=project_name,sim_level=sim_level,testname=testname)
	
	
@app.route('/tc_info/', methods=['GET'])
def tc_info():
	db_name   = request.args.get('project_name', '')
	sim_level = request.args.get('sim_level', '')
	testname = request.args.get('testname', '')
	return_data = sqlite3_database.get_tc_info(db_name,sim_level,testname)
	return_json = json.dumps(return_data)
	return return_json
		
		
	
@app.route('/project/<string:project_name>/<string:sim_level>/')
def project(project_name,sim_level):
	#print(project_name)
	#print(sim_level)
	file_list = os.listdir("./database")
	db_name = "%s.db"%(project_name)
	if(db_name in file_list):
		if(sqlite3_database.is_table_existence(db_name,sim_level)):
			return render_template('project.html',project_name=project_name,sim_level=sim_level)
		else:
			return "项目%s的%s仿真无仿真记录"%(project_name,sim_level)
	else:
		return "项目%s无仿真记录"%(project_name)
	
	
	

	
@app.route('/db_list/', methods=['GET'])
def db_list():
	dict = sqlite3_database.get_db_list()
	return_json = json.dumps(dict)
	return return_json


@app.route('/chart/<string:chart_type>/', methods=['GET'])
def chart(chart_type):
	db_name   = request.args.get('project_name', '')
	sim_level = request.args.get('sim_level', '')
	if(chart_type=="bar_state"):
		return_data = sqlite3_database.get_bar_data3(db_name,sim_level)
		return_json = json.dumps(return_data)
		return return_json
	elif(chart_type=="bar_result"):
		return_data = sqlite3_database.get_bar_data3(db_name,sim_level,'WHERE stage="sim_finish"')
		return_json = json.dumps(return_data)
		return return_json
	elif(chart_type=="bar_group"):
		#return_data = sqlite3_database.get_bar_data3(db_name,sim_level,'',True)
		return_data = sqlite3_database.get_bar_data3(db_name,sim_level,'',False)
		return_json = json.dumps(return_data)
		return return_json
	elif(chart_type=="sim_time"):
		return_data = sqlite3_database.get_sim_time(db_name,sim_level)
		return_json = json.dumps(return_data)
		return return_json


@app.route('/state_set/', methods=['GET'])
def state_set():
	db_name   = request.args.get('project_name', '')
	sim_level = request.args.get('sim_level', '')
	testname = request.args.get('testname', '')
	state_id   = request.args.get('state_id', '')
	if(state_id=="get_info"):
		return_data = sqlite3_database.special_state_get_info(db_name,sim_level,testname)
		return_json = json.dumps(return_data)
		return return_json
	elif(state_id in ["s_pass","s_fail","s_ignore"]):
		return_data = sqlite3_database.special_state_set_state(db_name,sim_level,testname,state_id)
		return_json = json.dumps(return_data)
		return return_json
	else:
		return "unsupport"
	

	
@app.route('/comment/', methods=['POST'])
def comment():
	post_data = request.get_data()
	post_data_json = json.loads(post_data.decode("utf-8"))
	sqlite3_database.insert_comment(post_data_json)
	return "comment_success"
	

@app.route('/upload/', methods=['GET', 'POST'])
def upload():
	if request.method == 'POST':
		post_data = request.get_data()
		post_data_json = json.loads(post_data.decode("utf-8"))
		db_write_data = (post_data_json["unique_id"],)
		return 'upload_success.html'
	else:
		db_write_data = (request.args.get('Q0', ''),)
		return 'upload_success.html'


@app.route('/SimulationAnalysis', methods=['GET', 'POST'])
def SimulationAnalysis():
	if request.method == 'POST':
		post_data = request.get_data()
		post_data_decode = post_data.decode("utf-8")
		data_json = json.loads(post_data_decode)
		#print(data_json)
		
		if(data_json["stage"]=="sim_start"):
			sqlite3_database.sim_start(data_json)
		elif(data_json["stage"]=="sim_finish"):
			sqlite3_database.sim_finish(data_json)
		else:
			print("ERROR: illegal stage")
		
		return "upload_success"
	else:
		return render_template('ERROR: GET is illegal operation')

@app.route('/bucket/', methods=['GET'])
def bucket():
	if request.method == 'GET':
		project_name   = request.args.get('project_name', '')
		sim_level = request.args.get('sim_level', '')
		
		return render_template('bucket.html',project_name=project_name,sim_level=sim_level)
		
@app.route('/bucket_info/', methods=['GET'])
def bucket_info():
	if request.method == 'GET':
		project_name   = request.args.get('project_name', '')
		sim_level = request.args.get('sim_level', '')
		time_st = request.args.get('time_st', '')
		time_end = request.args.get('time_end', '')
		
		return_data = sqlite3_database.get_bucket_info(project_name,sim_level,time_st,time_end)
		return_json = json.dumps(return_data)
		return return_json
	

	
@app.route('/heatmap/', methods=['GET'])
def heatmap():

	project_name   = request.args.get('project_name', '')
	sim_level      = request.args.get('sim_level', '')
	
	return render_template('heatmap.html',project_name=project_name,sim_level=sim_level)
		
		
@app.route('/heatmap_data/', methods=['GET'])
def heatmap_data():
	project_name   = request.args.get('project_name', '')
	sim_level = request.args.get('sim_level', '')
	
	return_data = sqlite3_database.get_heatmap_data(project_name,sim_level)
	return_json = json.dumps(return_data)
	return return_json
		
		
		

@app.route('/server_info/db_info/', methods=['GET'])
def server_db_info():
	file_list = os.listdir("./database")
	return_data={}
	for i in file_list:
		file = "./database/"+i
		return_data[i] = {	"name":i,
							"size":os.path.getsize(file),
							"ctime":os.path.getctime(file),
							"atime":os.path.getatime(file),
							"mtime":os.path.getmtime(file) }
		
	
	return_json = json.dumps(return_data)
	return return_json



@app.route('/server_info/', methods=['GET'])
def server_info():
	return render_template('other.html')


@app.route('/sendInfo/')
def sendInfo():
	project_name   = request.args.get('project_name', '')
	sim_level      = request.args.get('sim_level', '')
	return render_template('sendInfo.html',project_name=project_name,sim_level=sim_level)



@app.route('/stream2/')
def stream2():
	#print('--------------连接成功------------------')
	#return flask.Response(event_stream2(), mimetype="text/event-stream")
	ip_address = request.remote_addr
	return Response(event_stream2(ip_address), mimetype="text/event-stream")

def event_stream2(ip_address):
	while True:
		yield 'data: {}\n\n'.format(
			json.dumps(
				{"state": 1, "ip_address": ip_address}
			))
		time.sleep(60)



if __name__ == '__main__':

	with app.test_request_context():
		url_for('index')
		
		url_for('static', filename='echarts.js')	
		url_for('static', filename='echarts.js.map')	
		url_for('static', filename='css_style.css')
	
		url_for('static', filename='index.js')
		url_for('static', filename='project.js')	
		url_for('static', filename='testcase.js')
		url_for('static', filename='bucket.js')
		url_for('static', filename='heatmap.js')
		url_for('static', filename='other.js')
		url_for('static', filename='sendInfo.js')
		
		url_for('static', filename='favicon.ico')
		url_for('static', filename='loading_pic.gif')
		
	#app.config['debug']=True
	app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)
	app.run(host='0.0.0.0',port=5005)
	
	
