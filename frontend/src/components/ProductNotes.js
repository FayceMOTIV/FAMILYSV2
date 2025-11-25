import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const ProductNotes = ({ notes, onNotesChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes || '');

  const quickNotes = [
    'Sans oignons',
    'Bien cuit',
    'Peu de sauce',
    'Beaucoup de sauce',
    'Sans tomates',
    'Pain brioché'
  ];

  const handleSave = () => {
    onNotesChange(localNotes);
    setIsOpen(false);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const addQuickNote = (note) => {
    const newNotes = localNotes ? `${localNotes}, ${note}` : note;
    setLocalNotes(newNotes);
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0f0f0f] rounded-3xl p-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-[#C62828] dark:text-[#FFD54F]" />
          <div className="text-left">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Instructions spéciales
            </h3>
            {notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                {notes}
              </p>
            )}
          </div>
        </div>
        <span className="text-sm text-[#C62828] dark:text-[#FFD54F] font-bold">
          {isOpen ? 'Fermer' : notes ? 'Modifier' : 'Ajouter'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
          {/* Quick notes */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
              Suggestions rapides :
            </p>
            <div className="flex flex-wrap gap-2">
              {quickNotes.map((note) => (
                <button
                  key={note}
                  onClick={() => addQuickNote(note)}
                  className="px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 active:scale-95 transition-transform"
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          {/* Custom notes */}
          <div>
            <Textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="Ex: Sans cornichons, bien cuit..."
              className="w-full p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 min-h-[100px] text-base"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#C62828] hover:bg-[#8B0000] text-white py-3 rounded-full font-bold"
            >
              Enregistrer
            </Button>
            {localNotes && (
              <Button
                onClick={() => {
                  setLocalNotes('');
                  onNotesChange('');
                  setIsOpen(false);
                }}
                variant="outline"
                className="px-4 py-3 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductNotes;
