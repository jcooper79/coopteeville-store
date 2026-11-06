-- Car Club: miles (1 per $1) and the residents each member has collected.
CREATE TABLE IF NOT EXISTS members (
  email TEXT PRIMARY KEY,
  miles INTEGER NOT NULL DEFAULT 0,
  opted_in INTEGER NOT NULL DEFAULT 0,  -- 1 = joined via the form, OK to email
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS collection (
  email TEXT NOT NULL,
  resident TEXT NOT NULL,
  collected_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (email, resident)
);
