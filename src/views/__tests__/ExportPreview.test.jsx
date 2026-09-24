import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import ExportPreview, { csvField, toCSV, toJSON, toMarkdown, vaultFiles, byteSize, formatBytes } from '../ExportPreview';
import { TOPICS, CONNECTIONS, VAULT_TREE } from '../../data/constants';

describe('the export, as data', () => {
  it('quotes CSV fields only when they need it', () => {
    expect(csvField('plain')).toBe('plain');
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField(42)).toBe('42');
  });

  it('the CSV has a header and every topic, each row as wide as the header', () => {
    const rows = toCSV().trimEnd().split('\n');
    expect(rows).toHaveLength(TOPICS.length + 1);
    const width = rows[0].split(',').length;
    for (const r of rows.slice(1)) expect(r.split(',').length).toBe(width);
  });

  it('the JSON parses back to every topic and connection', () => {
    const { atlas } = JSON.parse(toJSON());
    expect(atlas.topics).toHaveLength(TOPICS.length);
    expect(atlas.connections).toHaveLength(CONNECTIONS.length);
    expect(atlas.stats.conversations).toBe(TOPICS.reduce((a, t) => a + t.count, 0));
  });

  it('the Markdown has a section per topic', () => {
    expect(toMarkdown().match(/^## /gm)).toHaveLength(TOPICS.length);
  });

  it('lists every vault file with its path', () => {
    const files = vaultFiles();
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(f.path.startsWith(VAULT_TREE[0].name + '/')).toBe(true);
  });

  it('measures and formats sizes', () => {
    expect(byteSize('é')).toBe(2);
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
  });
});

describe('the export view', () => {
  afterEach(() => vi.restoreAllMocks());

  it('opens on the vault with a note showing, and switches format', () => {
    render(<ExportPreview />);
    expect(screen.getByRole('navigation', { name: 'Vault files' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /CSV/ }));
    const pre = screen.getByLabelText('atlas.csv contents');
    expect(pre.textContent).toMatch(/^topic_id,name,category/);
    expect(pre.textContent).toContain('courtcollect,CourtCollect');
  });

  it('downloads the real file', () => {
    const createObjectURL = vi.fn(() => 'blob:x');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<ExportPreview />);
    fireEvent.click(screen.getByRole('button', { name: /JSON/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Download atlas.json' }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toBe('Downloaded atlas.json.');
  });

  it('copies, and says so when the clipboard refuses', async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error('denied')).mockResolvedValueOnce();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ExportPreview />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy note' })); });
    expect(screen.getByRole('status').textContent).toMatch(/didn't work/);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy as text' })); });
    expect(screen.getByRole('status').textContent).toBe('Copied the card as text.');
  });

  it('folders expand and collapse', () => {
    render(<ExportPreview />);
    const folder = within(screen.getByRole('navigation', { name: 'Vault files' })).getByRole('button', { name: /Job Search/ });
    expect(folder.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(folder);
    expect(folder.getAttribute('aria-expanded')).toBe('true');
  });
});
