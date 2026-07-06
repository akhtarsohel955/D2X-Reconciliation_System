import { Routes, Route } from 'react-router-dom'
import { ConversionProvider } from './contexts/ConversionContext'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ExpenseConverter from './pages/ExpenseConverter'
import HRConverter from './pages/HRConverter'
import ReconciliationConverter from './pages/ReconciliationConverter'

function App() {
  return (
    <ConversionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expense" element={<ExpenseConverter />} />
        <Route path="/hr" element={<HRConverter />} />
        <Route path="/reconciliation" element={<ReconciliationConverter />} />
      </Routes>
    </ConversionProvider>
  )
}

export default App