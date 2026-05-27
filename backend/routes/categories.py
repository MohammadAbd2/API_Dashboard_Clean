from fastapi import APIRouter, HTTPException

from ..db import get_conn, insert_record, row_to_dict
from ..models import CategoryCreate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
def list_categories():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM categories ORDER BY name ASC").fetchall()
        return [row_to_dict(r) for r in rows]


@router.get("/{category_id}")
def get_category(category_id: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM categories WHERE id = ?", (category_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Category not found")
        return row_to_dict(row)


@router.post("", status_code=201)
def create_category(category: CategoryCreate):
    payload = category.model_dump()
    return insert_record("categories", payload)
