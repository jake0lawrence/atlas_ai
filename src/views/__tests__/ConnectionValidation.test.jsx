import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ConnectionValidation, {
  initialState, connectionsReducer, activeItem, nextPending, summarize, addProblem, layout,
} from '../ConnectionValidation';
import { TOPICS, CONNECTIONS } from '../../data/constants';

const name = (id) => TOPICS.find(t => t.id === id).name;

describe('the connections, as data', () => {
  it('every fixture connection joins two topics that exist', () => {
    for (const c of CONNECTIONS) {
      expect(TOPICS.some(t => t.id === c.from)).toBe(true);
      expect(TOPICS.some(t => t.id === c.to)).toBe(true);
    }
  });

  it('lays topics out the same way every time, inside the drawing', () => {
    const ids = TOPICS.map(t => t.id);
    const a = layout(ids);
    expect(layout(ids)).toEqual(a);
    for (const { x, y } of Object.values(a)) {
      expect(x).toBeGreaterThanOrEqual(15);
      expect(x).toBeLessThanOrEqual(385);
      expect(y).toBeGreaterThanOrEqual(15);
      expect(y).toBeLessThanOrEqual(245);
    }
  });

  it('decides the active connection and moves on', () => {
    const s0 = initialState();
    const first = activeItem(s0);
    const s1 = connectionsReducer(s0, { type: 'decide', status: 'confirmed' });
    expect(s1.items.find(i => i.id === first.id).status).toBe('confirmed');
    expect(activeItem(s1).id).toBe(nextPending(s0.items, first.id).id);
    expect(summarize(s1.items).decided).toBe(1);
  });

  it('relabeling records the new label; an unchanged label counts as a confirm', () => {
    const s0 = initialState();
    const first = activeItem(s0);
    const s1 = connectionsReducer(s0, { type: 'relabel', label: '  Same domain  ' });
    expect(s1.items.find(i => i.id === first.id)).toMatchObject({ status: 'edited', label: 'Same domain', originalLabel: first.label });
    const s2 = connectionsReducer(s0, { type: 'relabel', label: first.label });
    expect(s2.items.find(i => i.id === first.id).status).toBe('confirmed');
    expect(connectionsReducer(s0, { type: 'relabel', label: '   ' })).toBe(s0);
  });

  it('undo restores the original label and puts the connection back in front', () => {
    let s = initialState();
    const first = activeItem(s);
    s = connectionsReducer(s, { type: 'relabel', label: 'Other' });
    s = connectionsReducer(s, { type: 'undo', id: first.id });
    expect(activeItem(s)).toMatchObject({ id: first.id, label: first.label, status: 'pending' });
  });

  it('checks a new connection before adding it', () => {
    const { items } = initialState();
    expect(addProblem(items, { from: '', to: 'tyler', label: 'x' })).toMatch(/both/);
    expect(addProblem(items, { from: 'tyler', to: 'tyler', label: 'x' })).toMatch(/itself/);
    expect(addProblem(items, { from: 'finance', to: 'gamedev', label: ' ' })).toMatch(/what connects/i);
    expect(addProblem(items, { from: 'tyler', to: 'courtcollect', label: 'x' })).toMatch(/already/);
    expect(addProblem(items, { from: 'finance', to: 'gamedev', label: 'Budgeting a game' })).toBeNull();
  });

  it('adds a confirmed connection, and removing it takes it out entirely', () => {
    const s0 = initialState();
    const s1 = connectionsReducer(s0, { type: 'add', from: 'finance', to: 'gamedev', label: 'Budgeting a game' });
    expect(s1.items).toHaveLength(CONNECTIONS.length + 1);
    const added = s1.items.at(-1);
    expect(added).toMatchObject({ status: 'confirmed', added: true });
    expect(connectionsReducer(s1, { type: 'add', from: 'gamedev', to: 'finance', label: 'again' })).toBe(s1);
    expect(connectionsReducer(s1, { type: 'undo', id: added.id }).items).toHaveLength(CONNECTIONS.length);
  });

  it('confirms whatever is still waiting in one step', () => {
    const s = connectionsReducer(initialState(), { type: 'confirmRest' });
    expect(summarize(s.items)).toMatchObject({ pending: 0, confirmed: CONNECTIONS.length });
    expect(activeItem(s)).toBeNull();
  });
});

describe('<ConnectionValidation>', () => {
  const setup = (props = {}) => render(<ConnectionValidation onComplete={vi.fn()} onNavigate={vi.fn()} mobile={false} w={1280} {...props} />);
  const first = CONNECTIONS[0];

  it('is step 3 of the run, and draws the graph with a summary', () => {
    setup();
    const rail = screen.getByRole('navigation', { name: 'Curation steps' });
    expect(within(rail).getByRole('button', { name: /Step 3: Connections/ }).getAttribute('aria-current')).toBe('step');
    expect(screen.getByRole('img', { name: new RegExp(`${CONNECTIONS.length} connections between ${TOPICS.length} topics`) })).toBeTruthy();
  });

  it('keyboard shortcuts act on the connection on screen, not the first one', () => {
    setup();
    fireEvent.keyDown(window, { key: 's' });
    const second = CONNECTIONS[1];
    expect(screen.getByRole('article').getAttribute('aria-label')).toBe(`Reviewing: ${name(second.from)} and ${name(second.to)}`);
    fireEvent.keyDown(window, { key: 'x' });
    const decisions = screen.getByRole('list', { name: 'Your decisions' });
    expect(within(decisions).getByText(`“${second.label}”`)).toBeTruthy();
    expect(within(decisions).getByText('Rejected')).toBeTruthy();
  });

  it('relabels through a labeled form', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Relabel/ }));
    fireEvent.change(screen.getByLabelText('Label for this connection'), { target: { value: 'Same domain' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save label' }));
    expect(within(screen.getByRole('list', { name: 'Your decisions' })).getByText(`“Same domain” (was “${first.label}”)`)).toBeTruthy();
  });

  it('refuses a duplicate connection with a reason', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Add a connection Atlas missed/ }));
    const form = screen.getByRole('form', { name: 'Add a connection' });
    fireEvent.change(within(form).getByLabelText('From topic'), { target: { value: first.to } });
    fireEvent.change(within(form).getByLabelText('To topic'), { target: { value: first.from } });
    fireEvent.change(within(form).getByLabelText('What connects them'), { target: { value: 'x' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Add connection' }));
    expect(screen.getByRole('alert').textContent).toMatch(/already connected/);
  });

  it('confirm-the-rest clears the list and offers the next step', () => {
    const onComplete = vi.fn();
    setup({ onComplete });
    fireEvent.click(screen.getByRole('button', { name: `Confirm the ${CONNECTIONS.length} waiting` }));
    fireEvent.click(screen.getByRole('button', { name: /Next: review insights/ }));
    expect(onComplete).toHaveBeenCalled();
  });
});
