import sqlite3
import time
import datetime
import os
import copy


db_create_word='''
(
ID INTEGER PRIMARY KEY AUTOINCREMENT,
unique_id         TEXT,
SPECIAL_STATE     TEXT,
stage             TEXT,
project_name      TEXT,
case_name         TEXT,
case_owner        TEXT,
user_name         TEXT,
ip_address        TEXT,
sim_path          TEXT,
sim_level         TEXT,
sim_st_time       TEXT,
sim_end_time      TEXT,
sim_duration      REAL,
UVM_ERROR_CNT     INTEGER,
UVM_FATAL_CNT     INTEGER,
CHECK_OK_CNT      INTEGER,
data_mismatch_CNT INTEGER,
fps_mismatch_CNT  INTEGER,
violation_CNT     INTEGER,
ASSERT_ERROR_CNT  INTEGER,
comment_data      TEXT
);'''



u_ID                = 0 
u_unique_id         = 1 
u_SPECIAL_STATE     = 2 
u_stage             = 3 
u_project_name      = 4 
u_case_name         = 5 
u_case_owner        = 6 
u_user_name         = 7 
u_ip_address        = 8 
u_sim_path          = 9 
u_sim_level         = 10
u_sim_st_time       = 11
u_sim_end_time      = 12
u_sim_duration      = 13
u_UVM_ERROR_CNT     = 14
u_UVM_FATAL_CNT     = 15
u_CHECK_OK_CNT      = 16
u_data_mismatch_CNT = 17
u_fps_mismatch_CNT  = 18
u_violation_CNT     = 19
u_ASSERT_ERROR_CNT  = 20
u_comment_data      = 21

def DB_INSERT(db_file,db_name,db_data):
	try:
		con=sqlite3.connect(db_file)
		cur=con.cursor()
		
		#cur.execute('INSERT INTO ur_track_db VALUES (%s)'%db_data) #string
		cur.execute(''' INSERT INTO %s 
						VALUES (?,?,?,?,?,?,?,?,?,?,?);'''%(db_name),
						db_data) #set (a,b,c,d)
		#cur.executemany('INSERT INTO ur_track_db VALUES (?,?,?,?)',[(3,'name3',19,"{'aa':344}"),(4,'name4',26,"{'aa':344}")])
		
		
		
		con.commit()
	
		cur.close()
		con.close()
		
		return True
	except:
		return False


def DB_UPDATE(db_file,db_name,db_data):
	try:
		con=sqlite3.connect(db_file)
		cur=con.cursor()
		
		#cur.execute("UPDATE test SET name='haha' WHERE id=1")
		cur.execute(''' UPDATE %s 
						SET Q0=?,Q1=?,Q2=?,Q3=?,Q4=?,Q5=?,Q6=?,Q7=?,Q8=?,Q9=? 
						WHERE unique_id=?;'''%(db_name),
					(db_data[1],db_data[1],db_data[2],db_data[3],db_data[4],db_data[5],db_data[6],db_data[7],db_data[8],db_data[9],
					db_data[0]))
		
		con.commit()
	
		cur.close()
		con.close()

		return True
	except:
		return False


def DB_SELECT(db_file,db_name,condition=""):
	try:
		con=sqlite3.connect(db_file)
		cur=con.cursor()
		
		if condition:
			select_data = cur.execute('''   SELECT * 
											FROM %s 
											WHERE %s;'''%(db_name,condition))
		else:
			select_data = cur.execute('''   SELECT * 
											FROM %s;'''%(db_name))
		#print(select_data)
		return_data={}
		for i in select_data:
			return_data[i[0]]=i
			#print(i)
		
		con.commit()
	
		cur.close()
		con.close()
		
		return return_data
	except:
		return False
		
		
def DB_DELETE(db_file,db_name,ID):
	try:
		con=sqlite3.connect(db_file)
		cur=con.cursor()
		
		cur.execute(''' DELETE FROM %s
						WHERE ID=?; '''%(db_name),
						(ID,)
						)
		
		con.commit()
	
		cur.close()
		con.close()
		return True
	except:
		return False

	
def sim_start(data_json):
	try:
		#print("sim_start")
		db_file = "./database/%s.db"%(data_json["project_name"])
		db_name = "%s"%data_json["sim_level"]
		
		con=sqlite3.connect(db_file)
		cur=con.cursor()
		cur.execute('''CREATE TABLE IF NOT EXISTS %s '''%(db_name)+db_create_word)
		
		spe_s = special_state_get_info(data_json["project_name"],data_json["sim_level"],"%s-%s"%(data_json["case_owner"],data_json["case_name"]))
		
		#cur.execute('INSERT INTO ur_track_db VALUES (%s)'%db_data) #string
		cur.execute(''' SELECT * 
						FROM %s 
						WHERE unique_id="%s";'''%(db_name,data_json["unique_id"]))
										
		result = cur.fetchone()
		#print(result)
		
		if(result):
			cur.execute(''' UPDATE %s 
							SET 
								stage        ="%s",
								project_name ="%s",
								case_owner   ="%s",
								case_name    ="%s",
								user_name    ="%s",
								ip_address   ="%s",
								sim_path    ="%s",
								sim_level    ="%s",
								sim_st_time  ="%s"
							WHERE unique_id  ="%s";'''%(
							db_name,
							data_json["stage"],
							data_json["project_name"],
							data_json["case_owner"],
							data_json["case_name"],
							data_json["user_name"],
							data_json["ip_address"],
							data_json["sim_path"],
							data_json["sim_level"],
							time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),
							data_json["unique_id"]
						))
			#print("UPDATE SUCCESS")
		else:
			cur.execute(''' INSERT INTO %s 
								( unique_id,stage,project_name,case_owner,case_name,user_name,ip_address,sim_path,sim_level,sim_st_time)
							VALUES (      "%s", "%s",        "%s",      "%s",     "%s",     "%s",      "%s",    "%s",     "%s",       "%s");'''%(
						db_name,
						data_json["unique_id"],
						data_json["stage"],
						data_json["project_name"],
						data_json["case_owner"],
						data_json["case_name"],
						data_json["user_name"],
						data_json["ip_address"],
						data_json["sim_path"],
						data_json["sim_level"],
						time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
						))
						
			#print("INSERT SUCCESS")
			
		if(spe_s["s_state"]!="None"):
			cur.execute(''' UPDATE %s 
							SET SPECIAL_STATE="%s"
							WHERE unique_id="%s";
							'''%(db_name,spe_s["s_state"],data_json["unique_id"]))
		
		con.commit()
		
		cur.close()
		con.close()
		
		
		#print(spe_s)
	
		
		return True
	except:
		cur.close()
		con.close()
		print("sim_start Error")
		return

