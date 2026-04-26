import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '../../components/ConfirmDialog';

function setup({
  open = true,
  title = '確認標題',
  description = '這個操作無法復原',
  confirmLabel = '確認',
  onConfirm = vi.fn(),
  onCancel = vi.fn(),
} = {}) {
  render(
    <ConfirmDialog
      open={open}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
  return { onConfirm, onCancel };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(HTMLDialogElement.prototype.showModal).mockClear();
  vi.mocked(HTMLDialogElement.prototype.close).mockClear();
});

// §7.2 / §7.3 — title and description visible
describe('ConfirmDialog — content', () => {
  it('shows title and description when open', () => {
    setup({ title: '刪除主播', description: '此操作無法復原' });
    expect(screen.getByText('刪除主播')).toBeInTheDocument();
    expect(screen.getByText('此操作無法復原')).toBeInTheDocument();
  });

  // §7.4 — both buttons present
  it('renders both confirm and cancel buttons', () => {
    setup({ confirmLabel: '刪除' });
    expect(screen.getByRole('button', { name: '刪除' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    setup({ open: false });
    expect(screen.queryByText('確認標題')).not.toBeInTheDocument();
  });
});

// §7 — button callbacks
describe('ConfirmDialog — interactions', () => {
  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="T"
        description="D"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '確認' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="T"
        description="D"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  // §7.5 — ESC triggers cancel via dialog cancel event
  it('calls onCancel when dialog cancel event fires (ESC)', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="T"
        description="D"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    const dialog = document.querySelector('dialog')!;
    dialog.dispatchEvent(new Event('cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  // §7.1 — showModal called when open=true
  it('calls showModal when opened', () => {
    setup({ open: true });
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  // §7 — close called when open transitions to false
  it('calls close when dialog transitions from open to closed', () => {
    const { rerender } = render(
      <ConfirmDialog
        open
        title="T"
        description="D"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    rerender(
      <ConfirmDialog
        open={false}
        title="T"
        description="D"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });
});
