from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_db
from app.models.product import TherapeuticArea, Region
from app.routers import user, product

app = FastAPI(title="Novartis Products API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router)
app.include_router(product.router)


@app.get("/")
def root():
    return {"message": "Welcome to Novartis Products API"}


# Add some initial data
@app.on_event("startup")
def startup_db_client():
    db = next(get_db())

    # Create some initial therapeutic areas if they don't exist
    areas = [
        "Immunology and Dermatology",
        "Oncology",
        "Neurology",
        "Cardiology",
        "Respiratory"
    ]
    for area_name in areas:
        if not db.query(TherapeuticArea).filter(TherapeuticArea.name == area_name).first():
            db_area = TherapeuticArea(name=area_name)
            db.add(db_area)

    # Create some initial regions if they don't exist
    regions = [
        "North America",
        "Europe",
        "Asia Pacific",
        "Latin America",
        "Middle East and Africa",
        "Turkey"
    ]
    for region_name in regions:
        if not db.query(Region).filter(Region.name == region_name).first():
            db_region = Region(name=region_name)
            db.add(db_region)

    db.commit()
