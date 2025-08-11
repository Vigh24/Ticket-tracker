import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const getBadgeColor = (value) => {
    // Status colors
    if (value === 'Resolved') {
      return 'text-green-700 bg-green-50 border-green-200';
    }
    if (value === 'Awaiting Response') {
      return 'text-orange-700 bg-orange-50 border-orange-200';
    }

    // Priority colors
    if (value === 'Critical') {
      return 'text-red-700 bg-red-50 border-red-200';
    }
    if (value === 'High') {
      return 'text-orange-700 bg-orange-50 border-orange-200';
    }
    if (value === 'Medium') {
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
    if (value === 'Low') {
      return 'text-green-700 bg-green-50 border-green-200';
    }

    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-blue-500 focus:border-transparent
          backdrop-blur-sm transition-all duration-300 text-left flex items-center justify-between
          text-gray-700 dark:text-gray-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/60 dark:hover:bg-gray-700/50 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-primary-500 dark:ring-blue-500 bg-white/70 dark:bg-gray-700/50' : ''}
        `}
      >
        <span className="flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.icon && <selectedOption.icon size={16} />}
              <span className="font-medium">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(selectedOption.badge)}`}>
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-1 z-50"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-700/50 rounded-lg shadow-xl dark:shadow-gray-900/20 overflow-hidden transition-colors duration-300"
                 style={{
                   boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                 }}>
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    w-full px-3 py-2.5 text-left hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-150
                    flex items-center justify-between group
                    ${value === option.value
                      ? 'bg-primary-50 dark:bg-blue-900/30 text-primary-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'}
                    ${index !== options.length - 1 ? 'border-b border-white/20 dark:border-gray-700/30' : ''}
                  `}
                >
                  <span className="flex items-center gap-2">
                    {option.icon && (
                      <option.icon
                        size={16}
                        className={value === option.value
                          ? 'text-primary-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'}
                      />
                    )}
                    <span className="font-medium">{option.label}</span>
                    {option.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(option.badge)}`}>
                        {option.badge}
                      </span>
                    )}
                  </span>
                  {value === option.value && (
                    <Check size={16} className="text-primary-600 dark:text-blue-400" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
