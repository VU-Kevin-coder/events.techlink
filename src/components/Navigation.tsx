import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Settings, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: 'registration' | 'admin';
  onViewChange: (view: 'registration' | 'admin') => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navigation({ currentView, onViewChange, isLoggedIn, onLogin, onLogout }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold bg-clip-text text-primary">
                TechLink Events
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <Button
                  variant={currentView === 'registration' ? 'default' : 'ghost'}
                  onClick={() => onViewChange('registration')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Register
                </Button>
                {isLoggedIn && (
                  <Button
                    variant={currentView === 'admin' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('admin')}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Admin Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                onClick={onLogin}
                className="gradient-primary shadow-glow"
              >
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}