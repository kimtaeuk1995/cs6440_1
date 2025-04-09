from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional

import requests
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import Column, Float, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# -------------------- CONFIG --------------------
DATABASE_URL = "sqlite:///./diabetes_tracker.db"
SECRET_KEY = "secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
FHIR_SERVER_URL = "https://hapi.fhir.org/baseR4"

# -------------------- DB Setup --------------------
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# -------------------- Models --------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    fhir_patient_id = Column(String, nullable=True)

class DiabetesData(Base):
    __tablename__ = "diabetes_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    blood_sugar = Column(Float)
    meal_info = Column(String)
    medication_dose = Column(Float)
    timestamp = Column(String)

Base.metadata.create_all(bind=engine)

# -------------------- Auth --------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(lambda: next(get_db()))):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username)
    if not user:
        raise credentials_exception
    return user

# -------------------- Schemas --------------------
class Token(BaseModel):
    access_token: str
    token_type: str

class DiabetesInput(BaseModel):
    user_id: str
    blood_sugar: float
    meal_info: str
    medication_dose: float
    timestamp: str

# -------------------- DB Dependency --------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- Lifespan --------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    user = get_user(db, "testuser")
    if not user:
        user = User(
            username="testuser",
            hashed_password=get_password_hash("testpassword"),
            fhir_patient_id="622898"
        )
        db.add(user)
        db.commit()
    db.close()
    yield

# -------------------- FastAPI App --------------------
app = FastAPI(lifespan=lifespan)

# -------------------- Middleware --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Routes --------------------
@app.get("/")
def root():
    return {"message": "Deployed on Vercel!"}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/add_data/", dependencies=[Depends(get_current_user)])
async def add_diabetes_data(data: DiabetesInput, db: Session = Depends(get_db)):
    new_data = DiabetesData(**data.dict())
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return {"message": "Data added successfully", "data": new_data}

@app.get("/get_data/{user_id}")
async def get_diabetes_data(user_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = db.query(DiabetesData).filter(DiabetesData.user_id == user_id).all()
    if data:
        return data
    return {"message": "No local data for user."}

@app.get("/fhir/patient_data")
async def get_fhir_patient_data(current_user: User = Depends(get_current_user)):
    if not current_user.fhir_patient_id:
        raise HTTPException(status_code=400, detail="No FHIR Patient ID associated with this user")

    response = requests.get(
        f"{FHIR_SERVER_URL}/Observation?code=http://loinc.org|2339-0&patient={current_user.fhir_patient_id}"
    )
    if response.status_code == 200:
        data = response.json()
        readings = []
        for entry in data.get("entry", []):
            res = entry["resource"]
            if "valueQuantity" in res and "effectiveDateTime" in res:
                readings.append({
                    "value": res["valueQuantity"]["value"],
                    "unit": res["valueQuantity"].get("unit", ""),
                    "timestamp": res["effectiveDateTime"]
                })
        return readings

    raise HTTPException(status_code=404, detail="No readings available.")