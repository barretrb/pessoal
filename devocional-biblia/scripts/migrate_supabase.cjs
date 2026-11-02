const { Client } = require('pg');

const client = new Client({
  host: 'db.chbfnwrhnklwbylzjjrc.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'GbwjL3&fcEdw+4@',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const SCHEMA_SQL = `
-- 1. Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Progresso dos 365 Dias do Plano Devocional
CREATE TABLE IF NOT EXISTS public.devotional_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 365),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_devotional_progress UNIQUE(user_id, day_number)
);

-- 3. Progresso por Capítulo Individual
CREATE TABLE IF NOT EXISTS public.chapter_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  chapter INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_chapter_progress UNIQUE(user_id, book_id, chapter)
);

-- 4. Versículos Favoritos
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_key TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_favorites UNIQUE(user_id, verse_key)
);

-- 5. Marcações de Versículos (Highlights)
CREATE TABLE IF NOT EXISTS public.user_highlights (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_key TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_highlights UNIQUE(user_id, verse_key)
);

-- 6. Telemetria e Monitoramento de Funcionalidades em Nuvem
CREATE TABLE IF NOT EXISTS public.feature_telemetry (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feature_name TEXT NOT NULL,
  device_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas de alta performance
CREATE INDEX IF NOT EXISTS idx_devotional_progress_user ON public.devotional_progress(user_id, day_number);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_user ON public.chapter_progress(user_id, book_id, chapter);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_highlights_user ON public.user_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_telemetry_name ON public.feature_telemetry(feature_name, created_at);

-- 7. Ativar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_telemetry ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de Acesso Seguro (RLS Policies)
DO $$
BEGIN
  -- Profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- Devotional Progress
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own devotional progress') THEN
    CREATE POLICY "Users can view own devotional progress" ON public.devotional_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can modify own devotional progress') THEN
    CREATE POLICY "Users can modify own devotional progress" ON public.devotional_progress FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Chapter Progress
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own chapter progress') THEN
    CREATE POLICY "Users can view own chapter progress" ON public.chapter_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can modify own chapter progress') THEN
    CREATE POLICY "Users can modify own chapter progress" ON public.chapter_progress FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- User Favorites
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own favorites') THEN
    CREATE POLICY "Users can view own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can modify own favorites') THEN
    CREATE POLICY "Users can modify own favorites" ON public.user_favorites FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- User Highlights
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own highlights') THEN
    CREATE POLICY "Users can view own highlights" ON public.user_highlights FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can modify own highlights') THEN
    CREATE POLICY "Users can modify own highlights" ON public.user_highlights FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Feature Telemetry
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert telemetry events') THEN
    CREATE POLICY "Anyone can insert telemetry events" ON public.feature_telemetry FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view telemetry') THEN
    CREATE POLICY "Users can view telemetry" ON public.feature_telemetry FOR SELECT USING (true);
  END IF;
END $$;

-- 9. Trigger automático para criar profile ao registrar no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

async function main() {
  console.log('Iniciando migração no Supabase PostgreSQL...');
  await client.connect();
  console.log('✓ Conectado ao banco.');

  await client.query(SCHEMA_SQL);
  console.log('✓ Schema SQL aplicado com sucesso!');

  // Validação: listar tabelas criadas no schema public
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Tabelas existentes no schema public:');
  res.rows.forEach(r => console.log('  -', r.table_name));

  await client.end();
  console.log('✓ Migração concluída com 100% de sucesso!');
}

main().catch(err => {
  console.error('Erro na migração:', err);
  client.end();
  process.exit(1);
});
