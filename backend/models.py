from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None


class Category(CategoryCreate):
    id: int


class ProductCreate(BaseModel):
    name: str
    category_id: int
    price: float
    stock: int = 0
    release_date: date
    specs: dict[str, Any] = {}


class Product(ProductCreate):
    id: int
    created_at: datetime


class ReviewCreate(BaseModel):
    product_id: int
    author_name: str
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = None


class Review(ReviewCreate):
    id: int
    created_at: datetime
