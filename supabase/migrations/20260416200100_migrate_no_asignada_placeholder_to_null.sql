-- Sustituye la ficha placeholder «No asignada» por NULL en licencias; elimina la ficha si quedó huérfana.
UPDATE public.licenciatario_licenses AS l
SET licenciatario_id = NULL
FROM public.licenciatarios AS li
WHERE l.licenciatario_id = li.id
  AND li.rut_cuit = '99-99999999-9';

DELETE FROM public.licenciatarios
WHERE rut_cuit = '99-99999999-9';
