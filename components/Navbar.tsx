'use client';

import { motion } from 'framer-motion';
import BookDemoModal from '@/components/BookDemoModal';
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
        <div className="text-2xl font-bold bg-gradient-to-r from-white to-white bg-clip-text text-transparent tracking-tight">
          <Link href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} className="cursor-pointer text-white">MediGrant</Link>
        </div>
        <div className="flex items-center space-x-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link 
              href="/about"
              onClick={(e) => { e.preventDefault(); window.location.href = '/about'; }} 
              className={`cursor-pointer font-medium ${currentPage === 'about' ? 'text-[#3ABEFF]' : 'hover:text-[#3ABEFF]'}`}
            >
              About
            </Link>
          </motion.div>
          <div>
            <BookDemoModal buttonClassName="cursor-pointer inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] text-[#0A0F1C] font-bold hover:shadow-[0_0_40px_rgba(58,190,255,0.6)] transition-all duration-300 relative overflow-hidden group flex justify-center items-center" />
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
