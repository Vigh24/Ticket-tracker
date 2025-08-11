import React from 'react';
import { Calendar } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const DateFilter = ({ dateRange, onDateRangeChange, className = '' }) => {
  const presetRanges = [
    {
      label: 'Today',
      value: 'today',
      getRange: () => ({
        start: startOfDay(new Date()),
        end: endOfDay(new Date())
      })
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 1)),
        end: endOfDay(subDays(new Date(), 1))
      })
    },
    {
      label: 'Last 7 days',
      value: 'week',
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 6)),
        end: endOfDay(new Date())
      })
    },
    {
      label: 'Last 30 days',
      value: 'month',
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 29)),
        end: endOfDay(new Date())
      })
    },
    {
      label: 'All time',
      value: 'all',
      getRange: () => ({
        start: null,
        end: null
      })
    }
  ];

  const handlePresetChange = (preset) => {
    const range = preset.getRange();
    onDateRangeChange(range);
  };

  const handleCustomDateChange = (field, value) => {
    const newRange = { ...dateRange };
    if (field === 'start') {
      newRange.start = value ? startOfDay(new Date(value)) : null;
    } else {
      newRange.end = value ? endOfDay(new Date(value)) : null;
    }
    onDateRangeChange(newRange);
  };

  const formatDateForInput = (date) => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preset Ranges */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          {presetRanges.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetChange(preset)}
              className="px-3 py-1.5 text-sm bg-white/30 hover:bg-white/50 border border-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Date Range
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={formatDateForInput(dateRange.start)}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="input-field pl-10 text-sm"
              placeholder="Start date"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={formatDateForInput(dateRange.end)}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="input-field pl-10 text-sm"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Current Filter Display */}
      {(dateRange.start || dateRange.end) && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <span className="font-medium">Active Filter: </span>
          {dateRange.start && dateRange.end ? (
            <>
              {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
            </>
          ) : dateRange.start ? (
            <>From {format(dateRange.start, 'MMM dd, yyyy')}</>
          ) : dateRange.end ? (
            <>Until {format(dateRange.end, 'MMM dd, yyyy')}</>
          ) : (
            'All time'
          )}
        </div>
      )}
    </div>
  );
};

export default DateFilter;
