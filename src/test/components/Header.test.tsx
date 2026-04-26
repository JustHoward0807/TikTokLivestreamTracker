import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../../components/Header';

function setup(existingNames: string[] = []) {
  const onAdd = vi.fn();
  render(<Header existingNames={existingNames} onAdd={onAdd} />);
  return {
    onAdd,
    input: screen.getByPlaceholderText('輸入主播名字...'),
    addButton: screen.getByRole('button', { name: '新增主播' }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// §1.1.3 — empty name rejected
describe('Header — add streamer validation', () => {
  it('does not call onAdd when input is empty', async () => {
    const { onAdd, addButton } = setup();
    await userEvent.click(addButton);
    expect(onAdd).not.toHaveBeenCalled();
  });

  // §1.1.4 — whitespace only rejected
  it('does not call onAdd for whitespace-only input', async () => {
    const { onAdd, input, addButton } = setup();
    await userEvent.type(input, '   ');
    await userEvent.click(addButton);
    expect(onAdd).not.toHaveBeenCalled();
  });

  // §1.1.5 — name is trimmed before add
  it('trims surrounding whitespace before adding', async () => {
    const { onAdd, input, addButton } = setup();
    await userEvent.type(input, '  Anna  ');
    await userEvent.click(addButton);
    expect(onAdd).toHaveBeenCalledWith('Anna');
  });

  // §1.1.6 — duplicate name rejected
  it('shows error and does not add for duplicate name', async () => {
    const { onAdd, input, addButton } = setup(['Anna']);
    await userEvent.type(input, 'Anna');
    await userEvent.click(addButton);
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText('此名字已存在')).toBeInTheDocument();
  });

  // §1.1.7 — different case treated as different name
  it('allows adding a name that differs only in case', async () => {
    const { onAdd, input, addButton } = setup(['Anna']);
    await userEvent.type(input, 'anna');
    await userEvent.click(addButton);
    expect(onAdd).toHaveBeenCalledWith('anna');
  });

  // §1.1.8 — max length 30
  it('shows error and does not add for name exceeding 30 chars', async () => {
    const { onAdd, input, addButton } = setup();
    await userEvent.type(input, 'A'.repeat(31));
    await userEvent.click(addButton);
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText('名字最長 30 字元')).toBeInTheDocument();
  });

  // §1.1.9 — Chinese name
  it('accepts Chinese names', async () => {
    const { onAdd, input, addButton } = setup();
    await userEvent.type(input, '小美');
    await userEvent.click(addButton);
    expect(onAdd).toHaveBeenCalledWith('小美');
  });

  // §1.1.13 — input cleared after add
  it('clears the input field after a successful add', async () => {
    const { input, addButton } = setup();
    await userEvent.type(input, 'Anna');
    await userEvent.click(addButton);
    expect(input).toHaveValue('');
  });

  // §1.1 — Enter key works
  it('submits on Enter key press', async () => {
    const { onAdd, input } = setup();
    await userEvent.type(input, 'Anna{Enter}');
    expect(onAdd).toHaveBeenCalledWith('Anna');
  });

  // Happy path
  it('calls onAdd with the correct name', async () => {
    const { onAdd, input, addButton } = setup();
    await userEvent.type(input, 'Anna');
    await userEvent.click(addButton);
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith('Anna');
  });
});
