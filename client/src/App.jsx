import React from 'react'
import { Routes, Route } from 'react-router-dom'
// Common
import Navbar from "./common/navbar/navbar.jsx"
import Footer from './common/footer/footer.jsx'

function App() {
    return (
        <>
            <Navbar />

            <main>
                <Routes>
                    {/* <Route path="/" element={<HomePage />} />
                    <Route path="/colors" element={<ColorsPage />} />
                    <Route path="/color-palletes" element={<PalettesPage />} />
                    <Route path="/login" element={<LoginPage />} /> */}
                </Routes>
            </main>

            <Footer />
        </>
    )
}

export default App
