import { describe, it, expect } from 'vitest';
import { checkExport, MAX_EXPORT_BYTES } from '../upload';

describe('checkExport', () => {
  it('takes a ChatGPT conversations.json and a Claude ZIP', () => {
    expect(checkExport({ name: 'conversations.json', size: 1024 })).toBeNull();
    expect(checkExport({ name: 'data-2025-02-07.ZIP', size: 1024 })).toBeNull();
    expect(checkExport({ name: 'x.json', size: MAX_EXPORT_BYTES })).toBeNull();
  });

  it('refuses any other type, including a dressed-up extension', () => {
    for (const name of ['notes.txt', 'export.json.exe', 'archive.tar.gz', 'zip', '', 'payload.html']) {
      expect(checkExport({ name, size: 10 }), name).toMatch(/Only \.json or \.zip/);
    }
  });

  it('refuses an empty file and one over the cap', () => {
    expect(checkExport({ name: 'a.json', size: 0 })).toMatch(/empty/);
    expect(checkExport({ name: 'a.json', size: MAX_EXPORT_BYTES + 1 })).toMatch(/over 512 MB/);
  });

  it('refuses a missing file without throwing', () => {
    expect(checkExport(undefined)).toMatch(/Only/);
    expect(checkExport({ name: 'a.json' })).toMatch(/empty/);
  });
});
