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
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: index * 0.1,
            type: "spring",
            bounce: 0.3
          }}
          whileHover={{
            y: -8,
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className="card hover:shadow-2xl dark:hover:shadow-gray-900/30 transition-all duration-300 relative overflow-hidden group"
        >
          {/* Card shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <motion.p
                className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 uppercase tracking-wide"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                {stat.title}
              </motion.p>

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  type: 'spring',
                  bounce: 0.4
                }}
                className="relative"
              >
                <motion.p
                  className="text-4xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300"
                  animate={{
                    scale: stat.value !== 0 ? [1, 1.05, 1] : 1
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: stat.value !== 0 ? 1 : 0
                  }}
                >
                  {stat.value}
                </motion.p>

                {/* Animated underline for active stats */}
                {stat.value !== 0 && (
                  <motion.div
                    className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  />
                )}
              </motion.div>

              {stat.subtitle && (
                <motion.p
                  className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300 font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {stat.subtitle}
                </motion.p>
              )}
            </div>

            <motion.div
              className={`p-4 rounded-2xl ${stat.bgColor} transition-all duration-300 shadow-lg group-hover:shadow-xl`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.5 + index * 0.1,
                type: "spring",
                bounce: 0.5
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 }
              }}
            >
              <stat.icon className={`w-8 h-8 ${stat.color} transition-colors duration-300`} />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
