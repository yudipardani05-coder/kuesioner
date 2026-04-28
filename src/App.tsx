import { Routes, Route } from 'react-router'
import KuesionerPage from './pages/KuesionerPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<KuesionerPage />} />
    </Routes>
  )
}
