import React, { useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { supabase, TICKET_STATUS } from '../../lib/supabase';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import CustomSelect from '../UI/CustomSelect';
import toast from 'react-hot-toast';

const AddTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticketId: '',
    status: TICKET_STATUS.AWAITING_RESPONSE,
    notes: ''
  });

  const statusOptions = [
    {
      value: TICKET_STATUS.AWAITING_RESPONSE,
      label: 'Awaiting Response',
      icon: Clock,
      badge: 'Pending'
    },
    {
      value: TICKET_STATUS.RESOLVED,
      label: 'Resolved',
      icon: CheckCircle,
      badge: 'Complete'
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if ticket already exists
      const { data: existingTicket } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_id', formData.ticketId)
        .single();

      if (existingTicket) {
        // If ticket exists with same status, just update it
        if (existingTicket.status === formData.status) {
          const { error } = await supabase
            .from('tickets')
            .update({
              notes: formData.notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingTicket.id);

          if (error) throw error;
          toast.success('Ticket updated successfully');
        } else {
          // If status is different, update the status
          const { error } = await supabase
            .from('tickets')
            .update({
              status: formData.status,
              notes: formData.notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingTicket.id);

          if (error) throw error;
          toast.success('Ticket status updated successfully');
        }
      } else {
        // Create new ticket
        const { error } = await supabase
          .from('tickets')
          .insert([
            {
              ticket_id: formData.ticketId,
              status: formData.status,
              notes: formData.notes,
              user_id: (await supabase.auth.getUser()).data.user.id
            }
          ]);

        if (error) throw error;
        toast.success('Ticket created successfully');
      }

      setFormData({
        ticketId: '',
        status: TICKET_STATUS.AWAITING_RESPONSE,
        notes: ''
      });
      onSuccess();
    } catch (error) {
      toast.error('Error saving ticket: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      ticketId: '',
      status: TICKET_STATUS.AWAITING_RESPONSE,
      notes: ''
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Ticket"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ticket ID *
          </label>
          <input
            type="text"
            name="ticketId"
            value={formData.ticketId}
            onChange={handleInputChange}
            placeholder="Enter ticket ID (e.g., contact number)"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <CustomSelect
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={statusOptions}
            placeholder="Select ticket status"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any additional notes..."
            rows={4}
            className="input-field resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Add Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTicketModal;
