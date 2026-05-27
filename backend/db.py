import json
import os
import sqlite3
from contextlib import contextmanager


def _db_path() -> str:
    return os.getenv("DB_PATH", "data/products.db")


@contextmanager
def get_conn():
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row) -> dict:
    d = dict(row)
    if "specs" in d and isinstance(d["specs"], str):
        try:
            d["specs"] = json.loads(d["specs"])
        except json.JSONDecodeError:
            pass
    return d


def insert_record(table: str, payload: dict) -> dict:
    cols = list(payload.keys())
    vals = list(payload.values())
    placeholders = ", ".join("?" * len(vals))
    cols_sql = ", ".join(cols)
    with get_conn() as conn:
        cur = conn.execute(
            f"INSERT INTO {table} ({cols_sql}) VALUES ({placeholders}) RETURNING *",
            vals,
        )
        row = cur.fetchone()
        conn.commit()
        return row_to_dict(row)
