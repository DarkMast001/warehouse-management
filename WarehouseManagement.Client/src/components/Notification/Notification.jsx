import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'error', isVisible, onClose }) => {
  const [show, setShow] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible && message) {
      setShow(true);
      setIsClosing(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, 2500);
      
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, message]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShow(false);
      setIsClosing(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!show) return null;

  return (
    <div className={`notification notification--${type} ${isClosing ? 'notification--closing' : ''}`}>
      <div className="notification__content">
        <span className="notification__message">{message}</span>
        <button className="notification__close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;