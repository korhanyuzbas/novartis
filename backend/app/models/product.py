from datetime import datetime

from sqlalchemy import Column, ForeignKey, Integer, String, Text, Date, Table
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship

from app.database import Base

# Association table for many-to-many relationship between products and regions
product_region = Table('product_region', Base.metadata,
                       Column('product_id', Integer, ForeignKey('products.id')),
                       Column('region_id', Integer, ForeignKey('regions.id'))
                       )


class TherapeuticArea(Base):
    __tablename__ = "therapeutic_areas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    products = relationship("Product", back_populates="therapeutic_area")


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    products = relationship("Product", secondary=product_region, back_populates="regions")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    ingredient = Column(String, index=True)
    description = Column(Text)
    creation_date = Column(Date, default=datetime.utcnow)

    creator_id = Column(Integer, ForeignKey("users.id"))
    therapeutic_area_id = Column(Integer, ForeignKey("therapeutic_areas.id"))

    creator = relationship("User", back_populates="products")
    therapeutic_area = relationship("TherapeuticArea", back_populates="products")
    regions = relationship("Region", secondary=product_region, back_populates="products")

    search_vector = Column(TSVECTOR, nullable=True)
