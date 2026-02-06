-- Savest: Initial Schema Migration
-- Creates tables for user settings, question variants, savings records, and effectiveness tracking

-- 1. user_settings: Store user preferences (synced across devices)
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  enabled boolean DEFAULT true,
  confirm_before_purchase boolean DEFAULT false,
  return_rate numeric DEFAULT 7,
  years integer DEFAULT 10,
  min_price numeric DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. question_variants: A/B test different question phrasings
CREATE TABLE question_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  subtext text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. savings: Individual savings records (optimized for time queries)
CREATE TABLE savings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price numeric NOT NULL,
  currency text DEFAULT 'USD',
  url text,
  product_title text,
  question_variant_id uuid REFERENCES question_variants(id),
  user_response text CHECK (user_response IN ('need', 'want')),
  final_decision text CHECK (final_decision IN ('skipped', 'purchased')),
  created_at timestamptz DEFAULT now()
);

-- Indexes for time-range queries on savings
CREATE INDEX idx_savings_user_created ON savings(user_id, created_at);
CREATE INDEX idx_savings_user_decision ON savings(user_id, final_decision);

-- 4. question_effectiveness: Aggregate stats per user per variant
CREATE TABLE question_effectiveness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_variant_id uuid REFERENCES question_variants(id) NOT NULL,
  times_shown integer DEFAULT 0,
  times_skipped integer DEFAULT 0,
  total_saved numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_variant_id)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for question_effectiveness
CREATE TRIGGER update_question_effectiveness_updated_at
  BEFORE UPDATE ON question_effectiveness
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- user_settings: Users can only see/modify their own settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- savings: Users can only see/modify their own savings
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings"
  ON savings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings"
  ON savings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings"
  ON savings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings"
  ON savings FOR DELETE
  USING (auth.uid() = user_id);

-- question_effectiveness: Users can only see/modify their own stats
ALTER TABLE question_effectiveness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own effectiveness"
  ON question_effectiveness FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own effectiveness"
  ON question_effectiveness FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own effectiveness"
  ON question_effectiveness FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own effectiveness"
  ON question_effectiveness FOR DELETE
  USING (auth.uid() = user_id);

-- question_variants: Readable by all authenticated users
ALTER TABLE question_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read variants"
  ON question_variants FOR SELECT
  USING (auth.role() = 'authenticated');
