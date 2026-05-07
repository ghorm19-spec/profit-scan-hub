
DROP POLICY IF EXISTS "scans bucket public read" ON storage.objects;
CREATE POLICY "scans bucket owner read" ON storage.objects FOR SELECT
  USING (bucket_id = 'scans' AND auth.uid() = owner);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
