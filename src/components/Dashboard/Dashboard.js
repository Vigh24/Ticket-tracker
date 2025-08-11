import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../UI/Button';
import Header from './Header';
import StatsCards from './StatsCards';
import TicketTable from '../Tickets/TicketTable';
import AddTicketModal from '../Tickets/AddTicketModal';
import EditTicketModal from '../Tickets/EditTicketModal';
import NotesPanel from '../Notes/NotesPanel';
import ExportModal from '../Export/ExportModal';
import DateFilter from '../UI/DateFilter';
import CustomSelect from '../UI/CustomSelect';
import toast from 'react-hot-toast';
import { isWithinInterval } from 'date-fns';

const Dashboard = ({ session }) => {
  const [tickets, setTickets] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showEditTicket, setShowEditTicket] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const statusFilterOptions = [
    { value: 'all', label: 'All Status', icon: Filter },
    { value: 'Resolved', label: 'Resolved', icon: CheckCircle, badge: 'Complete' },
    { value: 'Awaiting Response', label: 'Awaiting Response', icon: Clock, badge: 'Pending' }
  ];

  useEffect(() => {
    fetchTickets();
    fetchNotes();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      toast.error('Error fetching tickets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      toast.error('Error fetching notes: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out: ' + error.message);
    }
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowEditTicket(true);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;
      
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
      toast.success('Ticket deleted successfully');
    } catch (error) {
      toast.error('Error deleting ticket: ' + error.message);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.notes && ticket.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    // Date filtering
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const ticketDate = new Date(ticket.created_at);
      if (dateRange.start && dateRange.end) {
        matchesDate = isWithinInterval(ticketDate, {
          start: dateRange.start,
          end: dateRange.end
        });
      } else if (dateRange.start) {
        matchesDate = ticketDate >= dateRange.start;
      } else if (dateRange.end) {
        matchesDate = ticketDate <= dateRange.end;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-screen">
      <Header 
        user={session.user}
        onSignOut={handleSignOut}
        onShowNotes={() => setShowNotes(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatsCards tickets={filteredTickets} allTickets={tickets} dateRange={dateRange} />

          <div className="mt-8 card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Tickets</h2>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowAddTicket(true)}
                  className="flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Ticket
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowNotes(true)}
                  className="flex items-center gap-2"
                >
                  <FileText size={20} />
                  Notes
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowExport(true)}
                  className="flex items-center gap-2"
                >
                  <Download size={20} />
                  Export
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>

                <div className="min-w-[200px]">
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusFilterOptions}
                    placeholder="Filter by status"
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Calendar size={20} />
                  Date Filter
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${showDateFilter ? 'rotate-180' : ''}`}
                  />
                </Button>
              </div>

              {/* Date Filter Panel */}
              {showDateFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg p-4"
                >
                  <DateFilter
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </motion.div>
              )}

              {/* Active Filters Display */}
              {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-gray-600">Active filters:</span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Status: {statusFilter}
                    </span>
                  )}
                  {(dateRange.start || dateRange.end) && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                      Date filtered
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateRange({ start: null, end: null });
                    }}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <TicketTable
              tickets={filteredTickets}
              loading={loading}
              onEdit={handleEditTicket}
              onDelete={handleDeleteTicket}
            />
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <AddTicketModal
        isOpen={showAddTicket}
        onClose={() => setShowAddTicket(false)}
        onSuccess={() => {
          fetchTickets();
          setShowAddTicket(false);
        }}
      />

      <EditTicketModal
        isOpen={showEditTicket}
        onClose={() => {
          setShowEditTicket(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onSuccess={() => {
          fetchTickets();
          setShowEditTicket(false);
          setSelectedTicket(null);
        }}
      />

      <NotesPanel
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        notes={notes}
        onNotesChange={fetchNotes}
      />

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        tickets={filteredTickets}
        dateRange={dateRange}
      />
    </div>
  );
};

export default Dashboard;
