import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BookingContext = createContext(null);

// Shares the appointment modal state so any button (navbar, hero, doctor card) can open it,
// optionally with a doctor preselected.
export function BookingProvider({ children }) {
  const [state, setState] = useState({ open: false, doctorId: '' });

  const openBooking = useCallback((doctorId = '') => {
    setState({ open: true, doctorId: doctorId ? String(doctorId) : '' });
  }, []);

  const closeBooking = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const value = useMemo(() => ({ ...state, openBooking, closeBooking }), [state, openBooking, closeBooking]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
