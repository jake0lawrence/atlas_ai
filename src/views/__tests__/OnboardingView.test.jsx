import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingView from '../OnboardingView';
import { DEMO_PERSONAS } from '../../data/constants';

describe('OnboardingView', () => {
  it('has one action, live by default on the first demo persona', () => {
    const onStart = vi.fn();
    render(<OnboardingView onStart={onStart} mobile={false} />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map(r => r.getAttribute('aria-checked'))).toEqual(['true', 'false']);
    const cta = screen.getByRole('button', { name: /Build the Power User atlas/ });
    expect(cta.disabled).toBe(false);
    fireEvent.click(cta);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('switches the CTA to the chosen persona', () => {
    render(<OnboardingView onStart={() => {}} mobile={false} />);
    fireEvent.click(screen.getByRole('radio', { name: /New User/ }));
    expect(screen.getByRole('button', { name: /Build the New User atlas/ })).toBeTruthy();
  });

  it('does not render a disabled persona as a choice', () => {
    render(<OnboardingView onStart={() => {}} mobile={false} />);
    const disabled = DEMO_PERSONAS.filter(p => !p.enabled);
    expect(disabled.length).toBeGreaterThan(0);
    for (const p of disabled) expect(screen.queryByRole('radio', { name: new RegExp(p.label) })).toBeNull();
    expect(screen.getByText(/atlases .* are coming/)).toBeTruthy();
  });

  it('keeps the exports behind a disclosure and builds from them once a file lands', () => {
    const onStart = vi.fn();
    render(<OnboardingView onStart={onStart} mobile={false} />);
    expect(screen.queryByText('ChatGPT')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /I have my own exports/ }));
    expect(screen.getByText('ChatGPT')).toBeTruthy();
    const input = document.querySelectorAll('input[type="file"]')[0];
    fireEvent.change(input, { target: { files: [new File(['{}'], 'conversations.json', { type: 'application/json' })] } });
    expect(screen.getByRole('button', { name: /Build from ChatGPT/ })).toBeTruthy();
    expect(screen.getAllByRole('radio').map(r => r.getAttribute('aria-checked'))).toEqual(['false', 'false']);
    fireEvent.click(screen.getByRole('button', { name: /Build from ChatGPT/ }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
