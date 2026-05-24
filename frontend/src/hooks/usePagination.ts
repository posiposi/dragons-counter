import { useState, useMemo, useCallback, useEffect, useRef } from "react";

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 6,
): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const prevItemsRef = useRef(items);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (prevItemsRef.current !== items) {
      setCurrentPage(1);
      prevItemsRef.current = items;
    }
  }, [items]);

  const clampPage = useCallback(
    (page: number): number => {
      if (totalPages === 0) return 1;
      return Math.max(1, Math.min(page, totalPages));
    },
    [totalPages],
  );

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(clampPage(page));
    },
    [clampPage],
  );

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => clampPage(prev + 1));
  }, [clampPage]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => clampPage(prev - 1));
  }, [clampPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const isFirstPage = currentPage <= 1;
  const isLastPage = totalPages === 0 || currentPage >= totalPages;

  return {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    isFirstPage,
    isLastPage,
  };
}
