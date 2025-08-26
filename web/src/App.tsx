import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage.tsx'
import CallbackPage from './components/CallbackPage.tsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/callback" element={<CallbackPage />} />
      </Routes>
    </div>
  )
}

export default App
