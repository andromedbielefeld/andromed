/*
  # Admin-Berechtigungen für alle Tabellen

  1. Änderungen
    - Entfernen der bestehenden Policies
    - Erstellen neuer Policies für alle Tabellen:
      - Leserechte für alle authentifizierten Benutzer
      - Volle Rechte für Admin-Benutzer
  
  2. Sicherheit
    - Admins haben volle Kontrolle über alle Tabellen
    - Andere authentifizierte Benutzer haben nur Leserechte
    - Überprüfung der Admin-Rolle über JWT
*/

-- Device Categories
DROP POLICY IF EXISTS "Authenticated users can view device categories" ON device_categories;
DROP POLICY IF EXISTS "Only admins can insert device categories" ON device_categories;
DROP POLICY IF EXISTS "Only admins can update device categories" ON device_categories;
DROP POLICY IF EXISTS "Only admins can delete device categories" ON device_categories;

CREATE POLICY "Enable read access for all users"
ON device_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON device_categories
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Devices
DROP POLICY IF EXISTS "Anyone can view devices" ON devices;
DROP POLICY IF EXISTS "Only admins can insert devices" ON devices;
DROP POLICY IF EXISTS "Only admins can update devices" ON devices;
DROP POLICY IF EXISTS "Only admins can delete devices" ON devices;

CREATE POLICY "Enable read access for all users"
ON devices
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON devices
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Device Working Hours
DROP POLICY IF EXISTS "Anyone can view device working hours" ON device_working_hours;
DROP POLICY IF EXISTS "Only admins can insert device working hours" ON device_working_hours;
DROP POLICY IF EXISTS "Only admins can update device working hours" ON device_working_hours;
DROP POLICY IF EXISTS "Only admins can delete device working hours" ON device_working_hours;

CREATE POLICY "Enable read access for all users"
ON device_working_hours
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON device_working_hours
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Device Exceptions
DROP POLICY IF EXISTS "Anyone can view device exceptions" ON device_exceptions;
DROP POLICY IF EXISTS "Only admins can insert device exceptions" ON device_exceptions;
DROP POLICY IF EXISTS "Only admins can update device exceptions" ON device_exceptions;
DROP POLICY IF EXISTS "Only admins can delete device exceptions" ON device_exceptions;

CREATE POLICY "Enable read access for all users"
ON device_exceptions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON device_exceptions
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Examination Categories
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON examination_categories;
DROP POLICY IF EXISTS "Enable all access for admin users" ON examination_categories;

CREATE POLICY "Enable read access for all users"
ON examination_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON examination_categories
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Examinations
DROP POLICY IF EXISTS "Anyone can view examinations" ON examinations;
DROP POLICY IF EXISTS "Only admins can insert examinations" ON examinations;
DROP POLICY IF EXISTS "Only admins can update examinations" ON examinations;
DROP POLICY IF EXISTS "Only admins can delete examinations" ON examinations;

CREATE POLICY "Enable read access for all users"
ON examinations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON examinations
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Examination Devices
DROP POLICY IF EXISTS "Anyone can view examination devices" ON examination_devices;
DROP POLICY IF EXISTS "Only admins can insert examination devices" ON examination_devices;
DROP POLICY IF EXISTS "Only admins can update examination devices" ON examination_devices;
DROP POLICY IF EXISTS "Only admins can delete examination devices" ON examination_devices;

CREATE POLICY "Enable read access for all users"
ON examination_devices
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON examination_devices
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');