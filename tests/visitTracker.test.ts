import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isNewVisitor,
  markAsVisited,
  getLocalVisitCount,
  incrementLocalVisitCount,
  getLastVisit
} from '../utils/visitTracker';

describe('visitTracker', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('isNewVisitor', () => {
    it('should return true for a new visitor', () => {
      expect(isNewVisitor()).toBe(true);
    });

    it('should return false after marking as visited', () => {
      markAsVisited();
      expect(isNewVisitor()).toBe(false);
    });
  });

  describe('markAsVisited', () => {
    it('should set the visited flag in localStorage', () => {
      expect(localStorage.getItem('convertly_visited')).toBeNull();
      markAsVisited();
      expect(localStorage.getItem('convertly_visited')).toBe('true');
    });

    it('should set the last visit timestamp', () => {
      markAsVisited();
      const lastVisit = localStorage.getItem('convertly_last_visit');
      expect(lastVisit).not.toBeNull();
      expect(new Date(lastVisit!).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('getLocalVisitCount', () => {
    it('should return 0 for a new visitor', () => {
      expect(getLocalVisitCount()).toBe(0);
    });

    it('should return the stored count', () => {
      localStorage.setItem('convertly_visit_count', '5');
      expect(getLocalVisitCount()).toBe(5);
    });
  });

  describe('incrementLocalVisitCount', () => {
    it('should increment from 0 to 1 for new visitor', () => {
      const count = incrementLocalVisitCount();
      expect(count).toBe(1);
      expect(getLocalVisitCount()).toBe(1);
    });

    it('should increment existing count', () => {
      localStorage.setItem('convertly_visit_count', '10');
      const count = incrementLocalVisitCount();
      expect(count).toBe(11);
      expect(getLocalVisitCount()).toBe(11);
    });

    it('should increment multiple times correctly', () => {
      incrementLocalVisitCount();
      incrementLocalVisitCount();
      incrementLocalVisitCount();
      expect(getLocalVisitCount()).toBe(3);
    });
  });

  describe('getLastVisit', () => {
    it('should return null for a new visitor', () => {
      expect(getLastVisit()).toBeNull();
    });

    it('should return the last visit timestamp after marking', () => {
      markAsVisited();
      const lastVisit = getLastVisit();
      expect(lastVisit).not.toBeNull();
      expect(new Date(lastVisit!).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('visitor flow', () => {
    it('should correctly track a complete visitor flow', () => {
      // First visit
      expect(isNewVisitor()).toBe(true);
      expect(getLocalVisitCount()).toBe(0);
      expect(getLastVisit()).toBeNull();

      // Mark as visited
      markAsVisited();
      incrementLocalVisitCount();

      // Check state after first visit
      expect(isNewVisitor()).toBe(false);
      expect(getLocalVisitCount()).toBe(1);
      expect(getLastVisit()).not.toBeNull();

      // Simulate return visit
      incrementLocalVisitCount();
      expect(getLocalVisitCount()).toBe(2);
      expect(isNewVisitor()).toBe(false);
    });
  });
});
