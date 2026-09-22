import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Nav, { STATIONS, stationFor } from '../Nav';
import { PATH_TO_VIEW } from '../../routes';

const props = { mobile: false, tablet: false, lastSyncTime: '2:34 PM', newCount: 47, isSyncing: false, onSync: () => {}, onCmdK: () => {} };

describe('Nav', () => {
  it('shows the three stations and the active station\'s pages', () => {
    const onNavigate = vi.fn();
    render(<Nav {...props} view="beliefDiffs" onNavigate={onNavigate} onExport={() => {}} onTour={() => {}} />);
    expect(STATIONS.map(s => s.label)).toEqual(['Atlas', 'Curate', 'Companion']);
    expect(screen.getByRole('button', { name: /Companion/ }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Belief Diffs' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: 'Digest' }));
    expect(onNavigate).toHaveBeenCalledWith('digest');
    fireEvent.click(screen.getByRole('button', { name: /Curate/ }));
    expect(onNavigate).toHaveBeenCalledWith('curation');
  });

  it('keeps the tour targets the guided tour spotlights', () => {
    render(<Nav {...props} view="beliefDiffs" onNavigate={() => {}} />);
    for (const t of ['nav', 'cmd-k', 'sync', 'companion-tab', 'belief-diffs-tab', 'digest-tab']) {
      expect(document.querySelector(`[data-tour='${t}']`), t).not.toBeNull();
    }
  });

  it('maps every routed view to a station', () => {
    for (const view of Object.values(PATH_TO_VIEW)) {
      if (view === 'onboarding' || view === 'loading') continue;
      expect(stationFor(view).id, view).toMatch(/^(atlas|curate|companion)$/);
    }
  });

  it('folds stations, pages and actions into one menu on mobile', () => {
    const onNavigate = vi.fn();
    render(<Nav {...props} mobile view="dashboard" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Navigation menu' }));
    expect(screen.getAllByRole('menuitem').map(el => el.textContent)).toEqual([
      '◈Atlas', 'Overview', 'Connections', 'Evolution', '◇Curate', '◆Companion', 'Ask', 'Belief Diffs', 'Digest', '⌕Search', '↗Export',
    ]);
    fireEvent.click(screen.getByRole('menuitem', { name: /Export/ }));
    expect(onNavigate).toHaveBeenCalledWith('export');
  });
});
