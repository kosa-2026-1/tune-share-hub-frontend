import { Link } from 'react-router-dom'
import { EmptyView } from '../components/StatusView.jsx'

export function NotFoundPage() {
  return (
    <main className="page-section">
      <div className="container-xxl">
        <EmptyView
          title="페이지를 찾을 수 없습니다."
          action={
            <Link to="/" className="btn btn-accent">
              홈으로 이동
            </Link>
          }
        />
      </div>
    </main>
  )
}
