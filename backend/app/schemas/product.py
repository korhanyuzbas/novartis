from datetime import date
from typing import List, Optional

from pydantic import BaseModel, computed_field

from app.schemas.user import User


class RegionBase(BaseModel):
    name: str


class RegionCreate(RegionBase):
    pass


class Region(RegionBase):
    id: int

    class Config:
        from_attributes = True


class TherapeuticAreaBase(BaseModel):
    name: str


class TherapeuticAreaCreate(TherapeuticAreaBase):
    pass


class TherapeuticArea(TherapeuticAreaBase):
    id: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    ingredient: str
    description: str
    therapeutic_area_id: int
    region_ids: List[int]


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    ingredient: Optional[str] = None
    description: Optional[str] = None
    therapeutic_area_id: Optional[int] = None
    region_ids: Optional[List[int]] = None


class Product(BaseModel):
    id: int
    name: str
    ingredient: str
    description: str
    therapeutic_area_id: int
    creator_id: int
    creation_date: date
    creator: User
    therapeutic_area: TherapeuticArea
    regions: List[Region]

    @computed_field
    @property
    def region_ids(self) -> List[int]:
        return [region.id for region in self.regions]

    class Config:
        from_attributes = True
