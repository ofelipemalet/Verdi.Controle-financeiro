REVOKE ALL ON public.transactions FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;