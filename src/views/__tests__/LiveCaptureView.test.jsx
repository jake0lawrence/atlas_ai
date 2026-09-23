import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MCP_CAPTURE_LOG, MCP_TOOLS } from '../../data/constants';
import LiveCaptureView, { filterLog, kindOf, statusOf, summarizeCapture } from '../LiveCaptureView';

describe('capture log helpers', () => {
  it('every entry calls a tool the server exposes', () => {
    const names = new Set(MCP_TOOLS.map(t => t.name));
    expect(MCP_CAPTURE_LOG.filter(e => !names.has(e.tool)).map(e => e.id)).toEqual([]);
  });

  it('read-only calls never wait for review', () => {
    expect(MCP_CAPTURE_LOG.filter(e => kindOf(e) === 'read' && e.review)).toEqual([]);
  });

  it('applies unreviewed writes and holds the rest', () => {
    const s = summarizeCapture(MCP_CAPTURE_LOG, {});
    const reads = MCP_CAPTURE_LOG.filter(e => kindOf(e) === 'read').length;
    expect(s.applied + s.waiting + reads).toBe(MCP_CAPTURE_LOG.length);
    expect(s.waiting).toBe(MCP_CAPTURE_LOG.filter(e => e.review).length);
  });

  it('keeps and discards move entries out of waiting', () => {
    const held = MCP_CAPTURE_LOG.filter(e => e.review);
    const decisions = { [held[0].id]: 'kept', [held[1].id]: 'discarded' };
    expect(statusOf(held[0], decisions)).toBe('kept');
    const s = summarizeCapture(MCP_CAPTURE_LOG, decisions);
    expect(s.waiting).toBe(held.length - 2);
    expect(s.discarded).toBe(1);
  });

  it('marks reads as read, never applied', () => {
    const read = MCP_CAPTURE_LOG.find(e => kindOf(e) === 'read');
    expect(statusOf(read, {})).toBe('read');
  });

  it('filters by kind', () => {
    expect(filterLog(MCP_CAPTURE_LOG, 'all')).toHaveLength(MCP_CAPTURE_LOG.length);
    expect(filterLog(MCP_CAPTURE_LOG, 'decision').every(e => e.tool === 'atlas.log_decision')).toBe(true);
  });
});

describe('LiveCaptureView', () => {
  it('filters the log with pressed chips', () => {
    render(<LiveCaptureView mobile={false} />);
    const log = screen.getByRole('region', { name: "Today's capture log" });
    fireEvent.click(screen.getByRole('button', { name: /^Pivots/ }));
    expect(screen.getByRole('button', { name: /^Pivots/ }).getAttribute('aria-pressed')).toBe('true');
    expect(within(log).getAllByRole('article')).toHaveLength(filterLog(MCP_CAPTURE_LOG, 'pivot').length);
  });

  it('keeps a held entry, then undoes it', () => {
    render(<LiveCaptureView mobile={false} />);
    const waiting = () => screen.queryAllByRole('button', { name: 'Keep' }).length;
    const before = waiting();
    fireEvent.click(screen.getAllByRole('button', { name: 'Keep' })[0]);
    expect(waiting()).toBe(before - 1);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(waiting()).toBe(before);
  });
});
