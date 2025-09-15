import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabaseClient"; // make sure you have supabaseClient.ts set up

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLogin, onCancel }: AdminLoginProps) {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ Sign in via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (authError) {
      toast({
        title: "Login Failed",
        description: authError.message,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    if (!authData.user) {
      toast({
        title: "Login Failed",
        description: "No user returned from Supabase",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // 2️⃣ Check if the user is admin
    const { data: userRole, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (roleError || userRole?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You are not authorized as an admin.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // 3️⃣ Success
    toast({
      title: "Login Successful",
      description: "Welcome to the admin dashboard!",
    });
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md gradient-card shadow-elegant border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-clip-text text-primary">
            Admin Login
          </CardTitle>
          <CardDescription>
            Access the admin dashboard to manage events and applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1 gradient-primary shadow-glow transition-smooth hover:shadow-elegant"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
