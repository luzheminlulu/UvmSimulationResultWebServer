
import os
import re
import argparse
import json


parser = argparse.ArgumentParser()
parser.add_argument("-stage"  , "--simulation_stage"   ,   type=str  , default="")
parser.add_argument("-uid"    , "--unique_id"          ,   type=str  , default="")
parser.add_argument("-project", "--project_name"          ,   type=str  , default="")
parser.add_argument("-case"   , "--case_name"          ,   type=str  , default="")
parser.add_argument("-owner"  , "--case_owner"         ,   type=str  , default="")
parser.add_argument("-user"   , "--user_name"          ,   type=str  , default="")
parser.add_argument("-path"  , "--sim_path"   ,   type=str  , default="")
parser.add_argument("-level"  , "--sim_level"   ,   type=str  , default="")
parser.add_argument("-log"  , "--log_path"   ,   type=str  , default="")
args = parser.parse_args()



#print(args.unique_id)
def get_ip_address():
	ip_filter=[
		"192.168.70.103",
		"192.168.70.104",
		"192.168.70.129",
		"192.168.70.130",
		"192.168.70.103",
		"192.168.70.52",
		"192.168.70.53",
		"192.168.70.43",
		"192.168.70.45",
		"192.168.70.46",
		"192.168.71.138",
		"192.168.71.139",
		"192.168.71.140",
		"192.168.71.141",
		"192.168.71.142",
		"192.168.71.143",
		"192.168.71.144",
		"192.168.71.145",
		"192.168.71.146",
		"192.168.71.147",
		"192.168.71.148",
		"192.168.71.149",
		"192.168.71.150",
		"192.168.71.151",
	]
	
	with os.popen('ifconfig -a') as f:
		
		ip_address_list = re.findall(r'(192\.168\.\d+\.\d+)',f.read())
		ip_address_list = [address for address in ip_address_list if address in ip_filter]
		#print(ip_address_list)
		if(ip_address_list):
			ip_address = ip_address_list[0]
		else:
			ip_address = "UNKNOW"
	return ip_address

def stage_start(args):

	stage_start_dict = {
		"unique_id"         :args.unique_id,
		"stage"             :args.simulation_stage,
		"project_name"      :args.project_name,
		"case_name"         :args.case_name,
		"case_owner"        :args.case_owner,
		"user_name"         :args.user_name,
		"ip_address"        :get_ip_address(),
		"sim_path"          :args.sim_path,
		"sim_level"         :args.sim_level,
	}

	stage_start_str = json.dumps(stage_start_dict)
	return stage_start_str



def stage_end(args):
	
	with open(args.log_path) as f:
		str_read = f.read()
		#str_log = re.sub("UVM Report catcher Summary.*?$","",str_read,re.DOTALL )
		
		UVM_ERROR_CNT     = len(re.findall(r"UVM_ERROR"      ,str_read))
		UVM_FATAL_CNT     = len(re.findall(r"UVM_FATAL"      ,str_read))
		CHECK_OK_CNT      = len(re.findall(r"check OK\!\!\!" ,str_read))
		data_mismatch_CNT = len(re.findall(r"data.*?mismatch",str_read))
		fps_mismatch_CNT  = len(re.findall(r"fps.*?mismatch" ,str_read))
		violation_CNT     = len(re.findall(r"violation"      ,str_read))
		ASSERT_ERROR_CNT  = len(re.findall(r"ASSERT_ERROR"   ,str_read))
		
		if(re.findall("UVM Report catcher Summary",str_read)):
			UVM_ERROR_CNT -= 3
			UVM_FATAL_CNT -= 3
	
	print("\n")
	print("UVM_ERROR",UVM_ERROR_CNT    )
	print("UVM_FATAL",UVM_FATAL_CNT    )
	print("CHECK_OK!",CHECK_OK_CNT     )
	print("data_mis",data_mismatch_CNT)
	print("fps_mis",fps_mismatch_CNT )
	print("violation",violation_CNT    )
	print("ASSERTION",ASSERT_ERROR_CNT )

	
	
	stage_finish_dict = {
		"unique_id"         :args.unique_id,
		"stage"             :args.simulation_stage,
		"project_name"      :args.project_name,
		"case_name"         :args.case_name,
		"case_owner"        :args.case_owner,
		"user_name"         :args.user_name,
		"ip_address"        :get_ip_address(),
		"sim_path"          :args.sim_path,
		"sim_level"         :args.sim_level,
		"UVM_ERROR_CNT"     :UVM_ERROR_CNT    ,
		"UVM_FATAL_CNT"     :UVM_FATAL_CNT    ,
		"CHECK_OK_CNT"      :CHECK_OK_CNT     ,
		"data_mismatch_CNT" :data_mismatch_CNT,
		"fps_mismatch_CNT"  :fps_mismatch_CNT ,
		"violation_CNT"     :violation_CNT    ,
		"ASSERT_ERROR_CNT"  :ASSERT_ERROR_CNT ,
	}
	
	
	#print(stage_finish_dict)
	
	
	
	stage_finish_str = json.dumps(stage_finish_dict)
	return stage_finish_str
	
	

if __name__ == '__main__':
	
	if(args.simulation_stage=="sim_start"):
		json_str = stage_start(args)
	elif(args.simulation_stage=="sim_finish"):
		json_str = stage_end(args)
	else:
		print("ERROR: illegal stage")

	#print(json_str)
	command = 'ssh -t DT-node02 "python /DT_home01/users/luzhemin/DataPost.py -json \\\"%s\\\""'%(json_str.replace('"',"\'"))
	#print(command)
	with os.popen(command) as f:
		print(f.read())
    
