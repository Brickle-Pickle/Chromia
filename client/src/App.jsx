import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
// Common
import Navbar from "./common/navbar/navbar.jsx"
import Footer from './common/footer/footer.jsx'
import Login from './common/login/login.jsx'

function App() {
    useEffect(() => {
        scrollTo(0, 0);
    }, [])

    return (
        <>
            <Navbar />

            <main>
                <Routes>
                    {/* <Route path="/" element={<HomePage />} />
                    <Route path="/colors" element={<ColorsPage />} />
                    <Route path="/color-palletes" element={<PalettesPage />} /> */}
                    <Route path="/login" element={<Login />} />
                </Routes>
            </main>

            <Footer />
        </>
    )
}

export default App
