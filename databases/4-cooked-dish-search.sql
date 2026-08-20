-- Trigram matching supports the literal, case-insensitive substring search over
-- name and description. The expression exactly matches the repository predicate.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS cooked_dishes_search_text_trgm_idx
    ON dishes.cooked_dishes
    USING GIN (lower(name || ' ' || description) gin_trgm_ops);

-- The default/date-range access path starts at cooked_at and retains id as the
-- deterministic secondary order required by paginated results.
CREATE INDEX IF NOT EXISTS cooked_dishes_cooked_at_id_idx
    ON dishes.cooked_dishes (cooked_at DESC, id ASC);

-- Name sorting is case-insensitive in the search contract and always breaks ties
-- by id, so both expressions belong to the same ordered index.
CREATE INDEX IF NOT EXISTS cooked_dishes_lower_name_id_idx
    ON dishes.cooked_dishes (lower(name) ASC, id ASC);

-- No ingredient-type index is created deliberately: the enum currently has only
-- two values, making it poorly selective, while a jsonb_array_elements predicate
-- cannot use a plain JSONB GIN index. Ratings are aggregated per dish; the existing
-- rating index beginning with cooked_dish_id supports that join and an index on an
-- aggregate value cannot be maintained directly.
