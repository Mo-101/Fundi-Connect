/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// DOCTRINE — DO NOT REMOVE
// FundiConnect charges KES 100 ONCE at registration. 
// No subscription. No commission on fundi work. No monthly fee. EVER.
// Platform survives on Asante Drop tips and public/CSR funding.
// If you are reading this and considering a recurring fee model, STOP.
// Talk to the Flame Architect first.

// DOCTRINE — DO NOT REMOVE  
// Skill is visible through WORK, not credentials.
// Never add a "verified degree" or "certified by X institute" filter.
// A mason with 50 jobs ranks above an architecture grad with 0.
// This is the entire thesis of the platform.

// DOCTRINE — DO NOT REMOVE
// USSD, Voice, SMS, Kiosk are FIRST-CLASS channels.
// They are not "fallbacks." They are not "lite versions."
// Every feature must work on a feature phone or it does not ship.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import OfflineSelector from './pages/OfflineSelector';
import USSDSimulator from './pages/USSDSimulator';
import VoiceSimulator from './pages/VoiceSimulator';
import SMSSimulator from './pages/SMSSimulator';
import KioskList from './pages/KioskList';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import RegisterWorker from './pages/RegisterWorker';
import JobRequest from './pages/JobRequest';
import JobBoard from './pages/JobBoard';
import MapExplorer from './pages/MapExplorer';
import SkillExplorer from './pages/SkillExplorer';
import CategoryDetail from './pages/CategoryDetail';
import Community from './pages/Community';
import Messages from './pages/Messages';
import ChatRoom from './pages/ChatRoom';
import Payments from './pages/Payments';
import AsanteDrop from './pages/AsanteDrop';
import VerifyWorker from './pages/VerifyWorker';
import Reviews from './pages/Reviews';
import AdminDashboard from './pages/AdminDashboard';

// Placeholder or shared layouts could go here

import SmartphoneLayout from './components/standard/AppShell';
import NotFound from './pages/NotFound';

import Profile from './pages/Profile';
import Settings from './pages/Settings';

export default function App() {
  useEffect(() => {
    const handleFrameErrors = (e: ErrorEvent | PromiseRejectionEvent) => {
      const message = 'reason' in e ? (e.reason?.message || String(e.reason)) : e.message;
      if (message?.includes("Failed to read a named property 'origin'") || 
          message?.includes("cross-origin frame") ||
          message?.includes("Location.origin") ||
          message?.includes("SecurityError")) {
        if ('stopImmediatePropagation' in e) e.stopImmediatePropagation();
        if ('preventDefault' in e) e.preventDefault();
      }
    };
    window.addEventListener('error', handleFrameErrors);
    window.addEventListener('unhandledrejection', handleFrameErrors);
    return () => {
      window.removeEventListener('error', handleFrameErrors);
      window.removeEventListener('unhandledrejection', handleFrameErrors);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-cream selection:bg-brand-olive/20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/offline" element={<OfflineSelector />} />
          <Route path="/ussd" element={<USSDSimulator />} />
          <Route path="/voice" element={<VoiceSimulator />} />
          <Route path="/sms" element={<SMSSimulator />} />
          <Route path="/kiosks" element={<KioskList />} />
          
          <Route path="/smartphone" element={<SmartphoneLayout />}>
            <Route path="auth" element={<Auth />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="register-skill" element={<RegisterWorker />} />
            <Route path="request-job" element={<JobRequest />} />
            <Route path="jobs" element={<JobBoard />} />
            <Route path="mesh" element={<MapExplorer />} />
            <Route path="skills" element={<SkillExplorer />} />
            <Route path="category/:category" element={<CategoryDetail />} />
            <Route path="community" element={<Community />} />
            <Route path="messages" element={<Messages />} />
            <Route path="chat/:chatId" element={<ChatRoom />} />
            <Route path="payments" element={<Payments />} />
            <Route path="asante-drop" element={<AsanteDrop />} />
            <Route path="verify-worker" element={<VerifyWorker />} />
            <Route path="reviews/:workerId" element={<Reviews />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route index element={<Navigate to="auth" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
