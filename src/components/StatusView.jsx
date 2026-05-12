import { Loader2 } from 'lucide-react'

export function LoadingView({ label = '불러오는 중입니다.' }) {
  return (
    <div className="surface d-flex align-items-center justify-content-center gap-2 p-4">
      <Loader2 size={18} className="spinner-border spinner-border-sm border-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorView({ error, onRetry }) {
  return (
    <div className="alert alert-danger d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
      <span>{error?.message || '요청 처리 중 오류가 발생했습니다.'}</span>
      {onRetry ? (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          다시 시도
        </button>
      ) : null}
    </div>
  )
}

export function EmptyView({ title = '표시할 항목이 없습니다.', action }) {
  return (
    <div className="surface text-center p-5">
      <h2 className="h5">{title}</h2>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}
