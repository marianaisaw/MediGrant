'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavbarProps {
  currentPage?: 'home' | 'about' | 'contact';
}

export default function Navbar({ currentPage = 'home' }: NavbarProps) {
  return (
    <motion.header
      className="fixed w-full z-50 backdrop-blur-md bg-[#0A0F1C]/80 border-b border-[#3ABEFF]/20"
      style={{ boxShadow: '0 0 40px rgba(58,190,255,var(--header-glow))' }}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div
          className="text-2xl font-bold bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] bg-clip-text text-transparent"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
        >
          <Link href="/">MediGrant</Link>
        </motion.div>
        <div className="flex items-center space-x-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link 
              href="/about" 
              className={`font-medium ${currentPage === 'about' ? 'text-[#3ABEFF]' : 'hover:text-[#3ABEFF]'}`}
            >
              About
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link 
              href="/" 
              className={`font-medium ${currentPage === 'home' ? 'text-[#3ABEFF]' : 'hover:text-[#3ABEFF]'}`}
            >
              Solutions
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ boxShadow: '0 0 20px rgba(58,190,255,0.6)' }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              href="/contact" 
              className={`px-6 py-2 rounded-full bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] text-[#0A0F1C] font-bold`}
            >
              Book Demo
            </Link>
          </motion.div>
        </div>
      </nav>
    </motion.header>
  );
}
