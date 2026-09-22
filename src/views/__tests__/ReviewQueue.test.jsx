import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ReviewQueue, {
  AUTO_APPROVE_AT, initialQueue, summarize, nextPending, activeItem, initialState, queueReducer,
} from '../ReviewQueue';
import { CURATION_STEPS, stepIndex } from '../../components/CurationChrome';
import { REVIEW_QUEUE_DATA } from '../../data/constants';

const AUTO = REVIEW_QUEUE_DATA.filter(d => d.confidence >= AUTO_APPROVE_AT).length;

describe('the queue, as data', () => {
  it('approves high-confidence items up front and leaves the rest pending', () => {
    const s = summarize(initialQueue());
    expect(s.auto).toBe(AUTO);
    expect(s.pending).toBe(REVIEW_QUEUE_DATA.length - AUTO);
    expect(s.decided).toBe(AUTO);
  });

  it('walks pending items in both directions and wraps', () => {
    const items = initialQueue();
    const pending = items.filter(i => i.status === 'pending');
    expect(nextPending(items, pending[0].id).id).toBe(pending[1].id);
    expect(nextPending(items, pending[0].id, -1).id).toBe(pending.at(-1).id);
    expect(nextPending(items, 'not-pending').id).toBe(pending[0].id);
    expect(nextPending(items.map(i => ({ ...i, status: 'approved' })), 1)).toBeNull();
  });

  it('decides the active item and moves on to the next one', () => {
    const s0 = initialState();
    const first = activeItem(s0);
    const s1 = queueReducer(s0, { type: 'decide', status: 'approved' });
    expect(s1.items.find(i => i.id === first.id).status).toBe('approved');
    expect(activeItem(s1).id).toBe(nextPending(s0.items, first.id).id);
  });

  it('a move records the new topic, and undo restores the original', () => {
    const s0 = initialState();
    const first = activeItem(s0);
    const moved = queueReducer(s0, { type: 'decide', status: 'edited', topicId: 'writing' });
    expect(moved.items.find(i => i.id === first.id)).toMatchObject({ status: 'edited', topicId: 'writing', originalTopicId: first.topicId });
    const back = queueReducer(moved, { type: 'undo', id: first.id });
    expect(back.items.find(i => i.id === first.id)).toMatchObject({ status: 'pending', topicId: first.topicId });
    expect(activeItem(back).id).toBe(first.id);
  });

  it('undoing an automatic approval puts it in front of you', () => {
    const s0 = initialState();
    const auto = s0.items.find(i => i.status === 'auto');
    const s1 = queueReducer(s0, { type: 'undo', id: auto.id });
    expect(activeItem(s1).id).toBe(auto.id);
  });

  it('is a no-op once nothing is pending', () => {
    let s = initialState();
    while (activeItem(s)) s = queueReducer(s, { type: 'decide', status: 'approved' });
    expect(summarize(s.items).pending).toBe(0);
    expect(queueReducer(s, { type: 'decide', status: 'rejected' })).toBe(s);
    expect(queueReducer(s, { type: 'step', dir: 1 })).toBe(s);
  });
});

describe('curation chrome', () => {
  it('knows the five steps in order', () => {
    expect(CURATION_STEPS.map(s => s.label)).toEqual(['Review', 'Topics', 'Connections', 'Insights', 'Summary']);
    expect(stepIndex('insightReview')).toBe(3);
  });
});

describe('<ReviewQueue>', () => {
  const setup = (props = {}) => render(<ReviewQueue onComplete={vi.fn()} onNavigate={vi.fn()} mobile={false} w={1280} {...props} />);

  it('marks the current step and navigates from the rail', () => {
    const onNavigate = vi.fn();
    setup({ onNavigate });
    const rail = screen.getByRole('navigation', { name: 'Curation steps' });
    expect(within(rail).getByRole('button', { name: /Step 1: Review/ }).getAttribute('aria-current')).toBe('step');
    fireEvent.click(within(rail).getByRole('button', { name: /Step 3: Connections/ }));
    expect(onNavigate).toHaveBeenCalledWith('connectionValidation');
    fireEvent.click(screen.getByRole('button', { name: 'Skip to the atlas' }));
    expect(onNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('shows the automatic approvals and a working progress bar', () => {
    setup();
    expect(within(screen.getByRole('list', { name: 'Approved automatically' })).getAllByRole('listitem')).toHaveLength(AUTO);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(String(Math.round((AUTO / REVIEW_QUEUE_DATA.length) * 100)));
  });

  it('approve moves the item into your decisions', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Approve/ }));
    expect(within(screen.getByRole('list', { name: 'Your decisions' })).getAllByRole('listitem')).toHaveLength(1);
  });

  it('move opens a topic picker and files the item under the chosen topic', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Move/ }));
    const picker = screen.getByRole('group', { name: 'Move to another topic' });
    fireEvent.click(within(picker).getByRole('button', { name: /Creative Writing/ }));
    const decisions = screen.getByRole('list', { name: 'Your decisions' });
    expect(within(decisions).getByText('Creative Writing')).toBeTruthy();
    expect(within(decisions).getByText(/^was /)).toBeTruthy();
  });

  it('keyboard shortcuts act on the item on screen', () => {
    setup();
    const before = screen.getByRole('article').getAttribute('aria-label');
    fireEvent.keyDown(window, { key: 'x' });
    expect(screen.getByRole('article').getAttribute('aria-label')).not.toBe(before);
    expect(within(screen.getByRole('list', { name: 'Your decisions' })).getByText(/Rejected/)).toBeTruthy();
  });

  it('clearing the queue offers the next step', () => {
    const onComplete = vi.fn();
    setup({ onComplete });
    for (let i = 0; i < REVIEW_QUEUE_DATA.length - AUTO; i++) fireEvent.keyDown(window, { key: 'a' });
    expect(screen.getByText('The queue is clear')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Next: curate topics/ }));
    expect(onComplete).toHaveBeenCalled();
  });
});
