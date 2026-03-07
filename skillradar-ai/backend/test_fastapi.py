import asyncio
from main import app, read_root

# Try running read_root directly
try:
    print("Testing read_root directly...")
    res = read_root()
    print("Success:", res)
except Exception as e:
    import traceback
    traceback.print_exc()

# You can also test with TestClient
from fastapi.testclient import TestClient
client = TestClient(app)

print("\nTesting GET / via TestClient...")
try:
    response = client.get("/")
    print("Status:", response.status_code)
    print("Content:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
