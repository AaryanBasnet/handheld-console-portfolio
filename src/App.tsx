import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { DeviceProvider } from './device/DeviceProvider'
import { Device } from './device/Device'

const PlainPage = lazy(() => import('./pages/PlainPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/plain"
          element={
            <Suspense fallback={<p className="p-6 font-mono">Loading…</p>}>
              <PlainPage />
            </Suspense>
          }
        />
        <Route
          path="/*"
          element={
            <DeviceProvider>
              <Device />
            </DeviceProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
