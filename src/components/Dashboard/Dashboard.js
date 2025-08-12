import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Download,
  Search,
  Filter,
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
import { isWithinInterval, format, startOfDay, endOfDay } from 'date-fns';

const Dashboard = ({ session }) => {
  const [tickets, setTickets] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [workDate, setWorkDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('today'); // 'today', 'date-range', 'all-time'
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
  }, [viewMode, workDate, dateRange]);

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from('tickets')
        .select('*');

      // Apply date filtering based on view mode
      if (viewMode === 'today') {
        const todayStart = format(startOfDay(workDate), 'yyyy-MM-dd');
        const todayEnd = format(endOfDay(workDate), 'yyyy-MM-dd');
        query = query
          .gte('work_date', todayStart)
          .lte('work_date', todayEnd);
      } else if (viewMode === 'date-range' && dateRange.start && dateRange.end) {
        const startDate = format(startOfDay(dateRange.start), 'yyyy-MM-dd');
        const endDate = format(endOfDay(dateRange.end), 'yyyy-MM-dd');
        query = query
          .gte('work_date', startDate)
          .lte('work_date', endDate);
      }
      // For 'all-time' mode, no date filtering is applied

      const { data, error } = await query.order('created_at', { ascending: false });

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <Header
        user={session.user}
        onSignOut={handleSignOut}
        onShowNotes={() => setShowNotes(true)}
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatsCards
            tickets={filteredTickets}
            allTickets={tickets}
            dateRange={dateRange}
            viewMode={viewMode}
            workDate={workDate}
          />

          <motion.div
            className="mt-8 card transition-colors duration-300 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Card shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
              <motion.h2
                className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Tickets
              </motion.h2>
              
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

            {/* View Mode Controls */}
            <motion.div
              className="mb-6 p-6 card-compact transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={() => setViewMode('today')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                      viewMode === 'today'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-xl'
                        : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/70 shadow-lg'
                    }`}
                  >
                    <span className="relative z-10">📅 Today</span>
                    {viewMode === 'today' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>

                  <motion.button
                    onClick={() => setViewMode('date-range')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                      viewMode === 'date-range'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white shadow-xl'
                        : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/70 shadow-lg'
                    }`}
                  >
                    <span className="relative z-10">📊 Date Range</span>
                    {viewMode === 'date-range' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>

                  <motion.button
                    onClick={() => setViewMode('all-time')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                      viewMode === 'all-time'
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white shadow-xl'
                        : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/70 shadow-lg'
                    }`}
                  >
                    <span className="relative z-10">🕐 All Time</span>
                    {viewMode === 'all-time' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                </div>

                {viewMode === 'today' && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Work Date:</label>
                    <input
                      type="date"
                      value={format(workDate, 'yyyy-MM-dd')}
                      onChange={(e) => setWorkDate(new Date(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}

                {viewMode === 'date-range' && (
                  <div className="flex items-center gap-2">
                    <DateFilter
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {viewMode === 'today' && (
                  <span>Showing tickets for {format(workDate, 'MMMM dd, yyyy')} • Same ticket IDs can appear on different dates</span>
                )}
                {viewMode === 'date-range' && dateRange.start && dateRange.end && (
                  <span>Showing tickets from {format(dateRange.start, 'MMM dd')} to {format(dateRange.end, 'MMM dd, yyyy')}</span>
                )}
                {viewMode === 'all-time' && (
                  <span>Showing all tickets across all dates</span>
                )}
              </div>
            </motion.div>

            {/* Search and Filter */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 dark:bg-gray-800/50 dark:border-gray-700/50 dark:text-gray-200 dark:placeholder-gray-400 transition-colors duration-300"
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

              </div>

              {/* Active Filters Display */}
              {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Active filters:</span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
                      Status: {statusFilter}
                    </span>
                  )}
                  {(dateRange.start || dateRange.end) && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full">
                      Date filtered
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateRange({ start: null, end: null });
                    }}
                    className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-300"
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
          </motion.div>
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
        workDate={workDate}
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
