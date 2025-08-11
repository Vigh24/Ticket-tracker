import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const TicketTable = ({ tickets, loading, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    
    if (status === 'Resolved') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-orange-100 text-orange-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
        <p className="text-gray-500">Get started by creating your first ticket.</p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/20 bg-white/10 backdrop-blur-sm">
            <th className="text-left py-4 px-4 font-semibold text-gray-700 first:rounded-tl-lg">Ticket ID</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Work Date</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Notes</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Created</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Updated</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700 last:rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {tickets.map((ticket, index) => (
              <motion.tr
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-white/10 hover:bg-white/10 transition-all duration-200 group"
              >
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
                    {ticket.ticket_id}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={getStatusBadge(ticket.status)}>
                    {ticket.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">
                      {ticket.work_date ? format(new Date(ticket.work_date), 'MMM dd, yyyy') : format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-600 max-w-xs truncate block">
                    {ticket.notes || 'No notes'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm">
                      {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm">
                      {format(new Date(ticket.updated_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => onEdit(ticket)}
                      className="p-2"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => onDelete(ticket.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
