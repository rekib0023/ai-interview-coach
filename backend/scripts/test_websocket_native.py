import asyncio

import requests
import websockets


# Helper to get auth cookie
def get_auth_token():
    base_url = "http://localhost:8000/api/v1"
    email = "ws_test_user@example.com"
    password = "password123"

    # Try signup
    requests.post(
        f"{base_url}/auth/signup",
        json={"email": email, "password": password, "full_name": "WS Test User"},
    )

    # Login
    response = requests.post(
        f"{base_url}/auth/login", data={"username": email, "password": password}
    )

    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return None

    # Extract cookie
    return response.cookies.get("access_token")


async def test_websocket():
    token = get_auth_token()
    if not token:
        print("Could not get auth token. Skipping WS test.")
        return

    # Pass token in Cookie header
    uri = "ws://localhost:8000/api/v1/ws/1"
    headers = {"Cookie": f"access_token={token}"}

    try:
        async with websockets.connect(uri, additional_headers=headers) as websocket:
            print(f"Connected to {uri}")

            message = "Hello, Secure World!"
            await websocket.send(message)
            print(f"Sent: {message}")

            response = await websocket.recv()
            print(f"Received: {response}")

            # The backend now sends "{email}: {message}"
            assert "ws_test_user@example.com" in response
            assert message in response
            print("Verification Successful!")

    except Exception as e:
        print(f"Verification Failed: {e}")


if __name__ == "__main__":
    asyncio.run(test_websocket())
