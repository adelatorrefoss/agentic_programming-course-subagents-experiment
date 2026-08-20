CREATE TABLE IF NOT EXISTS dishes.cooked_dish_audit_events (
    event_id UUID NOT NULL,
    cooked_dish_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    change_type TEXT NOT NULL,
    changes JSONB NOT NULL,
    author TEXT NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT pk__cooked_dish_audit_events PRIMARY KEY (event_id),
    CONSTRAINT fk__cooked_dish_audit_events__cooked_dish
        FOREIGN KEY (cooked_dish_id)
        REFERENCES dishes.cooked_dishes (id)
        ON DELETE RESTRICT,
    CONSTRAINT chk__cooked_dish_audit_events__entity_type
        CHECK (entity_type = 'cooked_dish'),
    CONSTRAINT chk__cooked_dish_audit_events__change_type
        CHECK (change_type IN ('created', 'updated')),
    CONSTRAINT chk__cooked_dish_audit_events__changes_object
        CHECK (jsonb_typeof(changes) = 'object'),
    CONSTRAINT chk__cooked_dish_audit_events__author_not_blank
        CHECK (length(btrim(author)) BETWEEN 1 AND 200)
);

CREATE INDEX IF NOT EXISTS cooked_dish_audit_events_history_idx
    ON dishes.cooked_dish_audit_events
    (cooked_dish_id, occurred_at ASC, event_id ASC);

CREATE OR REPLACE FUNCTION dishes.reject_cooked_dish_audit_event_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'cooked_dish_audit_events is append-only'
        USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS cooked_dish_audit_events_append_only
    ON dishes.cooked_dish_audit_events;

CREATE TRIGGER cooked_dish_audit_events_append_only
    BEFORE UPDATE OR DELETE ON dishes.cooked_dish_audit_events
    FOR EACH ROW
    EXECUTE FUNCTION dishes.reject_cooked_dish_audit_event_mutation();
