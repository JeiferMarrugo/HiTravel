import Link from "next/link";
import { buildToursUrl, type ToursSearchParams } from "@/lib/tours/tours-url";

const PAGE_WINDOW = 5;

type ToursPaginationProps = {
  currentPage: number;
  totalPages: number;
  searchParams: ToursSearchParams;
};

function pageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= PAGE_WINDOW) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = Math.max(1, currentPage - Math.floor(PAGE_WINDOW / 2));
  let end = start + PAGE_WINDOW - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - PAGE_WINDOW + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function ToursPagination({ currentPage, totalPages, searchParams }: ToursPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = pageNumbers(currentPage, totalPages);
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Paginación de tours">
      {prevPage ? (
        <Link
          href={buildToursUrl(prevPage, searchParams)}
          className="rounded-full bg-surface-container p-2 text-primary transition-colors hover:bg-surface-variant"
          aria-label="Página anterior"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </Link>
      ) : (
        <span className="rounded-full bg-surface-container/50 p-2 text-on-surface-variant/40" aria-hidden>
          <span className="material-symbols-outlined">chevron_left</span>
        </span>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={buildToursUrl(page, searchParams)}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-primary hover:bg-surface-variant"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {nextPage ? (
        <Link
          href={buildToursUrl(nextPage, searchParams)}
          className="rounded-full bg-surface-container p-2 text-primary transition-colors hover:bg-surface-variant"
          aria-label="Página siguiente"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      ) : (
        <span className="rounded-full bg-surface-container/50 p-2 text-on-surface-variant/40" aria-hidden>
          <span className="material-symbols-outlined">chevron_right</span>
        </span>
      )}
    </nav>
  );
}

export const TOURS_PAGE_SIZE = 6;
