-- Script SQL de mitigación de seguridad para Supabase
-- Activa Row Level Security (RLS) en todas las tablas públicas para cerrar
-- la vulnerabilidad rls_disabled_in_public.

ALTER TABLE IF EXISTS "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."task_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."activity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."rewards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."reward_redemptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."notification_states" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;
