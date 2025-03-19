// store.js
import { atom } from 'jotai';

// Atoms to store the appointment date and time
export const appointmentDateAtom = atom('');
export const appointmentTimeAtom = atom('');

// Atom to store the selected foodbank
export const selectedFoodbankAtom = atom('');

export const appointmentAtom = atom(null); // Initial state is null

export const cartAtom = atom([]);
export const cartErrorAtom = atom('');
