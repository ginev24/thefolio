// frontend/src/App.js — Phase 2 full routing with ProtectedRoute
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SplashPage from './pages/SplashPage';
import ResetPasswordPage from './pages/ResetPasswordPage';


function Layout() {
  return (
    <div className='app-shell'>
      <Navbar />
      <main className='page-content'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path='/' element={<SplashPage />} />
      <Route element={<Layout />}>
        <Route path='/home'        element={<HomePage />} />
        <Route path='/about'       element={<AboutPage />} />
        <Route path='/contact'     element={<ContactPage />} />
        <Route path='/posts/:id'   element={<PostPage />} />
        <Route path='/login'       element={<LoginPage />} />
        <Route path='/register'    element={<RegisterPage />} />
        <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
        <Route path='/profile'     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path='/create-post' element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path='/edit-post/:id' element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
        <Route path='/admin'       element={<ProtectedRoute role='admin'><AdminPage /></ProtectedRoute>} />
        <Route path='*' element={<NotFoundPage />} />
      </Route>
      {/* Fallback: redirect unknown root to home */}
      <Route path='*' element={<Navigate to='/home' />} />
    </Routes>
  );
}

export default App;
