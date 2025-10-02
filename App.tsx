
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// FIX: `useAuth` is exported from `./hooks/useAuth`, not `./context/AuthContext`.
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { useAudio } from './hooks/useAudio';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import FullPlayer from './components/FullPlayer';
import NotificationContainer from './components/NotificationContainer';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MusicDetailPage from './pages/MusicDetailPage';
import AddMusicPage from './pages/AddMusicPage';
import EditMusicPage from './pages/EditMusicPage';
import WordPressContentPage from './pages/WordPressContentPage';
import UserLibraryPage from './pages/UserLibraryPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import ArtistPage from './pages/ArtistPage';
import AlbumPage from './pages/AlbumPage';
import BrowsePage from './pages/BrowsePage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { UserRole } from './types';
import JoinPlaylistPage from './pages/JoinPlaylistPage';

const ProtectedRoute: React.FC<{ children: React.ReactElement; roles: UserRole[] }> = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => {
     const { isAuthenticated } = useAuth();
     const { isFullPlayerOpen, toggleFullPlayer } = useAudio();
     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

     const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
     const closeSidebar = () => setIsSidebarOpen(false);

     return(
         <div className="min-h-screen bg-spotify-black flex">
             <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
             <div className="flex-1 flex flex-col min-w-0 md:ml-0">
                 <Header onMenuClick={toggleSidebar} />
                 <main className="flex-1 px-6 py-8 pb-24 overflow-auto">
                     <div className="max-w-7xl mx-auto">
                         <Routes>
                             <Route path="/" element={isAuthenticated ? <HomePage /> : <LandingPage />} />
                             <Route path="/browse" element={<BrowsePage />} />
                             <Route path="/search" element={<SearchPage />} />
                             <Route path="/login" element={<LoginPage />} />
                             <Route path="/register" element={<RegisterPage />} />
                             <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                             <Route path="/music/:id" element={<MusicDetailPage />} />
                             <Route path="/artists/:id" element={<ArtistPage />} />
                             <Route path="/albums/:id" element={<AlbumPage />} />
                             <Route path="/add" element={
                                 <ProtectedRoute roles={[UserRole.EMPLOYER, UserRole.ADMIN]}>
                                     <AddMusicPage />
                                 </ProtectedRoute>
                             } />
                             <Route path="/edit/:id" element={
                                 <ProtectedRoute roles={[UserRole.EMPLOYER, UserRole.ADMIN]}>
                                     <EditMusicPage />
                                 </ProtectedRoute>
                             } />
                             <Route path="/wp-content" element={
                                 <ProtectedRoute roles={[UserRole.ADMIN]}>
                                     <WordPressContentPage />
                                 </ProtectedRoute>
                             } />
                             <Route path="/library" element={
                                 <ProtectedRoute roles={[UserRole.USER, UserRole.EMPLOYER, UserRole.ADMIN]}>
                                     <UserLibraryPage />
                                 </ProtectedRoute>
                             } />
                             <Route path="/playlists/:id" element={
                                 <ProtectedRoute roles={[UserRole.USER, UserRole.EMPLOYER, UserRole.ADMIN]}>
                                     <PlaylistDetailPage />
                                 </ProtectedRoute>
                             } />
                             <Route path="/playlists/join/:inviteCode" element={
                                 <ProtectedRoute roles={[UserRole.USER, UserRole.EMPLOYER, UserRole.ADMIN]}>
                                     <JoinPlaylistPage />
                                 </ProtectedRoute>
                             } />
                             <Route path="/profile" element={
                                 <ProtectedRoute roles={[UserRole.USER, UserRole.EMPLOYER, UserRole.ADMIN]}>
                                     <UserProfilePage />
                                 </ProtectedRoute>
                             } />
                             <Route path="/admin" element={
                                 <ProtectedRoute roles={[UserRole.ADMIN]}>
                                     <AdminDashboardPage />
                                 </ProtectedRoute>
                             } />
                             <Route path="*" element={<Navigate to="/" />} />
                         </Routes>
                     </div>
                 </main>
                 <AudioPlayer />
                 <FullPlayer isOpen={isFullPlayerOpen} onClose={toggleFullPlayer} />
                 <NotificationContainer />
             </div>
         </div>
     )
 }

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <AudioProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AudioProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;