def sim_finish(data_json):
	try:
		#print("sim_finish")
		db_file = "./database/%s.db"%(data_json["project_name"])
		db_name = "%s"%data_json["sim_level"]
		
		con=sqlite3.connect(db_file)
		cur=con.cursor()
		cur.execute('''CREATE TABLE IF NOT EXISTS %s '''%(db_name)+db_create_word)
		
		spe_s = special_state_get_info(data_json["project_name"],data_json["sim_level"],"%s-%s"%(data_json["case_owner"],data_json["case_name"]))
		
		#cur.execute('INSERT INTO ur_track_db VALUES (%s)'%db_data) #string
		cur.execute(''' SELECT * 
						FROM %s 
						WHERE unique_id="%s";'''%(db_name,data_json["unique_id"]))
										
		result = cur.fetchone()
		#print(result)
		
		if(result):
			
			sim_duration = (datetime.datetime.now()-datetime.datetime.strptime(result[u_sim_st_time],'%Y-%m-%d %H:%M:%S')).total_seconds()/3600
			
			cur.execute(''' UPDATE %s 
							SET 
								stage         = "%s",
								project_name  = "%s",
								case_owner    = "%s",
								case_name     = "%s",
								user_name     = "%s",
								ip_address    = "%s",
								sim_path      = "%s",
								sim_level     = "%s",
								sim_end_time  = "%s",
								sim_duration  = %f,
								UVM_ERROR_CNT    = %d,
								UVM_FATAL_CNT    = %d,
								CHECK_OK_CNT     = %d,
								data_mismatch_CNT= %d,
								fps_mismatch_CNT = %d,
								violation_CNT    = %d,
								ASSERT_ERROR_CNT = %d
							WHERE unique_id  ="%s";'''%(
							db_name,
							data_json["stage"],
							data_json["project_name"],
							data_json["case_owner"],
							data_json["case_name"],
							data_json["user_name"],
							data_json["ip_address"],
							data_json["sim_path"],
							data_json["sim_level"],
							time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),
							sim_duration,
							data_json["UVM_ERROR_CNT"], 
							data_json["UVM_FATAL_CNT"], 
							data_json["CHECK_OK_CNT"],
							data_json["data_mismatch_CNT"],
							data_json["fps_mismatch_CNT"],
							data_json["violation_CNT"],
							data_json["ASSERT_ERROR_CNT"],
							data_json["unique_id"]
						))
			#print("UPDATE SUCCESS")
		else:
			cur.execute(''' INSERT INTO %s 
								( unique_id,stage,project_name,case_owner,case_name,user_name,ip_address,sim_path,sim_level,sim_end_time,
									UVM_ERROR_CNT,UVM_FATAL_CNT,CHECK_OK_CNT,data_mismatch_CNT,fps_mismatch_CNT,violation_CNT,ASSERT_ERROR_CNT  )
							VALUES (      "%s", "%s",        "%s",      "%s",     "%s",     "%s",      "%s",    "%s",     "%s",       "%s",
											%d,           %d,          %d,               %d,              %d,           %d,              %d
							);'''%(
						db_name,
						data_json["unique_id"],
						data_json["stage"],
						data_json["project_name"],
						data_json["case_owner"],
						data_json["case_name"],
						data_json["user_name"],
						data_json["ip_address"],
						data_json["sim_path"],
						data_json["sim_level"],
						time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),
						data_json["UVM_ERROR_CNT"], 
						data_json["UVM_FATAL_CNT"], 
						data_json["CHECK_OK_CNT"],
						data_json["data_mismatch_CNT"],
						data_json["fps_mismatch_CNT"],
						data_json["violation_CNT"],
						data_json["ASSERT_ERROR_CNT"],
						))
						
			#print("INSERT SUCCESS")
			
		if(spe_s["s_state"]!="None"):
			cur.execute(''' UPDATE %s 
							SET SPECIAL_STATE="%s"
							WHERE unique_id="%s";
							'''%(db_name,spe_s["s_state"],data_json["unique_id"]))
		con.commit()
		
		cur.close()
		con.close()
		
		#spe_s = special_state_get_info(data_json["project_name"],db_name,"%s-%s"%(data_json["case_owner"],data_json["case_name"]))
		#print(spe_s)
		#if(spe_s!="None"):
		#	special_state_set_state(data_json["project_name"],db_name,"%s-%s"%(data_json["case_owner"],data_json["case_name"]),spe_s)
		#	
		return True
	except:
		cur.close()
		con.close()
		print("sim_finish Error")
		return

