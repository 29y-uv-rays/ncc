-- ============================================================================
-- RINCC Cadet Points System - Supabase Schema
-- Run this in the Supabase SQL editor (or via supabase db push).
-- ============================================================================

-- Drop existing objects to allow re-runs (safe in dev only)
DROP TABLE IF EXISTS public.points_logs CASCADE;
DROP TABLE IF EXISTS public.cadets CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.platoon_stats CASCADE;
DROP TABLE IF EXISTS public.content CASCADE;
DROP TABLE IF EXISTS public.admin_auth CASCADE;

-- ---------------------------------------------------------------------------
-- cadets
-- ---------------------------------------------------------------------------
CREATE TABLE public.cadets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  platoon TEXT NOT NULL CHECK (platoon IN ('P1','P2','P3','SPEC')),
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cadets_platoon_idx ON public.cadets (platoon);
CREATE INDEX cadets_total_points_idx ON public.cadets (total_points DESC);

-- ---------------------------------------------------------------------------
-- points_logs
-- ---------------------------------------------------------------------------
CREATE TABLE public.points_logs (
  id BIGSERIAL PRIMARY KEY,
  cadet_id BIGINT NOT NULL REFERENCES public.cadets(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('drills','pt','ifc','misc')),
  reason TEXT NOT NULL,
  awarded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX points_logs_cadet_idx ON public.points_logs (cadet_id, created_at DESC);
CREATE INDEX points_logs_category_idx ON public.points_logs (category);

-- ---------------------------------------------------------------------------
-- rewards
-- ---------------------------------------------------------------------------
CREATE TABLE public.rewards (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- platoon_stats
-- ---------------------------------------------------------------------------
CREATE TABLE public.platoon_stats (
  id BIGSERIAL PRIMARY KEY,
  platoon TEXT NOT NULL UNIQUE CHECK (platoon IN ('P1','P2','P3','SPEC')),
  drills_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  pt_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  ifc_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  roadmap_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  volunteer_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- content (notes, contact)
-- ---------------------------------------------------------------------------
CREATE TABLE public.content (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- admin_auth
-- ---------------------------------------------------------------------------
CREATE TABLE public.admin_auth (
  id BIGSERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Enable RLS and create policies for the service role / anon key access.
-- The service role bypasses RLS; the anon key is restricted per policy.
-- ---------------------------------------------------------------------------
ALTER TABLE public.cadets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platoon_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read cadets"
  ON public.cadets FOR SELECT
  USING (true);

CREATE POLICY "Public read rewards"
  ON public.rewards FOR SELECT
  USING (true);

CREATE POLICY "Public read platoon_stats"
  ON public.platoon_stats FOR SELECT
  USING (true);

CREATE POLICY "Public read content"
  ON public.content FOR SELECT
  USING (true);

-- Block anonymous write access. All mutations go through the API routes
-- using the service role key, which bypasses RLS.
CREATE POLICY "No anon insert cadets"
  ON public.cadets FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No anon update cadets"
  ON public.cadets FOR UPDATE
  USING (false);

CREATE POLICY "No anon delete cadets"
  ON public.cadets FOR DELETE
  USING (false);

CREATE POLICY "No anon insert points_logs"
  ON public.points_logs FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No anon select points_logs"
  ON public.points_logs FOR SELECT
  USING (false);

CREATE POLICY "No anon update points_logs"
  ON public.points_logs FOR UPDATE
  USING (false);

CREATE POLICY "No anon delete points_logs"
  ON public.points_logs FOR DELETE
  USING (false);

CREATE POLICY "No anon write rewards"
  ON public.rewards FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No anon update rewards"
  ON public.rewards FOR UPDATE
  USING (false);

CREATE POLICY "No anon delete rewards"
  ON public.rewards FOR DELETE
  USING (false);

CREATE POLICY "No anon write platoon_stats"
  ON public.platoon_stats FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No anon update platoon_stats"
  ON public.platoon_stats FOR UPDATE
  USING (false);

CREATE POLICY "No anon delete platoon_stats"
  ON public.platoon_stats FOR DELETE
  USING (false);

CREATE POLICY "No anon write content"
  ON public.content FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No anon update content"
  ON public.content FOR UPDATE
  USING (false);

CREATE POLICY "No anon delete content"
  ON public.content FOR DELETE
  USING (false);

CREATE POLICY "No anon access admin_auth"
  ON public.admin_auth FOR SELECT
  USING (false);

-- ---------------------------------------------------------------------------
-- Atomic "award points" function
-- Inserts a log row and updates cadet.total_points in a single statement
-- so concurrent calls cannot desync the cached total.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_points(
  p_cadet_id BIGINT,
  p_points INTEGER,
  p_category TEXT,
  p_reason TEXT,
  p_awarded_by TEXT
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category_valid BOOLEAN;
  v_new_total INTEGER;
BEGIN
  IF p_cadet_id IS NULL OR p_points IS NULL THEN
    RAISE EXCEPTION 'cadet_id and points are required' USING ERRCODE = '22023';
  END IF;

  v_category_valid := p_category IN ('drills', 'pt', 'ifc', 'misc');
  IF NOT v_category_valid THEN
    RAISE EXCEPTION 'invalid category' USING ERRCODE = '22023';
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'reason is required' USING ERRCODE = '22023';
  END IF;

  IF p_awarded_by IS NULL OR length(trim(p_awarded_by)) = 0 THEN
    RAISE EXCEPTION 'awarded_by is required' USING ERRCODE = '22023';
  END IF;

  IF p_points = 0 THEN
    RAISE EXCEPTION 'points cannot be zero' USING ERRCODE = '22023';
  END IF;

  UPDATE public.cadets
     SET total_points = total_points + p_points,
         updated_at   = now()
   WHERE id = p_cadet_id
   RETURNING total_points INTO v_new_total;

  IF v_new_total IS NULL THEN
    RAISE EXCEPTION 'cadet not found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.points_logs (cadet_id, points, category, reason, awarded_by)
  VALUES (p_cadet_id, p_points, p_category, p_reason, p_awarded_by);

  RETURN v_new_total;
END;
$$;

REVOKE ALL ON FUNCTION public.award_points(BIGINT, INTEGER, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_points(BIGINT, INTEGER, TEXT, TEXT, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- Recompute a cadet's total_points from the log table
-- Useful as a safety net to recover from desync.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recompute_cadet_points(p_cadet_id BIGINT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(points), 0)
    INTO v_total
    FROM public.points_logs
   WHERE cadet_id = p_cadet_id;

  UPDATE public.cadets
     SET total_points = v_total,
         updated_at   = now()
   WHERE id = p_cadet_id
   RETURNING total_points INTO v_total;

  RETURN v_total;
END;
$$;

REVOKE ALL ON FUNCTION public.recompute_cadet_points(BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_cadet_points(BIGINT) TO service_role;
