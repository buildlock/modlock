CREATE TABLE member_profile (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  handle text NOT NULL UNIQUE CHECK (handle ~ '^[a-z][a-z0-9_]{2,29}$'),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 500),
  website text NOT NULL DEFAULT '' CHECK (char_length(website) <= 300),
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE saved_mod (
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  mod_key text NOT NULL CHECK (mod_key ~ '^(mod|sound)-[1-9][0-9]{0,9}$'),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  seen_modified_at timestamptz,
  saved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, mod_key)
);
CREATE INDEX saved_mod_recent ON saved_mod(user_id, saved_at DESC);

CREATE TABLE mod_report (
  id uuid PRIMARY KEY,
  reporter_id text REFERENCES "user"(id) ON DELETE SET NULL,
  mod_key text NOT NULL CHECK (mod_key ~ '^(mod|sound)-[1-9][0-9]{0,9}$'),
  reason text NOT NULL CHECK (reason IN ('broken', 'unsafe', 'rights', 'attribution', 'other')),
  detail text NOT NULL CHECK (char_length(detail) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'resolved', 'closed')),
  response text NOT NULL DEFAULT '' CHECK (char_length(response) <= 1000),
  request_key uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, request_key)
);
CREATE INDEX mod_report_reporter ON mod_report(reporter_id, created_at DESC);
CREATE INDEX mod_report_queue ON mod_report(status, created_at);
CREATE UNIQUE INDEX mod_report_open_duplicate ON mod_report(reporter_id, mod_key, reason) WHERE status IN ('submitted', 'reviewing');

CREATE TABLE staff_grant (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('moderator', 'administrator')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE moderation_event (
  id uuid PRIMARY KEY,
  report_id uuid REFERENCES mod_report(id) ON DELETE SET NULL,
  actor_id text REFERENCES "user"(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (char_length(action) BETWEEN 1 AND 80),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE catalog_restriction (
  mod_key text PRIMARY KEY CHECK (mod_key ~ '^(mod|sound)-[1-9][0-9]{0,9}$'),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 1000),
  actor_id text REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE member_rate_limit (
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL CHECK (count > 0),
  PRIMARY KEY (user_id, action)
);
