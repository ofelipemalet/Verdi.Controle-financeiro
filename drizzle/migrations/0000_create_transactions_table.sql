CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  description text NOT NULL CHECK (char_length(description) BETWEEN 2 AND 80 AND description !~ '[<>]'),
  amount_cents bigint NOT NULL CHECK (amount_cents > 0 AND amount_cents <= 99999999999),
  category_id text NOT NULL,
  date date NOT NULL CHECK (date >= DATE '2000-01-01'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transactions_category_matches_type CHECK (
    (type = 'income' AND category_id IN ('salary', 'freelance', 'investments', 'gifts', 'refunds', 'other-income'))
    OR
    (type = 'expense' AND category_id IN ('housing', 'food', 'transport', 'health', 'education', 'leisure', 'shopping', 'bills', 'subscriptions', 'other-expense'))
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX transactions_user_id_date_created_idx
  ON public.transactions (user_id, date DESC, created_at DESC);

CREATE OR REPLACE FUNCTION public.validate_and_touch_transaction()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change transaction owner';
  END IF;

  IF NEW.date > (CURRENT_DATE + INTERVAL '1 year')::date THEN
    RAISE EXCEPTION 'Transaction date cannot be more than 1 year in the future';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transactions_validate_and_touch
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_and_touch_transaction();