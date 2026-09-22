import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LoadingView from '../LoadingView';

describe('LoadingView', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('walks the five stages in order and finishes once', () => {
    const onComplete = vi.fn();
    render(<LoadingView onComplete={onComplete} mobile={false} />);
    const items = () => Array.from(screen.getByRole('list', { name: 'Stages' }).children);
    const current = () => items().findIndex(li => li.getAttribute('aria-current') === 'step');

    expect(current()).toBe(0);
    act(() => vi.advanceTimersByTime(2500));
    expect(current()).toBe(1);
    expect(items()[0].textContent).toContain('Parse');
    expect(items()[0].textContent).toContain('DONE');
    act(() => vi.advanceTimersByTime(4000));
    expect(current()).toBe(2);
    expect(screen.getByRole('list', { name: 'Discovered topics' }).children.length).toBeGreaterThan(0);
    act(() => vi.advanceTimersByTime(6000));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Your atlas is ready.')).toBeTruthy();
    expect(items().every(li => li.textContent.includes('DONE'))).toBe(true);
  });

  it('offers a skip after a beat, and skipping completes', () => {
    const onComplete = vi.fn();
    render(<LoadingView onComplete={onComplete} mobile={false} />);
    expect(screen.queryByRole('button', { name: /Skip to the atlas/ })).toBeNull();
    act(() => vi.advanceTimersByTime(1600));
    fireEvent.click(screen.getByRole('button', { name: /Skip to the atlas/ }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('clears its timers on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(<LoadingView onComplete={onComplete} mobile={false} />);
    unmount();
    act(() => vi.advanceTimersByTime(20000));
    expect(onComplete).not.toHaveBeenCalled();
  });
});
