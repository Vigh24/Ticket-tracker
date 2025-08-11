import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase, NOTE_PRIORITY } from '../../lib/supabase';
import Button from '../UI/Button';
import AddNoteModal from './AddNoteModal';
import EditNoteModal from './EditNoteModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const NotesPanel = ({ isOpen, onClose, notes, onNotesChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.ticket_id && note.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowEditNote(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
      toast.success('Note deleted successfully');
      onNotesChange();
    } catch (error) {
      toast.error('Error deleting note: ' + error.message);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case NOTE_PRIORITY.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case NOTE_PRIORITY.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case NOTE_PRIORITY.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case NOTE_PRIORITY.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative ml-auto w-full max-w-2xl glass h-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-gray-800">Notes</h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowAddNote(true)}
                  className="flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Note
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-white/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                  <p className="text-gray-500">Create your first note to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg p-4 hover:bg-white/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{note.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(note.priority)}`}>
                              {note.priority}
                            </span>
                            {note.ticket_id && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Ticket: {note.ticket_id}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleEditNote(note)}
                            className="p-2"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {note.content}
                      </p>
                      
                      <div className="text-xs text-gray-500">
                        Created: {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Modals */}
          <AddNoteModal
            isOpen={showAddNote}
            onClose={() => setShowAddNote(false)}
            onSuccess={() => {
              onNotesChange();
              setShowAddNote(false);
            }}
          />

          <EditNoteModal
            isOpen={showEditNote}
            onClose={() => {
              setShowEditNote(false);
              setSelectedNote(null);
            }}
            note={selectedNote}
            onSuccess={() => {
              onNotesChange();
              setShowEditNote(false);
              setSelectedNote(null);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotesPanel;