def get_db_list():
	try:
		file_list = os.listdir("./database")
		#print(file_list)
		k=0
		return_data={}
		for i in file_list:
			fname,ext = os.path.splitext(i)
			con=sqlite3.connect("./database/%s"%(i))
			cur=con.cursor()
			
			cur.execute(''' SELECT name FROM sqlite_master WHERE name IS NOT "sqlite_sequence" ''')
	
			result = cur.fetchall()
			#print(result)
			
			if(result):
				for j in result:
					return_data[k]="%s/%s"%(fname,''.join(j))
					k+=1
			
			
			
			cur.close()
			con.close()
		
		#print(return_data)
			
		return return_data
	except:
		cur.close()
		con.close()
		print("get_db_list Error")
		return
	
def is_table_existence(db_name,table_name):
	try:
		con=sqlite3.connect("./database/%s"%(db_name))
		cur=con.cursor()
		
		cur.execute(''' SELECT name FROM sqlite_master ''')
	
		result = cur.fetchall()
		cur.close()
		con.close()
		
		#print(result)
		for i in range(len(result)):
			result[i] = ''.join(result[i])
		
		
		if(table_name in result):
			return True
		else:
			return False
	except:
		cur.close()
		con.close()
		print("is_table_existence Error")
		return

def bar_data_set_2_dict(pass_set,fail_set,simulating_set,unknow_set,s_pass_set,s_fail_set,s_ignore_set):
	pass_list        = list(pass_set      )
	fail_list        = list(fail_set      )
	simulating_list  = list(simulating_set)
	unknow_list      = list(unknow_set    )
	s_pass_list      = list(s_pass_set      )
	s_fail_list      = list(s_fail_set      )
	s_ignore_list    = list(s_ignore_set    )
	
	pass_list.sort()
	fail_list.sort()
	simulating_list.sort()
	unknow_list.sort()
	s_pass_list.sort()
	s_fail_list.sort()
	s_ignore_list.sort()
	

	return {"pass":copy.deepcopy(pass_list),
			"fail":copy.deepcopy(fail_list),
			"sim":copy.deepcopy(simulating_list),
			"unknow":copy.deepcopy(unknow_list),
			"s_pass":copy.deepcopy(s_pass_list),
			"s_fail":copy.deepcopy(s_fail_list),
			"s_ignore":copy.deepcopy(s_ignore_list)}
	

def get_bar_data(db_name,table_name,where="",only_last=False):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		cur.execute(''' SELECT * 
						FROM %s
						%s;
						'''%(table_name,where))
	
		result = cur.fetchall()
		cur.close()
		con.close()
		
		dict = {"time_list":[]}
		
		if(result):
			
			pass_set       = set()
			fail_set       = set()
			simulating_set = set()
			unknow_set     = set()
			s_pass_set     = set()
			s_fail_set     = set()
			s_ignore_set   = set()
			for i in result:
				testcase = i[u_case_owner]+"-"+i[u_case_name]
				#testcase = i[u_case_name]
				if(i[u_SPECIAL_STATE]=="s_ignore"):
					pass_set.discard(testcase)
					fail_set.discard(testcase)
					unknow_set.discard(testcase)
					simulating_set.discard(testcase)
					s_pass_set.discard(testcase)
					s_fail_set.discard(testcase)
					s_ignore_set.add(testcase)
					
					if(not only_last):
						dict["time_list"].append(i[u_sim_st_time])
						dict[i[u_sim_st_time]]=bar_data_set_2_dict(pass_set,fail_set,simulating_set,unknow_set,s_pass_set,s_fail_set,s_ignore_set)
						
						
				elif(i[u_stage]=="sim_start"):
					pass_set.discard(testcase)
					fail_set.discard(testcase)
					unknow_set.discard(testcase)
					simulating_set.add(testcase)
					s_pass_set.discard(testcase)
					s_fail_set.discard(testcase)
					s_ignore_set.discard(testcase)
					
					if(not only_last):
						dict["time_list"].append(i[u_sim_st_time])
						dict[i[u_sim_st_time]]=bar_data_set_2_dict(pass_set,fail_set,simulating_set,unknow_set,s_pass_set,s_fail_set,s_ignore_set)
				elif(i[u_SPECIAL_STATE]):
					#print(testcase)
					pass_set.discard(testcase)
					fail_set.discard(testcase)
					unknow_set.discard(testcase)
					simulating_set.discard(testcase)
					
					if(i[u_SPECIAL_STATE]=="s_pass"):
						s_pass_set.add(testcase)
						s_fail_set.discard(testcase)
						s_ignore_set.discard(testcase)
					elif(i[u_SPECIAL_STATE]=="s_fail"):
						s_pass_set.discard(testcase)
						s_fail_set.add(testcase)
						s_ignore_set.discard(testcase)
					else:
						s_pass_set.discard(testcase)
						s_fail_set.discard(testcase)
						s_ignore_set.add(testcase)
					
					if(not only_last):
						dict["time_list"].append(i[u_sim_end_time])
						dict[i[u_sim_end_time]]=bar_data_set_2_dict(pass_set,fail_set,simulating_set,unknow_set,s_pass_set,s_fail_set,s_ignore_set)
												
				else:
	
					pass_set.discard(testcase)
					fail_set.discard(testcase)
					unknow_set.discard(testcase)
					simulating_set.discard(testcase)
					
					if( (i[u_UVM_ERROR_CNT]-i[u_fps_mismatch_CNT])==0 and
						i[u_UVM_FATAL_CNT]==0 and
						i[u_data_mismatch_CNT]==0 and
						#i[u_fps_mismatch_CNT]==0 and
						i[u_violation_CNT]==0 and
						i[u_ASSERT_ERROR_CNT]==0 ):
						if(i[u_CHECK_OK_CNT]>0):
							pass_set.add(testcase)
						else:
							unknow_set.add(testcase)
					else:
						fail_set.add(testcase)
					
					if(not only_last):
						dict["time_list"].append(i[u_sim_end_time])
						dict[i[u_sim_end_time]]=bar_data_set_2_dict(pass_set,fail_set,simulating_set,unknow_set,s_pass_set,s_fail_set,s_ignore_set)
			#print(dict)
			if(only_last):
				if(i[u_sim_end_time]):
					dk = i[u_sim_end_time]
				else:
					dk = i[u_sim_st_time]
				dict["time_list"].append(dk)
				dict[dk]=bar_data_set_2_dict(pass_set,fail_set,simulating_set,unknow_set,s_pass_set,s_fail_set,s_ignore_set)
			
			#dict["time_list"] = sorted(dict["time_list"],key = lambda t : datetime.datetime.strptime(t,'%Y-%m-%d %H:%M:%S'))
	
		return dict
	except:
		cur.close()
		con.close()
		print("get_bar_data Error")
		return


