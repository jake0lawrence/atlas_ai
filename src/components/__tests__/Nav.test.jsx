// The shell header: three stations from the registry, the active station's
// tabs underneath, and the utilities. Behavior only; the look is the
// screenshot baseline's job.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Nav from '../Nav';
import { STATIONS, stationFor, PATH_TO_VIEW } from '../../routes';

const props = { onNavigate: vi.fn(), onSync: vi.fn(), onCmdK: vi.fn(), onTour: vi.fn(), lastSyncTime: '2:34 PM', newCount: 47, isSyncing: false, mobile: false, tablet: false };

describe('the station registry', () => {
  it('has exactly three stations', () => {
    expect(STATIONS.map(s => s.id)).toEqual(['curate', 'atlas', 'companion']);
  });

  it('places every routed view under one station or leaves it to the header (search, export) or the front door', () => {
    const headerViews = new Set(['search', 'export', 'onboarding', 'loading']);
    for (const view of Object.values(PATH_TO_VIEW)) {
      const owners = STATIONS.filter(s => s.views.includes(view));
      if (headerViews.has(view)) expect(owners, view).toHaveLength(0);
      else expect(owners.map(s => s.id), view).toHaveLength(1);
    }
    expect(stationFor('search')).toBeNull();
  });

  it('every tab is one of its station\'s views and lands on a route', () => {
    for (const s of STATIONS) {
      for (const tab of s.tabs) {
        expect(s.views, `${s.id}/${tab.view}`).toContain(tab.view);
        expect(Object.values(PATH_TO_VIEW), tab.view).toContain(tab.view);
      }
      expect(s.views, `${s.id} landing`).toContain(s.view);
    }
  });
});

describe('<Nav /> on desktop', () => {
  it('renders the three stations and marks the active one', () => {
    render(<Nav {...props} view="evolution" />);
    const nav = screen.getByRole('navigation', { name: 'Stations' });
    expect(nav.textContent).toContain('Curate');
    expect(nav.textContent).toContain('Atlas');
    expect(nav.textContent).toContain('Companion');
    expect(screen.getByRole('button', { name: /Atlas$/ }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: /Companion/ }).getAttribute('aria-current')).toBeNull();
  });

  it('shows the active station\'s tabs with the current view selected', () => {
    render(<Nav {...props} view="digest" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map(t => t.textContent)).toEqual(['Ask Atlas', 'Belief Diffs', 'Digest']);
    expect(screen.getByRole('tab', { name: 'Digest' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Ask Atlas' }).getAttribute('aria-selected')).toBe('false');
  });

  it('shows no tab row for the utility views', () => {
    render(<Nav {...props} view="export" />);
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('navigates to the station landing, a tab, and export; opens the palette and the tour', () => {
    const onNavigate = vi.fn(), onCmdK = vi.fn(), onTour = vi.fn();
    render(<Nav {...props} view="dashboard" onNavigate={onNavigate} onCmdK={onCmdK} onTour={onTour} />);
    fireEvent.click(screen.getByRole('button', { name: /Companion/ }));
    expect(onNavigate).toHaveBeenLastCalledWith('companion');
    fireEvent.click(screen.getByRole('tab', { name: 'Connections' }));
    expect(onNavigate).toHaveBeenLastCalledWith('connections');
    fireEvent.click(screen.getByRole('button', { name: /Curate/ }));
    expect(onNavigate).toHaveBeenLastCalledWith('curation');
    fireEvent.click(screen.getByTitle('Export & share'));
    expect(onNavigate).toHaveBeenLastCalledWith('export');
    fireEvent.click(screen.getByTitle('Search (⌘K)'));
    expect(onCmdK).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Guided tour' }));
    expect(onTour).toHaveBeenCalled();
  });

  it('shows the sync state', () => {
    render(<Nav {...props} view="dashboard" />);
    expect(screen.getByText('Synced 2:34 PM')).toBeTruthy();
    expect(screen.getByText('+47 new')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Sync$/ }));
    expect(props.onSync).toHaveBeenCalled();
  });

  it('collapses labels on tablet but keeps every station', () => {
    render(<Nav {...props} view="dashboard" tablet />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.queryByTitle('Search (⌘K)')).toBeNull();
    expect(screen.getByTitle('Export & share').textContent).toBe('↗');
  });
});

describe('<Nav /> on mobile', () => {
  it('opens a menu grouped by station and navigates from it', () => {
    const onNavigate = vi.fn();
    render(<Nav {...props} view="connections" mobile onNavigate={onNavigate} />);
    const toggle = screen.getByRole('button', { name: 'Navigation menu' });
    expect(toggle.textContent).toContain('Atlas');
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(toggle);
    const items = screen.getAllByRole('menuitem').map(i => i.textContent);
    expect(items).toContain('Belief Diffs');
    expect(items).toContain('↗ Export');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Belief Diffs' }));
    expect(onNavigate).toHaveBeenLastCalledWith('beliefDiffs');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('keeps the active station\'s tabs visible under the bar', () => {
    render(<Nav {...props} view="connections" mobile />);
    expect(screen.getByRole('tab', { name: 'Connections' }).getAttribute('aria-selected')).toBe('true');
  });
});
