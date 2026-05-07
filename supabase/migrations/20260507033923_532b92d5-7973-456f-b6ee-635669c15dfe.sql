
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  region TEXT DEFAULT 'US',
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Scans (single source of truth for scan + AI result)
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  image_url TEXT,
  item_name TEXT,
  category TEXT,
  brand TEXT,
  condition_note TEXT,
  demand TEXT CHECK (demand IN ('High','Medium','Low')),
  price_low NUMERIC,
  price_high NUMERIC,
  est_fees NUMERIC,
  est_profit NUMERIC,
  recommended_marketplace TEXT,
  best_for_fast_sale TEXT,
  best_for_highest_price TEXT,
  confidence NUMERIC,
  time_to_sell TEXT,
  recommendation TEXT CHECK (recommendation IN ('Buy','Pass','Negotiate')),
  scam_risk TEXT,
  underpriced_alert BOOLEAN DEFAULT false,
  explanation TEXT,
  currency TEXT DEFAULT 'USD',
  region TEXT DEFAULT 'US',
  user_cost NUMERIC,
  notes TEXT,
  saved BOOLEAN DEFAULT false,
  watchlisted BOOLEAN DEFAULT false,
  sold BOOLEAN DEFAULT false,
  sold_price NUMERIC,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scans all" ON public.scans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trending categories (public read)
CREATE TABLE public.category_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  demand TEXT CHECK (demand IN ('High','Medium','Low')),
  trend_score INTEGER DEFAULT 0,
  hot_items TEXT,
  region TEXT DEFAULT 'GLOBAL',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.category_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trends public read" ON public.category_trends FOR SELECT USING (true);

INSERT INTO public.category_trends (category, demand, trend_score, hot_items, region) VALUES
  ('Sneakers','High',95,'Jordan 1, Yeezy, Dunk Low','GLOBAL'),
  ('Vintage Denim','High',88,'Levi''s 501, Carhartt jackets','GLOBAL'),
  ('Retro Video Games','High',91,'N64, GameCube, Pokemon cartridges','GLOBAL'),
  ('Power Tools','Medium',74,'Milwaukee, DeWalt, Makita','GLOBAL'),
  ('Designer Bags','High',86,'Coach, Louis Vuitton, Prada','GLOBAL'),
  ('LEGO Sets','High',82,'Star Wars, Modular, Retired sets','GLOBAL'),
  ('Cameras','Medium',70,'Film SLR, Polaroid, Canon AE-1','GLOBAL'),
  ('Vinyl Records','Medium',68,'Rock, Jazz first pressings','GLOBAL');

-- Storage bucket for scan images
INSERT INTO storage.buckets (id, name, public) VALUES ('scans','scans', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "scans bucket public read" ON storage.objects FOR SELECT USING (bucket_id = 'scans');
CREATE POLICY "scans bucket auth upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'scans' AND auth.uid() IS NOT NULL);
CREATE POLICY "scans bucket owner update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'scans' AND auth.uid() = owner);
CREATE POLICY "scans bucket owner delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'scans' AND auth.uid() = owner);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
