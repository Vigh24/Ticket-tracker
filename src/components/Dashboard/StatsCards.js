import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, TrendingUp, Ticket, Filter } from 'lucide-react';
import { format } from 'date-fns';

const StatsCards = ({ tickets, allTickets, dateRange }) => {
  // Use filtered tickets for display, all tickets for comparison
  const resolvedCount = tickets.filter(ticket =>
    ticket.status === 'Resolved'
  ).length;

  const awaitingCount = tickets.filter(ticket =>
    ticket.status === 'Awaiting Response'
  ).length;

  const successRate = tickets.length > 0
    ? Math.round((resolvedCount / tickets.length) * 100)
    : 0;

  // Show different labels based on filter
  const getTimeLabel = () => {
    if (dateRange.start && dateRange.end) {
      const isSameDay = format(dateRange.start, 'yyyy-MM-dd') === format(dateRange.end, 'yyyy-MM-dd');
      if (isSameDay) {
        return format(dateRange.start, 'MMM dd');
      }
      return 'Filtered Period';
    } else if (dateRange.start || dateRange.end) {
      return 'Filtered Period';
    }
    return 'All Time';
  };

  const timeLabel = getTimeLabel();

  const stats = [
    {
      title: `${timeLabel} Resolved`,
      value: resolvedCount,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      subtitle: tickets.length > 0 ? `${Math.round((resolvedCount / tickets.length) * 100)}% of filtered` : ''
    },
    {
      title: `${timeLabel} Awaiting`,
      value: awaitingCount,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      subtitle: tickets.length > 0 ? `${Math.round((awaitingCount / tickets.length) * 100)}% of filtered` : ''
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      subtitle: `${resolvedCount}/${tickets.length} resolved`
    },
    {
      title: dateRange.start || dateRange.end ? "Filtered Tickets" : "Total Tickets",
      value: tickets.length,
      icon: dateRange.start || dateRange.end ? Filter : Ticket,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      subtitle: dateRange.start || dateRange.end ? `of ${allTickets.length} total` : 'all time'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="card dark:bg-gray-800/50 dark:border-gray-700/50 hover:shadow-xl dark:hover:shadow-gray-900/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">
                {stat.title}
              </p>
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                className="text-3xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300"
              >
                {stat.value}
              </motion.p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  {stat.subtitle}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor} transition-colors duration-300`}>
              <stat.icon className={`w-6 h-6 ${stat.color} transition-colors duration-300`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
