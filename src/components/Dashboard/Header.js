import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, FileText } from 'lucide-react';
import Button from '../UI/Button';
import ThemeToggle from '../UI/ThemeToggle';
import FlappyGame from '../Game/FlappyGame';

const Header = ({ user, onSignOut, onShowNotes }) => {
  const [showGame, setShowGame] = useState(false);

  return (
    <>
      <FlappyGame
        isOpen={showGame}
        onClose={() => setShowGame(false)}
      />
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-40 backdrop-blur-xl bg-white/10 dark:bg-gray-900/50 transition-colors duration-300"
      >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowGame(true)}
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200 cursor-pointer group"
              title="🎮 Click for a surprise!"
            >
              <span className="group-hover:animate-pulse">TicketTrack Pro</span>
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                🎮
              </span>
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30 dark:border-gray-700/50 transition-colors duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 dark:from-blue-500 dark:to-purple-500 rounded-full flex items-center justify-center">
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

            <ThemeToggle />

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
    </>
  );
};

export default Header;
