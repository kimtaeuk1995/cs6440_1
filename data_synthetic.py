import random
from datetime import datetime, timedelta

import requests

API_URL = "https://cs6440-1.onrender.com/submit_today/"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTc0NDI0MTAzNn0.GII_nn8NurhuhrLo08_Zxwvg87x72W49nzZmSifuQZM"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

meal_options = ["Breakfast", "Lunch", "Dinner"]

# Generate synthetic entries
def generate_data():
    entries = []
    current_date = datetime.now()
    for _ in range(10):
        entry = {
            "blood_sugar": round(random.uniform(90, 180), 1),
            "meal_info": random.choice(meal_options),
            "medication_dose": round(random.uniform(1, 15), 1),
        }
        entries.append(entry)
        # simulate earlier date for next
        current_date -= timedelta(days=random.randint(3, 7))
    return entries

def bulk_insert(entries):
    for i, entry in enumerate(entries, 1):
        response = requests.post(API_URL, headers=HEADERS, json=entry)
        if response.status_code == 200:
            print(f"[{i}] ✅ Inserted: {entry}")
        else:
            print(f"[{i}] ❌ Failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    data_entries = generate_data()
    bulk_insert(data_entries)
