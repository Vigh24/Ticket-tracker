import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react';
import { supabase, NOTE_PRIORITY } from '../../lib/supabase';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import CustomSelect from '../UI/CustomSelect';
import toast from 'react-hot-toast';

const EditNoteModal = ({ isOpen, onClose, note, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: NOTE_PRIORITY.MEDIUM,
    ticketId: ''
  });

  const priorityOptions = [
    {
      value: NOTE_PRIORITY.LOW,
      label: 'Low Priority',
      icon: Info,
      badge: 'Low'
    },
    {
      value: NOTE_PRIORITY.MEDIUM,
      label: 'Medium Priority',
      icon: AlertCircle,
      badge: 'Medium'
    },
    {
      value: NOTE_PRIORITY.HIGH,
      label: 'High Priority',
      icon: AlertTriangle,
      badge: 'High'
    },
    {
      value: NOTE_PRIORITY.CRITICAL,
      label: 'Critical Priority',
      icon: Zap,
      badge: 'Critical'
    }
  ];

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        priority: note.priority,
        ticketId: note.ticket_id || ''
      });
    }
  }, [note]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if at least title or content is provided
    if (!formData.title.trim() && !formData.content.trim()) {
      toast.error('Please provide either a title or content for the note');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: formData.title.trim() || 'Untitled Note',
          content: formData.content.trim() || 'No content',
          priority: formData.priority,
          ticket_id: formData.ticketId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id);

      if (error) throw error;

      toast.success('Note updated successfully');
      onSuccess();
    } catch (error) {
      toast.error('Error updating note: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!note) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Note"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter note title (optional)"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <CustomSelect
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value })}
              options={priorityOptions}
              placeholder="Select priority level"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Linked Ticket ID
            </label>
            <input
              type="text"
              name="ticketId"
              value={formData.ticketId}
              onChange={handleInputChange}
              placeholder="Optional ticket ID"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Enter note content (optional)..."
            rows={6}
            className="input-field resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Update Note
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditNoteModal;
