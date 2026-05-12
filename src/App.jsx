import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import { LoadingView } from './components/StatusView.jsx'
import { AuthProvider, useAuth } from './stores/AuthContext.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { MyLibraryPage } from './pages/MyLibraryPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { PlaylistDetailPage } from './pages/PlaylistDetailPage.jsx'
import { PlaylistFormPage } from './pages/PlaylistFormPage.jsx'
import { PlaylistListPage } from './pages/PlaylistListPage.jsx'
import { PlaylistTrackAddPage } from './pages/PlaylistTrackAddPage.jsx'
import { PlayerPage } from './pages/PlayerPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { RankingPage } from './pages/RankingPage.jsx'
import { SearchPage } from './pages/SearchPage.jsx'
import { TrackDetailPage } from './pages/TrackDetailPage.jsx'

function ProtectedRoute({ children }) {
  const { user, bootstrapping } = useAuth()

  if (bootstrapping) {
    return (
      <main className="page-section container-xxl">
        <LoadingView label="세션을 확인하는 중입니다." />
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'playlists', element: <PlaylistListPage /> },
      { path: 'playlists/new', element: <PlaylistFormPage /> },
      { path: 'playlists/:id', element: <PlaylistDetailPage /> },
      { path: 'playlists/:id/edit', element: <PlaylistFormPage /> },
      { path: 'playlists/:id/add-tracks', element: <PlaylistTrackAddPage /> },
      { path: 'player', element: <PlayerPage /> },
      { path: 'library', element: <MyLibraryPage /> },
      { path: 'ranking', element: <RankingPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'tracks/:trackId', element: <TrackDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
