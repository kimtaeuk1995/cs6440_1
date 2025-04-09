import random
from datetime import datetime, timedelta

import requests

API_URL = "https://cs6440-1.onrender.com/add_data/"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTc0NDE3MTMwNX0.Dglj95HN2vydQjvoU6_Zqs4xOnIHCbN5OhuEcSfkpV4"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

start_date = datetime(2025, 1, 1)
today = datetime.now()
current = start_date

while current < today:
    payload = {
        "user_id": "testuser",
        "blood_sugar": round(random.uniform(80, 160), 1),
        "meal_info": random.choice(["Breakfast", "Lunch", "Dinner"]),
        "medication_dose": round(random.uniform(4.0, 8.0), 1),
        "timestamp": current.isoformat()
    }
    response = requests.post(API_URL, json=payload, headers=headers)
    print(f"{current.date()} → {response.status_code}: {response.text}")

    current += timedelta(days=random.randint(3, 7))
