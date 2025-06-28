import React, { useState, useRef, useEffect } from "react";

const UndoRedoDemo: React.FC = () => {
  const [text, setText] = useState("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 入力変更時に履歴を更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newText]);
    setHistoryIndex(newHistory.length);
    setText(newText);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setText(history[historyIndex - 1]);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setText(history[historyIndex + 1]);
    }
  };

  // ショートカットキー対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      if (ctrlOrCmd && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          // Redo
          handleRedo();
        } else {
          // Undo
          handleUndo();
        }
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  return (
    <div className="p-4 border rounded max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-2">Undo/Redo デモ</h2>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        className="border px-2 py-1 w-full mb-2"
        placeholder="テキストを入力してください"
      />
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleUndo}
          disabled={historyIndex === 0}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          元に戻す（Undo）
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex === history.length - 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          やり直し（Redo）
        </button>
      </div>
      <p className="text-sm text-gray-600">ショートカット: Undo = Ctrl/⌘+Z, Redo = Ctrl/⌘+Shift+Z</p>
    </div>
  );
};

export default UndoRedoDemo; 