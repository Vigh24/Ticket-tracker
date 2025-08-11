import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Table } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { exportToPDF, exportToCSV } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const ExportModal = ({ isOpen, onClose, tickets, dateRange = null }) => {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('pdf');

  const handleExport = async () => {
    if (tickets.length === 0) {
      toast.error('No tickets to export');
      return;
    }

    setLoading(true);
    
    try {
      if (exportType === 'pdf') {
        await exportToPDF(tickets, dateRange);
        toast.success('PDF exported successfully');
      } else {
        exportToCSV(tickets);
        toast.success('CSV exported successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Error exporting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportOptions = [
    {
      type: 'pdf',
      title: 'PDF Report',
      description: 'Generate a formatted PDF report with all ticket details',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      type: 'csv',
      title: 'CSV Spreadsheet',
      description: 'Export data as CSV for use in Excel or other spreadsheet applications',
      icon: Table,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Tickets"
      size="medium"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Export {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </h3>
          
          <div className="space-y-3">
            {exportOptions.map((option) => (
              <motion.div
                key={option.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${exportType === option.type 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white/50'
                  }
                `}
                onClick={() => setExportType(option.type)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${option.bgColor}`}>
                    <option.icon className={`w-6 h-6 ${option.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{option.title}</h4>
                      {exportType === option.type && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {tickets.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Export Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Total tickets: {tickets.length}</div>
              <div>
                Resolved: {tickets.filter(t => t.status === 'Resolved').length}
              </div>
              <div>
                Awaiting Response: {tickets.filter(t => t.status === 'Awaiting Response').length}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            loading={loading}
            disabled={tickets.length === 0}
            className="flex items-center gap-2"
          >
            <Download size={20} />
            Export {exportType.toUpperCase()}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;
