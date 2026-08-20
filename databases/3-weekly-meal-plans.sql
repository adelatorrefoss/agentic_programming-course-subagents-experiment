CREATE TABLE dishes.weekly_meal_plans (
    id UUID PRIMARY KEY NOT NULL,
    week_start DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT weekly_meal_plans_week_start_monday_check
        CHECK (EXTRACT(ISODOW FROM week_start) = 1),
    CONSTRAINT weekly_meal_plans_week_start_key
        UNIQUE (week_start)
);
CREATE TABLE dishes.weekly_meals (
    weekly_meal_plan_id UUID NOT NULL,
    day DATE NOT NULL,
    slot TEXT NOT NULL,
    cooked_dish_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT weekly_meals_pkey
        PRIMARY KEY (weekly_meal_plan_id, day, slot),
    CONSTRAINT weekly_meals_weekly_meal_plan_id_fkey
        FOREIGN KEY (weekly_meal_plan_id)
        REFERENCES dishes.weekly_meal_plans (id)
        ON DELETE CASCADE,
    CONSTRAINT weekly_meals_cooked_dish_id_fkey
        FOREIGN KEY (cooked_dish_id)
        REFERENCES dishes.cooked_dishes (id)
        ON DELETE RESTRICT,
    CONSTRAINT weekly_meals_slot_check
        CHECK (slot IN ('breakfast', 'lunch', 'dinner'))
);
