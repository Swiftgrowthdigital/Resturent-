import { useEffect, useState } from 'react';

const TABLE_KEY = 'restaurant_table_id';

export function useTableSession(tableId) {
  const [currentTableId, setCurrentTableId] = useState(() => sessionStorage.getItem(TABLE_KEY));

  useEffect(() => {
    if (tableId) {
      sessionStorage.setItem(TABLE_KEY, tableId);
      setCurrentTableId(tableId);
    }
  }, [tableId]);

  return currentTableId;
}
