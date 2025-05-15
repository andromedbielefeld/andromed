-- Create the trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create insurance types table
CREATE TABLE IF NOT EXISTS insurance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS insurance_types_name_idx ON insurance_types (name);

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_insurance_types_modtime ON insurance_types;
CREATE TRIGGER update_insurance_types_modtime
    BEFORE UPDATE ON insurance_types
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Insert default insurance types
INSERT INTO insurance_types (name, description) VALUES
    ('Gesetzliche Krankenversicherung', 'Standard-Leistungen nach dem gesetzlichen Katalog'),
    ('Private Krankenversicherung', 'Erweiterte Leistungen nach individuellem Tarif'),
    ('Selbstzahler', 'Patient zahlt alle Leistungen selbst'),
    ('Berufsgenossenschaft', 'Leistungen im Rahmen eines Arbeitsunfalls')
ON CONFLICT (id) DO NOTHING;

-- Add reference in patients table if it exists
DO $$
DECLARE
    patients_exists boolean;
    column_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'patients'
    ) INTO patients_exists;
    
    IF patients_exists THEN
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'patients' 
            AND column_name = 'insurance_type_id'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            ALTER TABLE patients 
            ADD COLUMN insurance_type_id UUID REFERENCES insurance_types(id);
            
            CREATE INDEX IF NOT EXISTS patients_insurance_type_idx 
            ON patients(insurance_type_id);
        END IF;
    END IF;
END $$;