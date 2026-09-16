-- Public, normalized metadata only. The refresher receives no account credential.
CREATE TABLE catalog_profile_checkpoint (
  key text PRIMARY KEY CHECK (key ~ '^(mod|sound)-[1-9][0-9]{0,15}$'),
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
