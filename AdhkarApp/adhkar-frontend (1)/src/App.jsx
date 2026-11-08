import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Categories from './pages/Categories'
import AdhkarPage from './pages/Adhkar'
import Quran from './pages/Quran'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Rewards from './pages/Rewards'
import Reminders from './pages/Reminders'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/adhkar" element={<AdhkarPage />} />
        <Route path="/quran" element={<Quran />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <PrivateRoute>
              <Reminders />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}
