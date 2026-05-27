import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Ensure server module selects the serverless/neon SQL path during tests
process.env.VERCEL = process.env.VERCEL || 'true';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fundiconnect_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Polyfill IntersectionObserver for motion library
if (!global.IntersectionObserver) {
  class MockIntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
    unobserve() {}
  }
  Object.defineProperty(global, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: MockIntersectionObserver,
  });
}

// Polyfill ResizeObserver
if (!global.ResizeObserver) {
  class MockResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }
  Object.defineProperty(global, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: MockResizeObserver,
  });
  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: MockResizeObserver,
  });
}

// Mock motion/react to avoid animation wrappers in jsdom
vi.mock('motion/react', () => ({
  motion: {
    div: (props: any) => props.children,
    span: (props: any) => props.children,
    button: (props: any) => props.children,
    a: (props: any) => props.children,
  },
  AnimatePresence: (props: any) => props.children,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView: () => ({ ref: null, inView: true }),
  useMotionTemplate: (template: any) => template,
}));

// Mock pg Pool to avoid real Postgres connections in integration tests
// NOTE: Do NOT mock 'pg' globally here. Integration tests (`src/tests/api-integration.test.ts`)
// provide a targeted mock of `pg` and `@neondatabase/serverless`. A global mock
// conflicts with those test-level mocks and prevents the in-memory DB from being used.

