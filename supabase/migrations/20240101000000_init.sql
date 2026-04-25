-- Consoles table
CREATE TABLE IF NOT EXISTS consoles (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT        NOT NULL,
  brand      TEXT,
  platform   TEXT,
  year       INTEGER,
  igdb_id    INTEGER,
  cover_url  TEXT,
  added_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  console_id UUID        REFERENCES consoles(id) ON DELETE SET NULL,
  title      TEXT        NOT NULL,
  platform   TEXT,
  genre      TEXT,
  year       INTEGER,
  igdb_id    INTEGER,
  cover_url  TEXT,
  added_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row Level Security
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consoles: own rows only"
  ON consoles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "games: own rows only"
  ON games FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
