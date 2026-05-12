import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pager({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
        이전
      </button>
      <span className="small text-secondary">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        다음
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
