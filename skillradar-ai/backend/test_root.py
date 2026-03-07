import urllib.request
import urllib.error

try:
    with urllib.request.urlopen("http://localhost:8000/") as response:
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
