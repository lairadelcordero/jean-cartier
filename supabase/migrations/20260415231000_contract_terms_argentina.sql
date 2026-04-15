-- Commercial terms updates for Argentina-only licensing contracts

ALTER TABLE public.licenciatario_commercial_terms
  ADD COLUMN IF NOT EXISTS contract_type text NOT NULL DEFAULT 'installments',
  ADD COLUMN IF NOT EXISTS billing_frequency text,
  ADD COLUMN IF NOT EXISTS usd_ars_exchange_rate numeric(12, 4),
  ADD COLUMN IF NOT EXISTS installments_count integer;

ALTER TABLE public.licenciatario_commercial_terms
  DROP CONSTRAINT IF EXISTS licenciatario_commercial_terms_contract_type_chk,
  ADD CONSTRAINT licenciatario_commercial_terms_contract_type_chk
    CHECK (contract_type IN ('one_time', 'installments'));

ALTER TABLE public.licenciatario_commercial_terms
  DROP CONSTRAINT IF EXISTS licenciatario_commercial_terms_billing_frequency_chk,
  ADD CONSTRAINT licenciatario_commercial_terms_billing_frequency_chk
    CHECK (
      billing_frequency IS NULL OR
      billing_frequency IN ('monthly', 'quarterly', 'semiannual', 'annual')
    );

ALTER TABLE public.licenciatario_commercial_terms
  DROP CONSTRAINT IF EXISTS licenciatario_commercial_terms_installments_count_chk,
  ADD CONSTRAINT licenciatario_commercial_terms_installments_count_chk
    CHECK (installments_count IS NULL OR installments_count > 0);

ALTER TABLE public.licenciatario_commercial_terms
  DROP CONSTRAINT IF EXISTS licenciatario_commercial_terms_currency_argentina_chk,
  ADD CONSTRAINT licenciatario_commercial_terms_currency_argentina_chk
    CHECK (currency IN ('ARS', 'USD'));

ALTER TABLE public.licenciatario_commercial_terms
  DROP CONSTRAINT IF EXISTS licenciatario_commercial_terms_usd_rate_chk,
  ADD CONSTRAINT licenciatario_commercial_terms_usd_rate_chk
    CHECK (
      (currency = 'USD' AND usd_ars_exchange_rate IS NOT NULL AND usd_ars_exchange_rate > 0) OR
      (currency = 'ARS' AND usd_ars_exchange_rate IS NULL)
    );

ALTER TABLE public.licenciatario_commercial_terms
  DROP CONSTRAINT IF EXISTS licenciatario_commercial_terms_contract_shape_chk,
  ADD CONSTRAINT licenciatario_commercial_terms_contract_shape_chk
    CHECK (
      (contract_type = 'one_time' AND billing_frequency IS NULL AND installments_count IS NULL) OR
      (contract_type = 'installments' AND billing_frequency IS NOT NULL)
    );

