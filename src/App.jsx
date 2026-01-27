import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProductListing from './pages/ProductListing'
import ProductCustomize from './pages/ProductCustomize'
import ReviewBilling from './pages/ReviewBilling'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProductListing />} />
          <Route path="customize/:productId" element={<ProductCustomize />} />
          <Route path="review" element={<ReviewBilling />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
