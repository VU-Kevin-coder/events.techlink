import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import AdminDashboard from '@/components/AdminDashboard';
import AdminLogin from '@/components/AdminLogin';
import heroImage from '@/assets/hero-tech-event.jpg';

type AppView = 'registration' | 'admin' | 'login';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('registration');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleViewChange = (view: 'registration' | 'admin') => {
    if (view === 'admin' && !isLoggedIn) {
      setCurrentView('login');
    } else {
      setCurrentView(view);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('registration');
  };

  const handleLoginCancel = () => {
    setCurrentView('registration');
  };

  if (currentView === 'login') {
    return <AdminLogin onLogin={handleLogin} onCancel={handleLoginCancel} />;
  }

  return (
    <div className="min-h-screen">
      <Navigation
        currentView={currentView as 'registration' | 'admin'}
        onViewChange={handleViewChange}
        isLoggedIn={isLoggedIn}
        onLogin={() => setCurrentView('login')}
        onLogout={handleLogout}
      />
      
      {currentView === 'registration' && (
        <>
          {/* Hero Section */}
          <section className="relative h-96 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
            </div>
            <div className="relative h-full flex items-center justify-center text-center px-4">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold mb-6  bg-clip-text text-primary">
                  TechLink Events
                </h1>
                <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto">
                  The ultimate platform for coding competitions, hackathons, and tech workshops. 
                  Register your team and join the innovation revolution.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 gradient-primary rounded-lg font-semibold text-primary-foreground shadow-glow transition-smooth hover:shadow-elegant"
                  >
                    Register Now
                  </button>
                  <button 
                    onClick={() => setCurrentView('login')}
                    className="px-8 py-4 bg-secondary/20 backdrop-blur-sm rounded-lg font-semibold text-foreground border border-border/50 transition-smooth hover:bg-secondary/30"
                  >
                    Admin Access
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TechLink Events?</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Built specifically for tech events with features that matter to organizers and participants
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 gradient-card rounded-xl shadow-card border border-border/50">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Team Management</h3>
                  <p className="text-muted-foreground">
                    Dynamic team formation with flexible group sizes and easy member management
                  </p>
                </div>
                
                <div className="text-center p-6 gradient-card rounded-xl shadow-card border border-border/50">
                  <div className="w-16 h-16 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
                  <p className="text-muted-foreground">
                    Automated application windows with date-based controls and admin overrides
                  </p>
                </div>
                
                <div className="text-center p-6 gradient-card rounded-xl shadow-card border border-border/50">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Analytics & Export</h3>
                  <p className="text-muted-foreground">
                    Comprehensive dashboard with insights and easy data export for reporting
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Registration Form Section */}
          <div id="registration-form">
            <EventRegistrationForm />
          </div>
        </>
      )}
      
      {currentView === 'admin' && <AdminDashboard />}
    </div>
  );
};

export default Index;
