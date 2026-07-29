import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SplashScreen } from './pages/SplashScreen';
import { LoginScreen } from './pages/LoginScreen';
import { ReporterDashboard } from './pages/ReporterDashboard';
import { LocalBodyDashboard } from './pages/LocalBodyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportWastePage } from './pages/ReportWastePage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { HotspotsPage } from './pages/HotspotsPage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { AnalyticsReportsPage } from './pages/AnalyticsReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isLoggedIn, role } = useAuth();
  const { activeTab, toast } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // First time Splash screen view
  if (showSplash) {
    return <SplashScreen onContinue={() => setShowSplash(false)} />;
  }

  // Authentication check
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setShowSplash(false)} />;
  }

  // Active Tab View Routing
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (role === 'Local Body') return <LocalBodyDashboard />;
        if (role === 'Administrator') return <AdminDashboard />;
        return <ReporterDashboard />;
      case 'report-waste':
        return <ReportWastePage />;
      case 'my-complaints':
        return <MyComplaintsPage />;
      case 'complaint-details':
        return <ComplaintDetailsPage />;
      case 'hotspots':
        return <HotspotsPage />;
      case 'manage-users':
        return <ManageUsersPage />;
      case 'analytics':
        return <AnalyticsReportsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <ReporterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2E9E4] text-[#22223B] flex flex-col font-body">
      {/* Top Navigation */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar isOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderTabContent()}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-[#22223B] text-white border-[#4A4E69]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}
