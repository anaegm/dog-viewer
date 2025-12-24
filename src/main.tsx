import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DogViewer from './app/DogViewer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DogViewer />
  </StrictMode>,
)
