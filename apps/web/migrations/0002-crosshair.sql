CREATE TABLE saved_crosshair (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  document jsonb NOT NULL CHECK (octet_length(document::text) <= 4096),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX saved_crosshair_member ON saved_crosshair(user_id,created_at DESC);
