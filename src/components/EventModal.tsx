import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event?: {
    id: string;
    name: string;
    application_start_date: string;
    application_end_date: string;
    is_manually_closed: boolean;
  };
}

export default function EventModal({ isOpen, onClose, onSuccess, event }: EventModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(event?.name || "");
  const [startDate, setStartDate] = useState(event?.application_start_date || "");
  const [endDate, setEndDate] = useState(event?.application_end_date || "");
  const [isClosed, setIsClosed] = useState(event?.is_manually_closed || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setName(event.name);
      setStartDate(event.application_start_date);
      setEndDate(event.application_end_date);
      setIsClosed(event.is_manually_closed);
    } else {
      setName("");
      setStartDate("");
      setEndDate("");
      setIsClosed(false);
    }
  }, [event]);

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    setLoading(true);

    if (event) {
      // Update existing event
      const { error } = await supabase
        .from("events")
        .update({
          name,
          application_start_date: startDate,
          application_end_date: endDate,
          is_manually_closed: isClosed,
        })
        .eq("id", event.id);

      if (error) {
        toast({ title: "Error updating event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Event updated successfully" });
        onSuccess();
        onClose();
      }
    } else {
      // Add new event
      const { error } = await supabase
        .from("events")
        .insert({
          name,
          application_start_date: startDate,
          application_end_date: endDate,
          is_manually_closed: isClosed,
        });

      if (error) {
        toast({ title: "Error creating event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Event created successfully" });
        onSuccess();
        onClose();
      }
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle>{event ? "Edit Event" : "Add Event"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Event Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start">Start Date</Label>
            <Input
              id="start"
              type="date"
              value={startDate.split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">End Date</Label>
            <Input
              id="end"
              type="date"
              value={endDate.split("T")[0]}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="closed"
              checked={isClosed}
              onChange={(e) => setIsClosed(e.target.checked)}
            />
            <Label htmlFor="closed">Manually Close Event</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : event ? "Update" : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
