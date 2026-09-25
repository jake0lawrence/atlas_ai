import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ALIASES, aliasText, leaks } from '../../privacy';
import { shield } from '../PrivacyShield';
import { searchAll } from '../CommandPalette';
import ExportPreview from '../../views/ExportPreview';
import { ENTITIES, TOPICS } from '../../data/constants';
import constantsSource from '../../data/constants.js?raw';
import { PATH_TO_VIEW, DEEP_LINKS } from '../../routes';
import useStore, { PRIVACY_KEY } from '../../store';
import App from '../../App';

const ATTRS = ['aria-label', 'title', 'alt', 'placeholder', 'aria-valuetext', 'aria-description'];
// Everything a viewer (or a screen reader) gets from the page: text and labels.
const onScreen = () => [
  document.body.textContent,
  ...[...document.body.querySelectorAll('*')].flatMap(el => ATTRS.map(a => el.getAttribute(a) || '')),
].join('\n');
const flush = () => act(async () => {});

const initialStore = useStore.getState();
beforeEach(() => { useStore.setState(initialStore, true); localStorage.clear(); });

describe('the stand-ins', () => {
  it('are typed and stable: people get numbers, the rest letters, per type', () => {
    const alias = (name) => ALIASES.find(e => e.name === name).alias;
    expect(alias('Tyler Technologies')).toBe('Employer A');
    expect(alias('TransUnion')).toBe('Company A');
    expect(alias('Veritone')).toBe('Company B');
    expect(alias('Health and Medicine Policy Research Group')).toBe('Client A');
    expect(alias('Josephine TX')).toBe('City A');
    expect(alias('Gina')).toBe('Person 1');
    expect(alias('CourtCollect')).toBe('Product A');
    expect(new Set(ALIASES.map(e => e.alias)).size).toBe(ALIASES.length);
  });

  it('every name on the list is one the fixtures actually use', () => {
    for (const e of ENTITIES) expect(constantsSource.toLowerCase(), e.name).toContain(e.name.toLowerCase());
  });

  it('replace every spelling, longest first, and leave the rest alone', () => {
    expect(aliasText('Six years at Tyler Technologies; Tyler taught me GovTech.')).toBe('Six years at Employer A; Employer A taught me GovTech.');
    expect(aliasText('interview transunion')).toBe('interview Company A');
    expect(aliasText("Supporting Gina's CRSS program")).toBe("Supporting Person 1's Credential A program");
    expect(aliasText('HMPRG Campaigns: $800 budget, Illinois youth, IL unemployment')).toBe('Client A Campaigns: $800 budget, State A youth, State A unemployment');
    // Short forms match whole words in their own case only.
    expect(aliasText('until it fails')).toBe('until it fails');
    for (const t of TOPICS) expect(aliasText(aliasText(t.name))).toBe(aliasText(t.name));
  });
});

describe('the shield', () => {
  it('hides names in text and labels, follows later changes, and puts them back', async () => {
    document.body.innerHTML = '<p>Tyler Technologies</p><button aria-label="Open Keymaster">x</button>';
    const restore = shield(document.body);
    expect(document.body.innerHTML).toBe('<p>Employer A</p><button aria-label="Open Product B">x</button>');
    document.querySelector('p').append(document.createTextNode(' and Veritone'));
    await flush();
    expect(document.querySelector('p').textContent).toBe('Employer A and Company B');
    restore();
    expect(document.querySelector('p').textContent).toBe('Tyler Technologies and Veritone');
    expect(document.querySelector('button').getAttribute('aria-label')).toBe('Open Keymaster');
    document.body.innerHTML = '';
  });
});

describe('privacy mode across the app', () => {
  const routes = [...Object.keys(PATH_TO_VIEW), ...DEEP_LINKS.map(d => d.path)];

  it.each(routes)('%s shows no real name', async (path) => {
    useStore.setState({ privacy: true });
    const { unmount } = render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
    await flush();
    expect(leaks(onScreen())).toEqual([]);
    unmount();
  });

  it('nor do the overlays: the palette, a briefing, the sidebar', async () => {
    useStore.setState({ privacy: true });
    render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>);
    act(() => { useStore.setState({ cmdPaletteOpen: true, companionSidebarOpen: true, briefingTopic: TOPICS.find(t => t.id === 'courtcollect') }); });
    await flush();
    expect(screen.getByRole('dialog', { name: /Product A/ })).toBeTruthy();
    expect(leaks(onScreen())).toEqual([]);
  });

  it('turns on and off with Alt+Shift+P, remembers the choice, and restores the names', async () => {
    render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>);
    await flush();
    expect(leaks(onScreen()).length).toBeGreaterThan(0);
    fireEvent.keyDown(window, { key: 'Π', code: 'KeyP', altKey: true, shiftKey: true });
    await flush();
    expect(useStore.getState().privacy).toBe(true);
    expect(localStorage.getItem(PRIVACY_KEY)).toBe('on');
    expect(leaks(onScreen())).toEqual([]);
    fireEvent.keyDown(window, { key: 'Π', code: 'KeyP', altKey: true, shiftKey: true });
    await flush();
    expect(localStorage.getItem(PRIVACY_KEY)).toBe('off');
    expect(document.body.textContent).toContain('CourtCollect');
  });

  it('has a quiet, labeled switch in the header', async () => {
    render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Privacy mode (Alt+Shift+P)' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(toggle);
    await flush();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('what leaves the page', () => {
  it('search matches what is shown, so a real name finds nothing', () => {
    expect(searchAll('transunion', aliasText).conversations).toEqual([]);
    expect(searchAll('company round', aliasText).conversations.map(r => r.title)).toEqual(['TransUnion 3rd round preparation']);
    expect(searchAll('transunion').conversations.length).toBe(1);
  });

  it('exports and copies carry the stand-ins', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ExportPreview privacy />);
    expect(screen.getByText(/Privacy mode is on/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /CSV/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy' })); });
    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain('Product A');
    expect(leaks(copied)).toEqual([]);
  });
});
