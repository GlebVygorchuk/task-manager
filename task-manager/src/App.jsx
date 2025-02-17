import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import MainPage from './pages/MainPage'
import Entrance from './pages/Entrance'

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<Entrance />}/>
        <Route path='/main' element={<MainPage />}/>
        <Route path='/register' element={<Register />}/>
        <Route path='/login' element={<Login />}/>
      </Routes>
    </Router>
    </>
  )
}

export default App
