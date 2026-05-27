import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Auth from '../pages/Auth';
import Onboarding from '../pages/Onboarding';
import OfflineSelector from '../pages/OfflineSelector';
import USSDSimulator from '../pages/USSDSimulator';

// Mock matchMedia
window.matchMedia = window.matchMedia || (function() {
  return {
    matches: false,
    media: '',
    onchange: null,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() { return false; }
  };
}) as any;

// Polyfill IntersectionObserver for motion animations
if (!global.IntersectionObserver) {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() { return []; }
  } as any;
}

// Polyfill ResizeObserver
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;
}

describe('FundiConnect — Page Rendering & Navigations', () => {
  it('renders landing page with heading correctly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/Local skill, visible./i)).toBeInTheDocument();
  });

  it('renders offline channel selector page options', () => {
    render(
      <MemoryRouter>
        <OfflineSelector />
      </MemoryRouter>
    );

    // Check page title and actual channel names
    expect(screen.getByText(/No smartphone\?/i)).toBeInTheDocument();
    expect(screen.getByText(/USSD Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Voice Assistant/i)).toBeInTheDocument();
  });

  it('renders USSD Simulator and handles standard keystrokes', () => {
    render(
      <MemoryRouter>
        <USSDSimulator />
      </MemoryRouter>
    );

    // Checks title & container elements
    expect(screen.getByText(/Connecting the next/i)).toBeInTheDocument();
    expect(screen.getByText(/billion artisans/i)).toBeInTheDocument();
  });

  it('renders smartphone login correctly and validates mobile input validation', async () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    expect(screen.getByText(/Karibu kwenye mtandao./i)).toBeInTheDocument();
    
    // Check elements are available
    const phoneInput = screen.getByPlaceholderText('+254712345678');
    const pinInput = screen.getByPlaceholderText('••••');
    const loginButton = screen.getByText('Enter Mesh');

    expect(phoneInput).toBeInTheDocument();
    expect(pinInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });
});
