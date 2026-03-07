import urllib.request
import urllib.error
import urllib.parse
import json

data = json.dumps({"message": "Hello"}).encode("utf-8")
req = urllib.request.Request("http://localhost:8000/api/chatbot/message", data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