def get_bar_data2(db_name,table_name,where="",only_last=False):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		cur.execute(''' SELECT * 
						FROM %s
						%s;
						'''%(table_name,where))
	
		result = cur.fetchall()
		cur.close()
		con.close()
		
		dict = {"time_list":[]}
		
		if(result):
			bar_num = 800
			
			if(result[0][u_sim_st_time]):
				total_time_st  = datetime.datetime.strptime(result[0][u_sim_st_time],'%Y-%m-%d %H:%M:%S')
			else:
				total_time_st  = datetime.datetime.strptime(result[0][u_sim_end_time],'%Y-%m-%d %H:%M:%S')
				
			sim_end_time_list=[]
			for i in result:
				if(i[u_sim_end_time]):
					sim_end_time_list.append(datetime.datetime.strptime(i[u_sim_end_time],'%Y-%m-%d %H:%M:%S'))
				else:
					sim_end_time_list.append(datetime.datetime.strptime(i[u_sim_st_time],'%Y-%m-%d %H:%M:%S'))
			
			total_time_end = max(sim_end_time_list)
			
			#print(total_time_st)
			#print(total_time_end)
			#print((total_time_end-total_time_st).total_seconds())
			
			total_time_step = (total_time_end-total_time_st).total_seconds()/bar_num
			#print(total_time_step)
			for i in range(bar_num):
				t = total_time_st+datetime.timedelta(seconds=i*total_time_step)
				dict["time_list"].append(
					t.strftime("%Y-%m-%d %H:%M:%S")
				)
			dict["time_list"].append(total_time_end.strftime("%Y-%m-%d %H:%M:%S"))
			dict["time_list"].append((total_time_end+datetime.timedelta(seconds=1)).strftime("%Y-%m-%d %H:%M:%S"))
			dict["time_list"].append((total_time_end+datetime.timedelta(seconds=2)).strftime("%Y-%m-%d %H:%M:%S"))
			dict["time_list"].append((total_time_end+datetime.timedelta(seconds=3)).strftime("%Y-%m-%d %H:%M:%S"))
			dict["time_list"].append((total_time_end+datetime.timedelta(seconds=4)).strftime("%Y-%m-%d %H:%M:%S"))
			dict["time_list"].append((total_time_end+datetime.timedelta(seconds=5)).strftime("%Y-%m-%d %H:%M:%S"))
			#dict["time_list"].append(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())))
			#print(dict["time_list"])
			
			for i in dict["time_list"]:
				dict[i]={
							"pass"    :set(),
							"fail"    :set(),
							"sim"     :set(),
							"unknow"  :set(),
							"s_pass"  :set(),
							"s_fail"  :set(),
							"s_ignore":set(),
						}
			flag = [True,0]
			
			for i in result:
				testcase = i[u_case_owner]+"-"+i[u_case_name]

					
				flag[0] = True
				for m in range(flag[1],len(dict["time_list"])):
					j=dict["time_list"][m]
					if(i[u_SPECIAL_STATE]=="s_ignore"):
						dict[j]["pass"    ].discard(testcase)
						dict[j]["fail"    ].discard(testcase)
						dict[j]["sim"     ].discard(testcase)
						dict[j]["unknow"  ].discard(testcase)
						dict[j]["s_pass"  ].discard(testcase)
						dict[j]["s_fail"  ].discard(testcase)
						dict[j]["s_ignore"].add(testcase)
					elif(i[u_stage]=="sim_start"):
						if(j>=i[u_sim_st_time]):
							if(flag[0]):
								flag[1] = m
								flag[0] = False
							dict[j]["pass"    ].discard(testcase)
							dict[j]["fail"    ].discard(testcase)
							dict[j]["sim"     ].add(testcase)
							dict[j]["unknow"  ].discard(testcase)
							dict[j]["s_pass"  ].discard(testcase)
							dict[j]["s_fail"  ].discard(testcase)

					elif(i[u_SPECIAL_STATE]):
						if(i[u_sim_end_time]):
							dict[j]["pass"    ].discard(testcase)
							dict[j]["fail"    ].discard(testcase)
							dict[j]["sim"     ].discard(testcase)
							dict[j]["unknow"  ].discard(testcase)
							
							if(i[u_SPECIAL_STATE]=="s_pass"):
								dict[j]["s_pass"  ].add(testcase)
								dict[j]["s_fail"  ].discard(testcase)
							elif(i[u_SPECIAL_STATE]=="s_fail"):
								dict[j]["s_pass"  ].discard(testcase)
								dict[j]["s_fail"  ].add(testcase)
							else:
								dict[j]["s_pass"  ].discard(testcase)
								dict[j]["s_pass"  ].discard(testcase)
								dict[j]["s_ignore"].add(testcase)
						elif(i[u_sim_st_time] and j>=i[u_sim_st_time] and flag[0]):
							flag[1] = m
							flag[0] = False
					else:
						if(j>=i[u_sim_end_time]):

							dict[j]["pass"    ].discard(testcase)
							dict[j]["fail"    ].discard(testcase)
							dict[j]["sim"     ].discard(testcase)
							dict[j]["unknow"  ].discard(testcase)
							if( (i[u_UVM_ERROR_CNT]-i[u_fps_mismatch_CNT])==0 and
								i[u_UVM_FATAL_CNT]==0 and
								i[u_data_mismatch_CNT]==0 and
								#i[u_fps_mismatch_CNT]==0 and
								i[u_violation_CNT]==0 and
								i[u_ASSERT_ERROR_CNT]==0 ):
								if(i[u_CHECK_OK_CNT]>0):
									dict[j]["pass"    ].add(testcase)
								else:
									dict[j]["unknow"  ].add(testcase)
							else:
								dict[j]["fail"    ].add(testcase)
						elif(where=="" and i[u_sim_st_time] and j>=i[u_sim_st_time]):
							if(flag[0]):
								flag[1] = m
								flag[0] = False
							dict[j]["pass"    ].discard(testcase)
							dict[j]["fail"    ].discard(testcase)
							dict[j]["sim"     ].add(testcase)
							dict[j]["unknow"  ].discard(testcase)


			for i in dict["time_list"]:
				dict[i]["pass"    ] = list(dict[i]["pass"    ])
				dict[i]["fail"    ] = list(dict[i]["fail"    ])
				dict[i]["sim"     ] = list(dict[i]["sim"     ])
				dict[i]["unknow"  ] = list(dict[i]["unknow"  ])
				dict[i]["s_pass"  ] = list(dict[i]["s_pass"  ])
				dict[i]["s_fail"  ] = list(dict[i]["s_fail"  ])
				dict[i]["s_ignore"] = list(dict[i]["s_ignore"])
				
				
				dict[i]["pass"    ].sort()
				dict[i]["fail"    ].sort()
				dict[i]["sim"     ].sort()
				dict[i]["unknow"  ].sort()
				dict[i]["s_pass"  ].sort()
				dict[i]["s_fail"  ].sort()
				dict[i]["s_ignore"].sort()
			
			if(only_last):
				dict["time_list"] = [dict["time_list"][-1],]
		return dict
	except:
		cur.close()
		con.close()
		print("get_bar_data2 Error")
		return
	
