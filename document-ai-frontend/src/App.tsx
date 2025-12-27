import { Routes, Route } from 'react-router-dom'
import { ConversionProvider } from './contexts/ConversionContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ExpenseConverter from './pages/ExpenseConverter'
import HRConverter from './pages/HRConverter'

function App() {
  return (
    <ConversionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expense" 
          element={
            <ProtectedRoute>
              <ExpenseConverter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hr" 
          element={
            <ProtectedRoute>
              <HRConverter />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </ConversionProvider>
  )
}

export default App