import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from "./common/navbar/navbar.jsx"

// Temporary placeholder components for the routes
const HomePage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Bienvenido a Chromia</h1>
        <p>La biblioteca de paletas de colores personalizadas</p>
    </div>
)

const ColorsPage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Colores</h1>
        <p>Explora colores individuales</p>
    </div>
)

const PalettesPage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Paletas</h1>
        <p>Descubre paletas de colores</p>
    </div>
)

const LoginPage = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Iniciar Sesión</h1>
        <p>Accede a tu cuenta</p>
    </div>
)

function App() {
    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/colors" element={<ColorsPage />} />
                    <Route path="/color-palletes" element={<PalettesPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </main>
        </>
    )
}

export default App