def get_bar_data3(db_name,table_name,where="",only_last=False):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		cur.execute(''' SELECT * 
						FROM %s
						%s;
						'''%(table_name,where))
	
		result = cur.fetchall()
		cur.close()
		con.close()
		
		dict = {"time_list":[]}
		dict.update({"s_ignore":set()})
		
		if(result):
			
			for i in result:
				testcase = i[u_case_owner]+"-"+i[u_case_name]
				if(i[u_SPECIAL_STATE]=="s_ignore"):
					dict["s_ignore"].add(testcase)
				else:
					if(where=="" and i[u_sim_st_time]):
						keyId = i[u_sim_st_time]+"+"+str(i[u_ID])
						dict["time_list"].append(keyId)
						dict[keyId]=[testcase,i[u_sim_st_time],"sim"]
					if(i[u_sim_end_time]):
						keyId = i[u_sim_end_time]+"+"+str(i[u_ID])
						if(i[u_SPECIAL_STATE]):
							dict["time_list"].append(keyId)
							dict[keyId] = [testcase,i[u_sim_end_time],i[u_SPECIAL_STATE]]
						else:
							dict["time_list"].append(keyId)
							if( (i[u_UVM_ERROR_CNT]-i[u_fps_mismatch_CNT])==0 and
								i[u_UVM_FATAL_CNT]==0 and
								i[u_data_mismatch_CNT]==0 and
								#i[u_fps_mismatch_CNT]==0 and
								i[u_violation_CNT]==0 and
								i[u_ASSERT_ERROR_CNT]==0 ):
								if(i[u_CHECK_OK_CNT]>0):
									dict[keyId] = [testcase,i[u_sim_end_time],"pass"]
								else:
									dict[keyId] = [testcase,i[u_sim_end_time],"unknow"]
							else:
								dict[keyId]  =[testcase,i[u_sim_end_time],"fail"]
				
			dict["s_ignore"] = list(dict["s_ignore"])
			dict["s_ignore"].sort()
			dict["time_list"].sort()
			
			
			if(only_last):
				dict["time_list"] = [dict["time_list"][-1],]
				
		#print(dict)
		return dict
	except:
		cur.close()
		con.close()
		print("get_bar_data3 Error")
		return
		
		
		
		
