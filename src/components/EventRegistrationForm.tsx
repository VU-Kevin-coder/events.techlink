"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MinusCircle, Users, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/supabaseClient';

interface FormData {
projectName: string;
  university: string;
  groupSize: number;
  groupMembers: string[];
  leaderEmail: string;
  leaderPhone: string;
  selectedEvent: string;
  problemStatement: string;   // 🆕
  solution: string;
}

interface Event {
  id: string;
  name: string;
  application_start_date: string;
  application_end_date: string;
  is_manually_closed: boolean;
}

export default function EventRegistrationForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    university: "",
    groupSize: 1,
    groupMembers: [""],
    leaderEmail: "",
    leaderPhone: "",
    selectedEvent: "",
    problemStatement: "",  // 🆕
    solution: "",          // 🆕
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("application_start_date", { ascending: true });

      if (error) {
        console.error(error);
        toast({
          title: "Error fetching events",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [toast]);

  const selectedEventData = events.find((e) => e.id === formData.selectedEvent);

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.application_start_date);
    const end = new Date(event.application_end_date);

    if (event.is_manually_closed || now > end) return "closed";
    if (now < start) return "upcoming";
    return "open";
  };

  const canRegister = selectedEventData && getEventStatus(selectedEventData) === "open";

  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      groupSize: prev.groupSize + 1,
      groupMembers: [...prev.groupMembers, ""],
    }));
  };

  const handleRemoveMember = (index: number) => {
    if (formData.groupSize > 1) {
      setFormData((prev) => ({
        ...prev,
        groupSize: prev.groupSize - 1,
        groupMembers: prev.groupMembers.filter((_, i) => i !== index),
      }));
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.map((m, i) => (i === index ? value : m)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventData || !canRegister) {
      toast({
        title: "Registration Not Available",
        description: "This event is not open for registration.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (
      !formData.projectName ||
      !formData.university ||
      !formData.leaderEmail ||
      !formData.leaderPhone ||
      !formData.selectedEvent
    ) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    // Insert into Supabase
    const { error } = await supabase.from("applications").insert([
      {
        event_id: formData.selectedEvent,
        project_name: formData.projectName,
        full_names: JSON.stringify(formData.groupMembers),
        university: formData.university,
        group_size: formData.groupSize,
        group_leader_email: formData.leaderEmail,
        group_leader_phone: formData.leaderPhone,
        problem_statement: formData.problemStatement,   // 🆕
        solution: formData.solution,           
      },
    ]);

    if (error) {
      toast({
        title: "Error submitting registration",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Registration Submitted!",
      description: `Successfully registered for ${selectedEventData.name}. You'll receive a confirmation email shortly.`,
    });

    // Reset form
    setFormData({
      projectName: "",
      university: "",
      groupSize: 1,
      groupMembers: [""],
      leaderEmail: "",
      leaderPhone: "",
      selectedEvent: "",
      problemStatement: "",  // new
      solution: "",          // new
    });
  };

  if (loading) {
    return <p className="text-center text-gray-400">Loading events...</p>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-primary">
            Event Registration
          </h1>
          <p className="text-muted-foreground text-lg">
            Register for coding competitions, hackathons, and workshops
          </p>
        </div>

        <Card className="gradient-card shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Registration Form
            </CardTitle>
            <CardDescription>
              Fill out the form below to register your team for an upcoming event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Selection */}
              <div className="space-y-2">
                <Label htmlFor="event">Choose Event *</Label>
                <Select
                  value={formData.selectedEvent}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, selectedEvent: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => {
                      const status = getEventStatus(event);
                      return (
                        <SelectItem key={event.id} value={event.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{event.name}</span>
                            <span
                              className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                status === "open"
                                  ? "bg-green-600 text-white"
                                  : status === "upcoming"
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-600 text-white"
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="Enter your project name"
                      required
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University *</Label>
                  <Input
                    id="university"
                    value={formData.university}
                    onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
                    placeholder="University name"
                    required
                  />
                </div>
              </div>
              {/* Problem Statement */}
              <div className="space-y-2">
                <Label htmlFor="problemStatement">Problem Statement *</Label>
                <textarea
                  id="problemStatement"
                  value={formData.problemStatement}
                  onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                  placeholder="Describe the problem your project aims to solve"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                />
              </div>

              {/* Proposed Solution */}
              <div className="space-y-2">
                <Label htmlFor="solution">Proposed Solution *</Label>
                  <div className="relative">
                <textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                  placeholder="Explain your solution approach"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                />
                </div>
              </div>
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Group Leader Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.leaderEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, leaderEmail: e.target.value }))}
                      placeholder="leader@university.edu"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Group Leader Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.leaderPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, leaderPhone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Group Members */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Group Members ({formData.groupSize})</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMember}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Member
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.groupMembers.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={member}
                        onChange={(e) => handleMemberChange(index, e.target.value)}
                        placeholder={`Member ${index + 1} name${index === 0 ? " (Team Leader)" : ""}`}
                        className="flex-1"
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveMember(index)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-primary shadow-glow transition-smooth hover:shadow-elegant"
                disabled={!canRegister}
              >
                {canRegister ? "Submit Registration" : "Registration Not Available"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
