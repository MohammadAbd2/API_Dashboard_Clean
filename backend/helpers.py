ALLOWED_SORT_FIELDS = {"name", "price", "release_date", "created_at"}
ALLOWED_DIRECTIONS = {"asc", "desc"}


def build_sort_clause(field: str, direction: str) -> str:
    if field not in ALLOWED_SORT_FIELDS:
        field = "name"
    direction = direction.lower()
    if direction not in ALLOWED_DIRECTIONS:
        direction = "asc"
    return f"ORDER BY {field} {direction.upper()}"
