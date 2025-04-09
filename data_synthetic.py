import random
from datetime import datetime, timedelta

from sqlalchemy import Column, Float, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database setup
DATABASE_URL = "sqlite:///./diabetes_tracker.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define the DiabetesData table
class DiabetesData(Base):
    __tablename__ = "diabetes_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    blood_sugar = Column(Float)
    meal_info = Column(String)
    medication_dose = Column(Float)
    timestamp = Column(String)

# Create the table (if it doesn't exist)
Base.metadata.create_all(bind=engine)

# Generate synthetic data
def generate_synthetic_data():
    db = SessionLocal()
    user_id = "testuser"
    current_date = datetime(2025, 1, 1)
    end_date = datetime.now()

    while current_date <= end_date:
        data = DiabetesData(
            user_id=user_id,
            blood_sugar=round(random.uniform(70, 150), 2),
            meal_info=random.choice(["Breakfast", "Lunch", "Dinner", "Snack"]),
            medication_dose=round(random.uniform(0, 10), 2),
            timestamp=current_date.strftime("%Y-%m-%dT%H:%M:%S")
        )
        db.add(data)
        current_date += timedelta(days=random.randint(1, 5))
    db.commit()
    db.close()

generate_synthetic_data()