-- Erstelle die Tabelle für Versicherungsarten
CREATE TABLE IF NOT EXISTS insurance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für schnellere Suche
CREATE INDEX IF NOT EXISTS insurance_types_name_idx ON insurance_types (name);

-- Füge einige Standardwerte ein
INSERT INTO insurance_types (name, description) VALUES
('Gesetzliche Krankenversicherung', 'Standard-Leistungen nach dem gesetzlichen Katalog'),
('Private Krankenversicherung', 'Erweiterte Leistungen nach individuellem Tarif'),
('Selbstzahler', 'Patient zahlt alle Leistungen selbst'),
('Berufsgenossenschaft', 'Leistungen im Rahmen eines Arbeitsunfalls')
ON CONFLICT (id) DO NOTHING;

-- Trigger für automatisches updated_at
DO $$
BEGIN
    -- Create the trigger function if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_modified_column') THEN
        CREATE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;

    -- Create the trigger if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_insurance_types_modtime') THEN
        CREATE TRIGGER update_insurance_types_modtime
        BEFORE UPDATE ON insurance_types
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;
END
$$;

-- Wenn es eine patients-Tabelle gibt, fügen wir dort eine Referenz ein
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'patients') THEN
        -- Prüfen, ob die Spalte bereits existiert
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'patients' 
                      AND column_name = 'insurance_type_id') THEN
            -- Spalte hinzufügen
            ALTER TABLE patients ADD COLUMN insurance_type_id UUID REFERENCES insurance_types(id);
            -- Index erstellen
            CREATE INDEX IF NOT EXISTS patients_insurance_type_idx ON patients(insurance_type_id);
        END IF;
    END IF;
END
$$;