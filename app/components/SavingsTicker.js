'use client';

import { useEffect, useState } from 'react';

export function SavingsTicker() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const response = await fetch('/api/savings', { cache: 'no-store' });
      const data = await response.json();
      if (mounted) setTotal(Number(data.total) || 0);
    };

    load();
    const interval = setInterval(load, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return <p className="savings">${total.toLocaleString()}</p>;
}
