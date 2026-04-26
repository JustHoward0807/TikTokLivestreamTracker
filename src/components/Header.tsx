import { useState } from 'react';

type Props = {
  existingNames: string[];
  onAdd: (name: string) => void;
};

export default function Header({ existingNames, onAdd }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('名字不可為空白');
      return;
    }
    if (trimmed.length > 30) {
      setError('名字最長 30 字元');
      return;
    }
    if (existingNames.includes(trimmed)) {
      setError('此名字已存在');
      return;
    }
    onAdd(trimmed);
    setInput('');
    setError('');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          🎵 TikTok 直播計分板
        </h1>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              placeholder="輸入主播名字..."
              className="flex-1 min-w-0 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:border-pink-500 transition-colors"
              onChange={(e) => {
                setInput(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-500 transition-colors cursor-pointer whitespace-nowrap"
              onClick={handleAdd}
            >
              新增主播
            </button>
          </div>
          {error && <p className="text-rose-400 text-xs">{error}</p>}
        </div>
      </div>
    </header>
  );
}
