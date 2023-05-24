
from geventwebsocket.exceptions import WebSocketError
from flask import Flask
from flask_sockets import Sockets
import gevent
from gevent.queue import Queue
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
import threading
import subprocess
import re
import time
import json


app = Flask(__name__)
sockets = Sockets(app)

# 创建消息队列
# message_queue = Queue()

computer_names={
	#"luzhemin"     : {"name":"陆哲敏","pc":"127.0.0.1" ,"ip":""},
	"suchang"      : {"name":"苏畅"  ,"pc":"OA-PC-1403","ip":""},
	"luzhemin"     : {"name":"陆哲敏","pc":"OA-PC-711" ,"ip":""},
	"muxuming"     : {"name":"穆旭明","pc":"OA-PC-827" ,"ip":""},
	"yangjiajia"   : {"name":"杨佳佳","pc":"OA-PC-865" ,"ip":""},
	"yujimei"      : {"name":"余吉梅","pc":"OA-PC-695" ,"ip":""},
	"changqinhao"  : {"name":"常钦皓","pc":"OA-PC-694" ,"ip":""},
	"zhusaijuan"   : {"name":"朱赛娟","pc":"OA-PC-1117","ip":""},
	"huqixing"     : {"name":"胡起星","pc":"OA-PC-1119","ip":""},
	"shijieliang"  : {"name":"施杰梁","pc":"OA-PC-1166","ip":""},
	"guanzhichun"  : {"name":"管芷纯","pc":"OA-PC-819" ,"ip":""},
	"liangbaojian" : {"name":"梁宝健","pc":"OA-PC-1262","ip":""},
	"wangguan"     : {"name":"王冠"  ,"pc":"OA-PC-1401","ip":""},
	"zhangqi"      : {"name":"张琪"  ,"pc":"OA-PC-1370","ip":""},
	"zhaxuepeng"   : {"name":"查学鹏","pc":"OA-PC-1467","ip":""},
	"xielicheng"   : {"name":"谢礼丞","pc":"OA-PC-1130","ip":""},
	"liuxiang"     : {"name":"刘祥"  ,"pc":"OA-PC-1561","ip":""},
	"xiajiaoyuan"  : {"name":"夏姣园","pc":"OA-PC-1568","ip":""},

}

people_names = {}
ws_list={}

messages={}



def get_ip_address():
	while(1):
		for key in computer_names:
			ping_process = subprocess.Popen('ping -4 -n 1 '+computer_names[key]["pc"]+'.icrdwin.com', shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
			output = ping_process.stdout.read().decode('cp936')
			
			#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),output)
			ip_address = re.search(r'\d+\.\d+\.\d+\.\d+', output)
			if(ip_address):
				computer_names[key]["ip"] = ip_address.group(0)
				people_names[ip_address.group(0)] = key
				#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),ip_address.group(0))
			else:
				computer_names[key]["ip"] = "unknow"
				#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),f'无法找到 {computer_names[key]["pc"]}')
		for key in computer_names:
			print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),computer_names[key])
		#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),people_names)
		time.sleep(7200)

def get_name(ip_address):
	if(ip_address in people_names):
		username_eng = people_names[ip_address]
		username_chs = computer_names[people_names[ip_address]]["name"]
	else:
		username_eng = ip_address
		username_chs = f"来自{ip_address}的用户"
	return username_eng,username_chs
	
def send_messages(ws, uid, ip_address):
	#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),username_eng)
	#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),username_chs)

	gevent.sleep(1)
	try:
		while not ws.closed:
			#message = message_queue.get()
			
			username_eng,username_chs = get_name(ip_address)
			
			#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),ws_list)
			if(ws_list[uid]['state']=='send_info'):
			
				p = set()
				for key in ws_list:
					if(ws_list[key]['ip'] in people_names):
						p.add(people_names[ws_list[key]['ip']])
					else:
						p.add(ws_list[key]['ip'])
				#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),p)
				dict_tmp = {}
				for i in p:
					if(i in computer_names):
						dict_tmp[i]=computer_names[i]['name']
					else:
						dict_tmp[i]=i
				
				send_data = json.dumps({
					"type":'update_ws_people',
					"data":dict_tmp,
				})
				ws.send(send_data)
				
				send_data = json.dumps({
					"type":'update_message_state',
					"data":messages,
				})
				ws.send(send_data)
				
					
				
			#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),"messages",messages)
			if(username_eng in messages):
				#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),"username_eng",username_eng)
				if(messages[username_eng]['state']=='待推送'):
					#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),username_eng,"send")
					send_data = json.dumps({
						"type":'show_message',
						"message":messages[username_eng]['message'],
					})
					ws.send(send_data)
					messages[username_eng]['state']='已推送'
			
			gevent.sleep(5)
	except:
		return

def receive_messages(ws, uid, ip_address):

	gevent.sleep(0.5)
	try:
		while not ws.closed:
			
			username_eng,username_chs = get_name(ip_address)
			
			message = ws.receive()
			if message is not None:
				#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),f"Received message: {message}")
				#message_queue.put(message)
				jsondata = json.loads(message)
				#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),'jsondata',jsondata)
				if('state' in jsondata):
					if(jsondata['state']=="open"):
						print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),username_chs,jsondata['url'])
					elif(jsondata['state']=="send_message"):
						print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),username_chs,'send_message',jsondata)
						for name in jsondata["message"]['people']:
							#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),jsondata["message"][name])
							messages[name]={'message':jsondata["message"][name],'state':'待推送'}
						#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),"messages_receice",messages)
						send_data = json.dumps({
							"type":'update_message_state',
							"data":messages,
						})
						ws.send(send_data)
					elif(jsondata['state']=="confirm"):
						messages[username_eng]['state']=jsondata['result']
					else:
						ws_list[uid]['state']=jsondata['state']
				else:
					print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),username_chs,"Unsupport json",jsondata)
				
	except:
		return


@sockets.route('/echo/')
def echo_socket(ws):
	# 获取客户端 IP 地址
	ip_address = ws.environ.get('REMOTE_ADDR')
	#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),f"Client IP address: {ip_address}")
	
	uid = "%s-%s"%(ip_address,time.time())
	#print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),uid)

	
	print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),f"Accepted connection from {ip_address}")
	ws_list[uid]={'state':'','ip':ip_address}
	
	g1 = gevent.spawn(send_messages, ws, uid, ip_address)
	g2 = gevent.spawn(receive_messages, ws, uid, ip_address)

	g1.join()
	g2.join()
	
	ws_list.pop(uid)
	
	#receive_thread = threading.Thread(target=receive_messages, args=(ws,))
	#send_thread = threading.Thread(target=send_messages, args=(ws,))
	#receive_thread.start()
	#send_thread.start()
	#receive_thread.join()
	#send_thread.join()

	print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),f"Closed connection from {ip_address}")	

if __name__ == '__main__':
	threading.Thread(target=get_ip_address, args=()).start()
	server = pywsgi.WSGIServer(('0.0.0.0', 5010), app, handler_class=WebSocketHandler)
	print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),'WebSocket Start')
	server.serve_forever()
