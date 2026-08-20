CREATE TABLE dishes.cooked_dish_ratings (
    id UUID PRIMARY KEY NOT NULL,
    cooked_dish_id UUID NOT NULL,
    author TEXT NOT NULL,
    score INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT cooked_dish_ratings_cooked_dish_id_fkey
        FOREIGN KEY (cooked_dish_id)
        REFERENCES dishes.cooked_dishes (id)
        ON DELETE CASCADE,
    CONSTRAINT cooked_dish_ratings_score_check
        CHECK (score BETWEEN 1 AND 5),
    CONSTRAINT cooked_dish_ratings_cooked_dish_id_author_key
        UNIQUE (cooked_dish_id, author)
);

CREATE INDEX cooked_dish_ratings_cooked_dish_id_created_at_idx
    ON dishes.cooked_dish_ratings (cooked_dish_id, created_at DESC);
