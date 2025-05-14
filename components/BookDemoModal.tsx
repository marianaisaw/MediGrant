'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import DemoBookingForm from '@/components/DemoBookingForm';
import { Button } from '@/components/ui/button';

interface BookDemoModalProps {
  buttonClassName?: string;
  buttonText?: string;
}

export default function BookDemoModal({
  buttonClassName,
  buttonText = 'Contact Us'
}: BookDemoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    // Reset success state after modal is closed
    setTimeout(() => setIsSuccess(false), 300);
  };

  const handleSuccess = () => {
    setIsSuccess(true);
    // Close modal after 3 seconds
    setTimeout(handleClose, 3000);
  };

  return (
    <>
      <Button onClick={handleOpen} className={buttonClassName}>
        {buttonText}
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={isSuccess ? 'Thank You!' : 'Book a Demo'}
      >
        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Request Submitted!</h3>
            <p className="text-muted-foreground">
              We&apos;ve received your demo request and will contact you shortly.
            </p>
          </div>
        ) : (
          <DemoBookingForm onSuccess={handleSuccess} />
        )}
      </Modal>
    </>
  );
}
