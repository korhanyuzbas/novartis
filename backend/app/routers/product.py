from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models.product import Region, TherapeuticArea, Product
from app.models.user import User
from app.schemas.product import (Product as ProductSchema, ProductCreate, ProductUpdate,
                                 TherapeuticArea as TherapeuticAreaSchema, TherapeuticAreaCreate,
                                 RegionCreate, Region as RegionSchema)

router = APIRouter(
    prefix="/products",
    tags=["products"]
)


@router.get("/", response_model=List[ProductSchema])
def get_products(
        db: Session = Depends(get_db),
        skip: int = 0,
        limit: int = 10,
        creator_id: Optional[int] = None,
        therapeutic_area_id: Optional[int] = None,
        region_id: Optional[int] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$")
):
    query = db.query(Product)

    # Apply filters
    if creator_id:
        query = query.filter(Product.creator_id == creator_id)
    if therapeutic_area_id:
        query = query.filter(Product.therapeutic_area_id == therapeutic_area_id)
    if region_id:
        query = query.join(Product.regions).filter(Region.id == region_id)
    if search:
        query = query.filter(text(f"search_vector @@ to_tsquery('{search}:*')"))

    # Apply sorting
    if sort_by == "name":
        query = query.order_by(Product.name.asc() if sort_order == "asc" else Product.name.desc())
    elif sort_by == "ingredient":
        query = query.order_by(
            Product.ingredient.asc() if sort_order == "asc" else Product.ingredient.desc())
    elif sort_by == "date":
        query = query.order_by(
            Product.creation_date.asc() if sort_order == "asc" else Product.creation_date.desc())
    elif sort_by == "therapeutic_area":
        query = query.join(Product.therapeutic_area)
        query = query.order_by(
            TherapeuticArea.name.asc() if sort_order == "asc" else TherapeuticArea.name.desc())

    results = query.offset(skip).limit(limit).all()

    return results


@router.post("/", response_model=ProductSchema)
def create_product(
        product: ProductCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    db_product = Product(
        name=product.name,
        ingredient=product.ingredient,
        description=product.description,
        therapeutic_area_id=product.therapeutic_area_id,
        creator_id=current_user.id
    )

    # Add regions
    for region_id in product.region_ids:
        region = db.query(Region).filter(Region.id == region_id).first()
        if not region:
            raise HTTPException(status_code=404, detail=f"Region with id {region_id} not found")
        db_product.regions.append(region)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product


@router.put("/{product_id}", response_model=ProductSchema)
def update_product(
        product_id: int,
        product: ProductUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if db_product.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")

    # Update product fields
    if product.name is not None:
        db_product.name = product.name
    if product.ingredient is not None:
        db_product.ingredient = product.ingredient
    if product.description is not None:
        db_product.description = product.description
    if product.therapeutic_area_id is not None:
        db_product.therapeutic_area_id = product.therapeutic_area_id

    # Update regions if provided
    if product.region_ids is not None:
        # Clear existing regions
        db_product.regions = []
        # Add new regions
        for region_id in product.region_ids:
            region = db.query(Region).filter(Region.id == region_id).first()
            if not region:
                raise HTTPException(status_code=404, detail=f"Region with id {region_id} not found")
            db_product.regions.append(region)

    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/{product_id}", response_model=ProductSchema)
def product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.delete("/{product_id}", status_code=204)
def delete_product(
        product_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if db_product.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    db.delete(db_product)
    db.commit()
    return


@router.get("/therapeutic-areas/", response_model=List[TherapeuticAreaSchema])
def therapeutic_areas(db: Session = Depends(get_db)):
    return db.query(TherapeuticArea).all()


@router.post("/therapeutic-areas/", response_model=TherapeuticAreaSchema)
def create_therapeutic_area(
        therapeutic_area: TherapeuticAreaCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    db_therapeutic_area = TherapeuticArea(name=therapeutic_area.name)
    db.add(db_therapeutic_area)
    db.commit()
    db.refresh(db_therapeutic_area)
    return db_therapeutic_area


@router.get("/regions/", response_model=List[RegionSchema])
def regions(db: Session = Depends(get_db)):
    return db.query(Region).all()


@router.post("/regions/", response_model=RegionSchema)
def create_region(
        region: RegionCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    db_region = Region(name=region.name)
    db.add(db_region)
    db.commit()
    db.refresh(db_region)
    return db_region
