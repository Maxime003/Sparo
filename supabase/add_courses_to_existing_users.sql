-- One-shot : ajoute la catégorie "Courses" aux utilisateurs qui ne l'ont pas encore.
-- À exécuter une seule fois dans Supabase → SQL Editor.

INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
SELECT u.id, 'Courses', 'expense', '#16a34a', 'ShoppingCart', true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.categories c
  WHERE c.user_id = u.id
    AND c.name = 'Courses'
);
