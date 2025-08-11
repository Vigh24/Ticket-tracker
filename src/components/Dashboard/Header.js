import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, FileText } from 'lucide-react';
import Button from '../UI/Button';

const Header = ({ user, onSignOut, onShowNotes }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass border-b border-white/20 sticky top-0 z-40 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)'
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"
            >
              TicketTrack Pro
            </motion.h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-gray-600 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="font-medium">{user.email}</span>
            </div>

            <Button
              variant="ghost"
              onClick={onShowNotes}
              className="hidden sm:flex items-center gap-2"
            >
              <FileText size={20} />
              Notes
            </Button>

            <Button
              variant="secondary"
              onClick={onSignOut}
              className="flex items-center gap-2"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
