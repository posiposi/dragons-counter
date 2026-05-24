import { renderHook, act } from "@testing-library/react";
import { usePagination } from "@/hooks/usePagination";

describe("usePagination", () => {
  const items = Array.from({ length: 15 }, (_, i) => `item-${i + 1}`);

  it("初期状態でページ1が選択されている", () => {
    const { result } = renderHook(() => usePagination(items));

    expect(result.current.currentPage).toBe(1);
  });

  it("デフォルトで1ページあたり6件スライスされる", () => {
    const { result } = renderHook(() => usePagination(items));

    expect(result.current.paginatedItems).toEqual([
      "item-1",
      "item-2",
      "item-3",
      "item-4",
      "item-5",
      "item-6",
    ]);
    expect(result.current.paginatedItems).toHaveLength(6);
  });

  it("itemsPerPageを指定するとページサイズが変わる", () => {
    const { result } = renderHook(() => usePagination(items, 5));

    expect(result.current.paginatedItems).toHaveLength(5);
    expect(result.current.totalPages).toBe(3);
  });

  it("totalPagesが正しく算出される", () => {
    const { result } = renderHook(() => usePagination(items));

    expect(result.current.totalPages).toBe(3);
  });

  it("totalItemsが正しく返される", () => {
    const { result } = renderHook(() => usePagination(items));

    expect(result.current.totalItems).toBe(15);
  });

  it("goToPageで指定ページに遷移できる", () => {
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems).toEqual([
      "item-7",
      "item-8",
      "item-9",
      "item-10",
      "item-11",
      "item-12",
    ]);
  });

  it("goToNextPageで次ページに遷移できる", () => {
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("goToPrevPageで前ページに遷移できる", () => {
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.goToPage(3);
    });
    act(() => {
      result.current.goToPrevPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("先頭ページでisFirstPageがtrueになる", () => {
    const { result } = renderHook(() => usePagination(items));

    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(false);
  });

  it("末尾ページでisLastPageがtrueになる", () => {
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.isLastPage).toBe(true);
    expect(result.current.isFirstPage).toBe(false);
  });

  it("先頭ページでgoToPrevPageを呼んでもページ1のまま", () => {
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.goToPrevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("末尾ページでgoToNextPageを呼んでも最終ページのまま", () => {
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.goToPage(3);
    });
    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(3);
  });

  it("範囲外のページ指定は最寄りの有効ページにクランプされる", () => {
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.goToPage(100);
    });
    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.goToPage(0);
    });
    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(-5);
    });
    expect(result.current.currentPage).toBe(1);
  });

  it("データ変更時にページが1にリセットされる", () => {
    const { result, rerender } = renderHook(({ data }) => usePagination(data), {
      initialProps: { data: items },
    });

    act(() => {
      result.current.goToPage(3);
    });
    expect(result.current.currentPage).toBe(3);

    const newItems = Array.from({ length: 5 }, (_, i) => `new-${i + 1}`);
    rerender({ data: newItems });

    expect(result.current.currentPage).toBe(1);
  });

  it("空配列の場合totalPagesは0でpaginatedItemsは空", () => {
    const { result } = renderHook(() => usePagination<string>([]));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.paginatedItems).toEqual([]);
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(true);
  });

  it("最終ページの件数がitemsPerPage未満でも正しくスライスされる", () => {
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.paginatedItems).toEqual([
      "item-13",
      "item-14",
      "item-15",
    ]);
    expect(result.current.paginatedItems).toHaveLength(3);
  });
});
