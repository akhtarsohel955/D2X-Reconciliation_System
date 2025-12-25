import { Routes, Route } from 'react-router-dom'
import { ConversionProvider } from './contexts/ConversionContext'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ExpenseConverter from './pages/ExpenseConverter'
import HRConverter from './pages/HRConverter'

function App() {
  return (
    <ConversionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expense" element={<ExpenseConverter />} />
        <Route path="/hr" element={<HRConverter />} />
      </Routes>
    </ConversionProvider>
  )
}

export default App