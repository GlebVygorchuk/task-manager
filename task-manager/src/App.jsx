import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppProvider from './components/AppContext'
import Register from './pages/Register'
import Login from './pages/Login'
import MainPage from './pages/MainPage'
import Entrance from './pages/Entrance'
import { getAuth } from 'firebase/auth'

function App() {
  const auth = getAuth()
  const user = auth.currentUser

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Entrance />}/>
          <Route path='/main' element={<MainPage />}/>
          <Route path='/register' element={<Register />}/>
          <Route path='/login' element={<Login />}/>
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