def get_sim_time(db_name,table_name):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		cur.execute(''' SELECT sim_duration 
						FROM %s
						'''%(table_name))
	
		result = cur.fetchall()
	
		cur.close()
		con.close()
		
		#print(result)
		if(result):
			time_list=[]
			for i in result:
				if(i[0]):
					time_list.append(i[0])
					
			#print(time_list)
			
			if(time_list):
				con=sqlite3.connect("./database/%s.db"%(db_name))
				cur=con.cursor()
				
				cur.execute(''' SELECT case_owner,case_name 
								FROM %s
								WHERE sim_duration="%s"
								'''%(table_name,min(time_list)))
			
				min_case = cur.fetchall()
				
				cur.execute(''' SELECT case_owner,case_name 
								FROM %s
								WHERE sim_duration="%s"
								'''%(table_name,max(time_list)))
			
				max_case = cur.fetchall()
				
				cur.execute(''' SELECT sim_st_time,sim_end_time
								FROM %s
								ORDER BY ID ASC
								LIMIT 1
								'''%(table_name))
								
				first_time = cur.fetchall()
						
				cur.execute(''' SELECT sim_st_time,sim_end_time
								FROM %s
								ORDER BY ID DESC
								LIMIT 1
								'''%(table_name))
								
				last_time = cur.fetchall()
			
				cur.close()
				con.close()
				
				time_list.sort()
				
				#print(first_time)
				#print(last_time)
				first_time_data="NULL"
				last_time_data="NULL"
				if(first_time):
					if(first_time[0][0]):
						first_time_data = first_time[0][0]
				if(last_time):
					if(last_time[0][1]):
						last_time_data = last_time[0][1]
					elif(last_time[0][0]):
						last_time_data = last_time[0][0]
				
				
				x_list=[]
				y_list=[]
				for i in range(0,int(max(time_list)*10+2)):
					x_list.append(i/10.0)
					y_list.append(0)
					for j in time_list:
						if(int(j*10+1)==i):
							y_list[i]+=1
				
				return {"case_num":len(time_list),
						"total_sim_time":sum(time_list),
						"average_sim_time":sum(time_list)/len(time_list),
						"middle_sim_time":time_list[len(time_list)//2],
						"min_sim_time":min(time_list),
						"max_sim_time":max(time_list),
						"x_list":x_list,
						"y_list":y_list,
						"first_time":first_time_data,
						"last_time":last_time_data,
						
						}
		
		return {"case_num":0,
				"total_sim_time":0,
				"average_sim_time":0,
				"middle_sim_time":0,
				"min_sim_time":0,
				"max_sim_time":0,
				"x_list":0,
				"y_list":0,
				}
	except:
		cur.close()
		con.close()
		print("get_sim_time Error")
		return
	
def get_tc_info(db_name,table_name,testname):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		where=testname.split('-')
		#print(where)
		
		cur.execute(''' SELECT * 
						FROM %s
						WHERE case_owner="%s" AND case_name="%s";
						'''%(table_name,where[0],where[1]))
	
		result = cur.fetchall()
		cur.close()
		con.close()
		
		dict={}
		k=0
		if(result):
			for i in result:
				dict[k] = {
				"ID"                   : i[u_ID               ],
				"unique_id"            : i[u_unique_id        ],
				"SPECIAL_STATE"        : i[u_SPECIAL_STATE    ],
				"stage"                : i[u_stage            ],
				"project_name"         : i[u_project_name     ],
				"case_name"            : i[u_case_name        ],
				"case_owner"           : i[u_case_owner       ],
				"user_name"            : i[u_user_name        ],
				"ip_address"           : i[u_ip_address       ],
				"sim_path"             : i[u_sim_path         ],
				"sim_level"            : i[u_sim_level        ],
				"sim_st_time"          : i[u_sim_st_time      ],
				"sim_end_time"         : i[u_sim_end_time     ],
				"sim_duration"         : i[u_sim_duration     ],
				"UVM_ERROR_CNT"        : i[u_UVM_ERROR_CNT    ],
				"UVM_FATAL_CNT"        : i[u_UVM_FATAL_CNT    ],
				"CHECK_OK_CNT"         : i[u_CHECK_OK_CNT     ],
				"data_mismatch_CNT"    : i[u_data_mismatch_CNT],
				"fps_mismatch_CNT"     : i[u_fps_mismatch_CNT ],
				"violation_CNT"        : i[u_violation_CNT    ],
				"ASSERT_ERROR_CNT"     : i[u_ASSERT_ERROR_CNT ],
				}
			
				k+=1
			
		return dict
	except:
		cur.close()
		con.close()
		print("get_tc_info Error")
		return
	
	
def special_state_get_info(db_name,table_name,testname):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		where=testname.split('-')
		#print(where)
		
		cur.execute(''' SELECT SPECIAL_STATE,comment_data
						FROM %s
						WHERE case_owner="%s" AND case_name="%s"
						LIMIT 1;
						'''%(table_name,where[0],where[1]))
	
		result = cur.fetchall()
		cur.close()
		con.close()
		
	
		#print(result)
		if(result):
			s_state=str(result[0][0])
			comment=str(result[0][1])
			return {"s_state":s_state,"comment":comment}
		else:
			return {"s_state":"None","comment":""}
	except:
		cur.close()
		con.close()
		print("special_state_get_info Error")
		return

def insert_comment(comment_data):
	try:
		con=sqlite3.connect("./database/%s.db"%(comment_data["db_file"]))
		cur=con.cursor()
		#print(comment_data)
		where=comment_data["testname"].split('-')
		#print(where)
		cur.execute(''' SELECT comment_data
						FROM %s
						WHERE case_owner="%s" AND case_name="%s"
						LIMIT 1;
						'''%(comment_data["sim_level"],where[0],where[1]))
		result = cur.fetchone()
		#print(result)
		c_data = "<span class=\"comment_info\">"+time.strftime('%Y-%m-%d %H:%M:%S ', time.localtime(time.time()))+comment_data["c_user"]+"</span><br><span class=\"comment_data\">"+comment_data["c_data"].replace("\n","<br>")+"</span>"
		if(result[0]):
			#print(result[0][0])
			c_data = result[0] + "<br>" + c_data
		#print(c_data)
		
		cur.execute(''' UPDATE %s 
						SET comment_data=?
						WHERE case_owner="%s" AND case_name="%s";
						'''%
						(comment_data["sim_level"],where[0],where[1]),
						(c_data,))
	
		con.commit()
		cur.close()
		con.close()
	except:
		cur.close()
		con.close()
		print("insert_comment Error")
		return


def special_state_set_state(db_name,table_name,testname,s_state):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		where=testname.split('-')
		#print(where)
		cur.execute(''' SELECT SPECIAL_STATE 
						FROM %s
						WHERE case_owner="%s" AND case_name="%s";
						'''%(table_name,where[0],where[1]))
	
		result = cur.fetchone()
		if(str(result[0])!=s_state):
			cur.execute(''' UPDATE %s 
							SET SPECIAL_STATE="%s"
							WHERE case_owner="%s" AND case_name="%s";
							'''%(table_name,s_state,where[0],where[1]))
		else:
			cur.execute(''' UPDATE %s 
							SET SPECIAL_STATE=%s
							WHERE case_owner="%s" AND case_name="%s";
							'''%(table_name,"NULL",where[0],where[1]))
		
		cur.execute(''' SELECT SPECIAL_STATE,comment_data
						FROM %s
						WHERE case_owner="%s" AND case_name="%s";
						'''%(table_name,where[0],where[1]))
	
		result = cur.fetchall()
		con.commit()
		cur.close()
		con.close()
		
	
		#print(result)
		if(result):
			s_state=str(result[0][0])
			comment=str(result[0][1])
			#comment=""
			#for i in result:
			#	if(i[1]):
			#		comment+=i[1]+"<br>"
			return {"s_state":s_state,"comment":comment}
		else:
			return {"s_state":"None","comment":""}
	except:
		cur.close()
		con.close()
		print("special_state_set_state Error")
		return

def get_bucket_info(db_name,table_name,time_st,time_end):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		cur.execute(''' SELECT case_owner,case_name,stage,sim_st_time,sim_end_time,SPECIAL_STATE,UVM_ERROR_CNT,UVM_FATAL_CNT,CHECK_OK_CNT,data_mismatch_CNT,fps_mismatch_CNT,violation_CNT,ASSERT_ERROR_CNT
						FROM %s
						'''%(table_name))
	
		result = cur.fetchall()
		cur.close()
		con.close()
		
		#print(time_st)
		#print(time_end)
		
		
		db_time_st  = datetime.datetime.strptime(time_st ,'%Y-%m-%dT%H:%M').strftime("%Y-%m-%d %H:%M:%S")
		db_time_end = datetime.datetime.strptime(time_end,'%Y-%m-%dT%H:%M').strftime("%Y-%m-%d %H:%M:%S")
		
		
		
		
		
		dict = {"time_st":db_time_st,
				"time_end":db_time_end,
				"st_before"         :set(),
				"st_bewtten"        :set(),
				"st_after"          :set(),
				"fi_before_before"  :set(),
				"fi_before_bewtten" :set(),
				"fi_before_after"   :set(),
				"fi_bewtten_bewtten":set(),
				"fi_bewtten_after"  :set(),
				"fi_after_after"    :set(),
				"fi_unknow_before"  :set(),
				"fi_unknow_bewtten" :set(),
				"fi_unknow_after"   :set(),
				"s_ignore"          :set(),
				"sim_result":{},
				}
		
		
		
		if(result):
			#print(result)
			for i in result:
				case_name = i[0]+"-"+i[1]
				
				dict["st_before"         ].discard(case_name)
				dict["st_bewtten"        ].discard(case_name)
				dict["st_after"          ].discard(case_name)
				dict["fi_before_before"  ].discard(case_name)
				dict["fi_before_bewtten" ].discard(case_name)
				dict["fi_before_after"   ].discard(case_name)
				dict["fi_bewtten_bewtten"].discard(case_name)
				dict["fi_bewtten_after"  ].discard(case_name)
				dict["fi_after_after"    ].discard(case_name)
				dict["fi_unknow_before"  ].discard(case_name)
				dict["fi_unknow_bewtten" ].discard(case_name)
				dict["fi_unknow_after"   ].discard(case_name)
				
				
				if(i[5]=="s_ignore"):
					dict["s_ignore"].add(case_name)
				else:
					if(i[2]=="sim_start"):
						if(i[3]<db_time_st):
							dict["st_before" ].add(case_name)
						elif(i[3]>db_time_end ):
							dict["st_after" ].add(case_name)
						else:
							dict["st_bewtten" ].add(case_name)
						dict["sim_result"][case_name]="time_sim"
					else:
						if(i[3]):
							if(i[3]<db_time_st):
								if(i[4]<db_time_st):
									dict["fi_before_before" ].add(case_name)
								elif(i[4]>db_time_end ):
									dict["fi_before_after" ].add(case_name)
								else:
									dict["fi_before_bewtten" ].add(case_name)
							elif(i[3]>db_time_end ):
								dict["fi_after_after" ].add(case_name)
							else:
								if(i[4]>db_time_end ):
									dict["fi_bewtten_after" ].add(case_name)
								else:
									dict["fi_bewtten_bewtten" ].add(case_name)
						else:
							if(i[4]<db_time_st):
								dict["fi_unknow_before" ].add(case_name)
							elif(i[4]>db_time_end ):
								dict["fi_unknow_after" ].add(case_name)
							else:
								dict["fi_unknow_bewtten" ].add(case_name)
				
						if(i[5]=="s_pass"):
							dict["sim_result"][case_name]="time_s_pass"
						elif(i[5]=="s_fail"):
							dict["sim_result"][case_name]="time_s_fail"
						elif( (i[6]-i[10])==0 and i[7]==0 and i[9]==0 and i[11]==0 and i[12]==0 ):
							if(i[8]>0):
								dict["sim_result"][case_name]="time_pass"
							else:
								dict["sim_result"][case_name]="time_unknow"
						else:
							dict["sim_result"][case_name]="time_fail"
		
		dict["st_before"         ] = list(dict["st_before"         ])
		dict["st_bewtten"        ] = list(dict["st_bewtten"        ])
		dict["st_after"          ] = list(dict["st_after"          ])
		dict["fi_before_before"  ] = list(dict["fi_before_before"  ])
		dict["fi_before_bewtten" ] = list(dict["fi_before_bewtten" ])
		dict["fi_before_after"   ] = list(dict["fi_before_after"   ])
		dict["fi_bewtten_bewtten"] = list(dict["fi_bewtten_bewtten"])
		dict["fi_bewtten_after"  ] = list(dict["fi_bewtten_after"  ])
		dict["fi_after_after"    ] = list(dict["fi_after_after"    ])
		dict["fi_unknow_before"  ] = list(dict["fi_unknow_before"  ])
		dict["fi_unknow_bewtten" ] = list(dict["fi_unknow_bewtten" ])
		dict["fi_unknow_after"   ] = list(dict["fi_unknow_after"   ])
		dict["s_ignore"          ] = list(dict["s_ignore"          ])
		
		dict["st_before"         ].sort()
		dict["st_bewtten"        ].sort()
		dict["st_after"          ].sort()
		dict["fi_before_before"  ].sort()
		dict["fi_before_bewtten" ].sort()
		dict["fi_before_after"   ].sort()
		dict["fi_bewtten_bewtten"].sort()
		dict["fi_bewtten_after"  ].sort()
		dict["fi_after_after"    ].sort()
		dict["fi_unknow_before"  ].sort()
		dict["fi_unknow_bewtten" ].sort()
		dict["fi_unknow_after"   ].sort()
		dict["s_ignore"          ].sort()
		
		return dict
	except:
		cur.close()
		con.close()
		print("get_bucket_info Error")
		return
	

def get_heatmap_data(db_name,table_name):
	try:
		con=sqlite3.connect("./database/%s.db"%(db_name))
		cur=con.cursor()
		
		cur.execute(''' SELECT case_owner,case_name,sim_duration
						FROM %s
						WHERE stage="sim_finish";
						'''%(table_name))
	
		result = cur.fetchall()
		cur.close()
		con.close()
		
		dict={}
		
		for i in result:
			if(i[2]):
				if(i[0] in dict):
					dict[i[0]].append([i[1],i[2]])
				else:
					dict[i[0]]=[[i[1],i[2]],]
		
		return dict
	except:
		cur.close()
		con.close()
		print("get_heatmap_data Error")
		return
	
	
	
	
if __name__ == '__main__':

	dict = {'UVM_FATAL_CNT': 0, 'data_mismatch_CNT': 0, 'project_name': 'ISLTEST', 'fps_mismatch_CNT': 0, 'ip_address': '192.168.71.148', 'CHECK_OK_CNT': 0, 'case_name': 'tc_101', 'sim_level': 'rtl', 'UVM_ERROR_CNT': 0, 'ASSERT_ERROR_CNT': 0, 'violation_CNT': 0, 'case_owner': 'luzhemin', 'user_name': 'luzhemin', 'sim_path': '/DT_Data6/group/Digital/luzhemin/bench/ISL6003/DIG/verify/simulation', 'unique_id': 'luzhemin+tc_101+2023-05-05-08:54:13.546341395', 'stage': 'sim_finish'}

	
	#print(get_sim_time("ISL6003","rtl"))
	#sim_finish(dict)

	con=sqlite3.connect("./database/ISL6003.db")
	cur=con.cursor()
	
	#cur.execute(''' ALTER TABLE rtl ADD COLUMN comment_data ''')
	#cur.execute(''' ALTER TABLE gate ADD COLUMN comment_data ''')

	#cur.execute(''' DELETE FROM rtl
	#					WHERE sim_st_time=NULL AND sim_end_time=NULL;''')	
	#cur.execute(''' DELETE FROM rtl
	#					WHERE stage="sim_start" AND sim_st_time=NULL;''')	
	#cur.execute(''' DELETE FROM rtl
	#					WHERE stage="sim_finish" AND sim_end_time=NULL;''')	
	#cur.execute(''' DELETE FROM rtl
	#				WHERE ID<530 AND case_owner="suchang";''')	
	
	#cur.execute(''' SELECT * FROM rtl
	#				WHERE case_owner="huqixing" AND case_name="ablc_024_a";''')
					
	#cur.execute(''' DELETE FROM rtl
	#				WHERE ID>2203 AND case_owner="changqinhao";''')	
	
	#print(cur.fetchall())
	
	#con.commit()
	
	cur.close()
	con.close()



