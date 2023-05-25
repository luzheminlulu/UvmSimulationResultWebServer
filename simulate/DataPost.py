import requests
import json
import argparse

url = 'http://192.168.51.28:5005/SimulationAnalysis'
#d = json.dumps( {"unique_id":2,})

parser = argparse.ArgumentParser()
parser.add_argument("-json", "--json_str", help="this is json dumps",  type=str, default="{}")
args = parser.parse_args()

r = requests.post(url, data=args.json_str.replace("'",'"'))
print(r.text)

#json_data = json.loads(r.text)
#for key in json_data:
#	print(json_data[key])
