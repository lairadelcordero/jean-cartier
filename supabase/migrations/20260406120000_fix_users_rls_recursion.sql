-- users_select_admin hacía EXISTS (SELECT ... FROM public.users ...), lo que disparaba
-- otra vez las policies de users → "infinite recursion detected in policy for relation users".
-- Esta función corre como SECURITY DEFINER y lee el rol sin aplicar RLS.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT u.role FROM public.users u WHERE u.id = auth.uid() LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "users_select_admin" ON public.users;

CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (public.current_user_role() = 'admin');
