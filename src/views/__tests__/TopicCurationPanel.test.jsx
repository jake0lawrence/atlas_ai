import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TopicCurationPanel, {
  initialState, initialTopics, topicsReducer, openSuggestions, freeColor, mergedName,
} from '../TopicCurationPanel';
import { TOPICS, TOPIC_CONFIDENCE, MERGE_SUGGESTIONS, SPLIT_SUGGESTIONS, CURATED_PALETTE } from '../../data/constants';

const find = (state, id) => state.topics.find(t => t.id === id);

describe('the topic set, as data', () => {
  it('has a fixed confidence for every topic, so the page renders the same every run', () => {
    for (const t of TOPICS) expect(TOPIC_CONFIDENCE[t.id]).toBeTypeOf('number');
    expect(initialTopics().map(t => t.confidence)).toEqual(initialTopics().map(t => t.confidence));
  });

  it('every suggestion names topics that exist', () => {
    for (const m of MERGE_SUGGESTIONS) {
      expect(TOPICS.some(t => t.id === m.from)).toBe(true);
      expect(TOPICS.some(t => t.id === m.into)).toBe(true);
    }
    for (const id of Object.keys(SPLIT_SUGGESTIONS)) expect(TOPICS.some(t => t.id === id)).toBe(true);
    expect(openSuggestions(initialState())).toHaveLength(MERGE_SUGGESTIONS.length + Object.keys(SPLIT_SUGGESTIONS).length);
  });

  it('renames, ignoring blank and unchanged names', () => {
    const s0 = initialState();
    expect(topicsReducer(s0, { type: 'rename', id: 'webdev', name: '   ' })).toBe(s0);
    expect(topicsReducer(s0, { type: 'rename', id: 'webdev', name: 'Web Development' })).toBe(s0);
    const s1 = topicsReducer(s0, { type: 'rename', id: 'webdev', name: ' Web ' });
    expect(find(s1, 'webdev').name).toBe('Web');
    expect(s1.log).toEqual(['Renamed Web Development to Web']);
  });

  it('a suggested merge takes the suggested name and sums the counts', () => {
    const m = MERGE_SUGGESTIONS[0];
    const s0 = initialState();
    const s1 = topicsReducer(s0, { type: 'merge', from: m.from, into: m.into });
    expect(find(s1, m.from)).toBeUndefined();
    const into = find(s1, m.into);
    expect(into.name).toBe(m.suggestedName);
    expect(into.count).toBe(find(s0, m.from).count + find(s0, m.into).count);
    expect(into.mergedFrom).toEqual([find(s0, m.from).name]);
    expect(openSuggestions(s1).some(s => s.key === `merge:${m.from}`)).toBe(false);
  });

  it('an unsuggested merge keeps the target name', () => {
    const s0 = initialState();
    expect(mergedName(find(s0, 'writing'), find(s0, 'gamedev'))).toBe(find(s0, 'gamedev').name);
  });

  it('a split makes two topics with a color nobody else uses, and only once', () => {
    const s0 = initialState();
    const s1 = topicsReducer(s0, { type: 'split', id: 'webdev' });
    expect(s1.topics).toHaveLength(s0.topics.length + 1);
    const [a, b] = SPLIT_SUGGESTIONS.webdev.into;
    expect(find(s1, 'webdev').name).toBe(a);
    const second = find(s1, 'webdev_split');
    expect(second.name).toBe(b);
    expect(s0.topics.some(t => t.color === second.color)).toBe(false);
    expect(second.color).toBe(freeColor(s0.topics));
    expect(topicsReducer(s1, { type: 'split', id: 'webdev' })).toBe(s1);
  });

  it('undo steps back one change at a time', () => {
    let s = initialState();
    s = topicsReducer(s, { type: 'star', id: 'tyler' });
    s = topicsReducer(s, { type: 'recolor', id: 'tyler', color: CURATED_PALETTE[0] });
    expect(s.log).toHaveLength(2);
    s = topicsReducer(s, { type: 'undo' });
    expect(s.log).toEqual(['Starred Tyler Technologies']);
    expect(find(s, 'tyler').color).toBe(TOPICS.find(t => t.id === 'tyler').color);
    s = topicsReducer(s, { type: 'undo' });
    expect(find(s, 'tyler').starred).toBe(false);
    expect(topicsReducer(s, { type: 'undo' })).toBe(s);
  });

  it('dismissing a suggestion hides it without counting as a change', () => {
    const s1 = topicsReducer(initialState(), { type: 'dismiss', key: 'split:webdev' });
    expect(openSuggestions(s1).some(s => s.key === 'split:webdev')).toBe(false);
    expect(s1.log).toHaveLength(0);
  });
});

describe('<TopicCurationPanel>', () => {
  const setup = (props = {}) => render(<TopicCurationPanel onComplete={vi.fn()} onNavigate={vi.fn()} mobile={false} w={1280} {...props} />);

  it('is step 2 of the run', () => {
    setup();
    const rail = screen.getByRole('navigation', { name: 'Curation steps' });
    expect(within(rail).getByRole('button', { name: /Step 2: Topics/ }).getAttribute('aria-current')).toBe('step');
  });

  it('applies a suggested merge from the suggestions list, and undo brings the topic back', () => {
    setup();
    const m = MERGE_SUGGESTIONS[0];
    const fromName = TOPICS.find(t => t.id === m.from).name;
    const suggestions = screen.getByRole('region', { name: /Atlas suggests/ });
    fireEvent.click(within(suggestions).getAllByRole('button', { name: 'Merge' })[0]);
    expect(screen.queryByRole('article', { name: fromName })).toBeNull();
    expect(screen.getByRole('article', { name: m.suggestedName })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('article', { name: fromName })).toBeTruthy();
  });

  it('stars are toggle buttons', () => {
    setup();
    const star = screen.getByRole('button', { name: 'Star CourtCollect' });
    fireEvent.click(star);
    expect(star.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/1 starred/)).toBeTruthy();
  });

  it('renames through a labeled form', () => {
    setup();
    const card = screen.getByRole('article', { name: 'Keymaster' });
    fireEvent.click(within(card).getByRole('button', { name: 'Rename' }));
    fireEvent.change(within(card).getByLabelText('New name for Keymaster'), { target: { value: 'Keymaster Vault' } });
    fireEvent.click(within(card).getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('article', { name: 'Keymaster Vault' })).toBeTruthy();
    expect(screen.getByText(/Last: Renamed Keymaster to Keymaster Vault/)).toBeTruthy();
  });

  it('merges any topic into any other through the picker', () => {
    setup();
    const card = screen.getByRole('article', { name: 'Creative Writing' });
    fireEvent.click(within(card).getByRole('button', { name: 'Merge…' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'Merge Creative Writing into' })).getByRole('button', { name: /Dice or Die/ }));
    expect(screen.queryByRole('article', { name: 'Creative Writing' })).toBeNull();
    expect(within(screen.getByRole('article', { name: 'Dice or Die' })).getByText(/includes Creative Writing/)).toBeTruthy();
  });

  it('moves on to connections', () => {
    const onComplete = vi.fn();
    setup({ onComplete });
    fireEvent.click(screen.getByRole('button', { name: /Next: check connections/ }));
    expect(onComplete).toHaveBeenCalled();
  });
});
