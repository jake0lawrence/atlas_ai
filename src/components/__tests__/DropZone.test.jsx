import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DropZone from '../DropZone';
import { C } from '../../styles/tokens';

const zone = (onFile) => render(<DropZone platform="ChatGPT" icon="💬" color={C.green} subtitle="s" accepted={null} onFile={onFile} />);
const file = (name, bytes = 'x') => new File([bytes], name);

describe('DropZone', () => {
  it('passes an accepted export on by name', () => {
    const onFile = vi.fn();
    const { container } = zone(onFile);
    fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [file('conversations.json')] } });
    expect(onFile).toHaveBeenCalledWith('conversations.json');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('refuses a dropped file of another type, which the input accept list cannot stop', () => {
    const onFile = vi.fn();
    const { container } = zone(onFile);
    fireEvent.drop(container.firstChild, { dataTransfer: { files: [file('evil.html')] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toMatch(/Only \.json or \.zip/);
  });

  it('refuses an empty export', () => {
    const onFile = vi.fn();
    const { container } = zone(onFile);
    fireEvent.drop(container.firstChild, { dataTransfer: { files: [file('conversations.json', '')] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toMatch(/empty/);
  });
});
