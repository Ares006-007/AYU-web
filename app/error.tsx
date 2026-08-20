'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2>Something went wrong!</h2>
      <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        style={{ padding: '0.5rem 1rem', background: '#128C7E', color: 'white', borderRadius: '4px', cursor: 'pointer', border: 'none' }}
      >
        Try again
      </button>
    </div>
  );
}
