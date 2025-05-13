-- Create demo_requests table
CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Add RLS (Row Level Security) policies
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting demo requests (anyone can insert)
CREATE POLICY "Anyone can insert demo requests" ON demo_requests 
  FOR INSERT WITH CHECK (true);

-- Create policy for viewing demo requests (only authenticated users with admin role)
CREATE POLICY "Only admins can view demo requests" ON demo_requests 
  FOR SELECT USING (auth.role() = 'admin');
