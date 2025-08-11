import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { supabase, TICKET_STATUS } from '../../lib/supabase';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import CustomSelect from '../UI/CustomSelect';
import toast from 'react-hot-toast';

const EditTicketModal = ({ isOpen, onClose, ticket, onSuccess }) => {
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

  useEffect(() => {
    if (ticket) {
      setFormData({
        ticketId: ticket.ticket_id,
        status: ticket.status,
        notes: ticket.notes || ''
      });
    }
  }, [ticket]);

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
      const { error } = await supabase
        .from('tickets')
        .update({
          ticket_id: formData.ticketId,
          status: formData.status,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;
      
      toast.success('Ticket updated successfully');
      onSuccess();
    } catch (error) {
      toast.error('Error updating ticket: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = () => {
    const newStatus = formData.status === TICKET_STATUS.RESOLVED 
      ? TICKET_STATUS.AWAITING_RESPONSE 
      : TICKET_STATUS.RESOLVED;
    
    setFormData({
      ...formData,
      status: newStatus
    });
  };

  if (!ticket) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Ticket"
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
            placeholder="Enter ticket ID"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <CustomSelect
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                options={statusOptions}
                placeholder="Select ticket status"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleToggleStatus}
              className="whitespace-nowrap"
            >
              Toggle Status
            </Button>
          </div>
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
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Update Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTicketModal;
