-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  application_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  application_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_manually_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_names JSONB NOT NULL,
  university TEXT NOT NULL,
  group_size INTEGER NOT NULL,
  group_leader_email TEXT NOT NULL,
  group_leader_phone TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Events policies (readable by everyone, admin can manage)
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage events" 
ON public.events 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Applications policies (viewable by everyone for now, admin can manage)
CREATE POLICY "Applications are viewable by everyone" 
ON public.applications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage applications" 
ON public.applications 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_applications_event_id ON public.applications(event_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_events_dates ON public.events(application_start_date, application_end_date);