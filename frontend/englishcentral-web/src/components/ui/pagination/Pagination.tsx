import { ChevronLeft, ChevronRight } from "lucide-react";

import styles from "./Pagination.module.scss";

type PageSizeOption = 10 | 20 | 50;

type Props = {
  pageNumber: number;
  pageSize: number;
  pageSizeOptions?: PageSizeOption[];
  totalItems: number;
  onPageChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const defaultPageSizeOptions: PageSizeOption[] = [10, 20, 50];

export function Pagination({
  pageNumber,
  pageSize,
  pageSizeOptions = defaultPageSizeOptions,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePageNumber = Math.min(Math.max(pageNumber, 1), totalPages);
  const startItem = totalItems === 0 ? 0 : (safePageNumber - 1) * pageSize + 1;
  const endItem = Math.min(safePageNumber * pageSize, totalItems);

  return (
    <div className={styles.pagination}>
      <div className={styles.summary}>
        Hiển thị <strong>{startItem}</strong>-<strong>{endItem}</strong> trong{" "}
        <strong>{totalItems}</strong> bản ghi
      </div>

      <div className={styles.controls}>
        <label className={styles.pageSize}>
          <span>Page size</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.pageNumber}>
          <span>Page</span>
          <input
            min={1}
            max={totalPages}
            type="number"
            value={safePageNumber}
            onChange={(event) => {
              const nextPage = Number(event.target.value);

              if (!Number.isNaN(nextPage)) {
                onPageChange(Math.min(Math.max(nextPage, 1), totalPages));
              }
            }}
          />
          <em>/ {totalPages}</em>
        </label>

        <button
          type="button"
          aria-label="Trang trước"
          disabled={safePageNumber === 1}
          onClick={() => onPageChange(safePageNumber - 1)}
        >
          <ChevronLeft aria-hidden="true" size={16} />
          <span>Trước</span>
        </button>
        <button
          type="button"
          aria-label="Trang tiếp"
          disabled={safePageNumber === totalPages}
          onClick={() => onPageChange(safePageNumber + 1)}
        >
          <span>Tiếp</span>
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      </div>
    </div>
  );
}
