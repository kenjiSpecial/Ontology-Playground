import { describe, expect, it } from 'vitest';
import {
  getDisplayDescription,
  getDisplayName,
  getDisplayValue,
  matchesSearch,
} from './displayText';

describe('display text helpers', () => {
  it('prefers a display name and falls back to the internal name', () => {
    expect(getDisplayName({ name: 'Customer', displayName: '顧客' })).toBe('顧客');
    expect(getDisplayName({ name: 'Customer' })).toBe('Customer');
    expect(getDisplayName(undefined, 'unknown')).toBe('unknown');
  });

  it('prefers a display description and falls back to the internal description', () => {
    expect(getDisplayDescription({ description: 'A customer', displayDescription: '顧客を表します。' })).toBe('顧客を表します。');
    expect(getDisplayDescription({ description: 'A customer' })).toBe('A customer');
  });

  it('resolves enum display values without changing the internal value', () => {
    expect(getDisplayValue('Active', { Active: '有効' })).toBe('有効');
    expect(getDisplayValue('Active', undefined)).toBe('Active');
  });

  it('matches both display and internal text', () => {
    expect(matchesSearch('顧客', 'Customer', '顧客')).toBe(true);
    expect(matchesSearch('customer', 'Customer', '顧客')).toBe(true);
    expect(matchesSearch('注文', 'Order', '注文')).toBe(true);
    expect(matchesSearch('invoice', 'Order', '注文')).toBe(false);
  });
});
