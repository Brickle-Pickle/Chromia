import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAppContext } from './context/app_context.jsx'
// Common
import Navbar from "./common/navbar/navbar.jsx"
import Footer from './common/footer/footer.jsx'
import Login from './common/login/login.jsx'
import Register from './common/register/register.jsx'
import ForgotPassword from './common/forgot_password/forgot_password.jsx'

function App() {
    const location = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        scrollTo(0, 0);
    }, [location]);

    return (
        <>
            <Navbar />

            <main>
                <Routes>
                    {/* <Route path="/" element={<HomePage />} />
                    <Route path="/colors" element={<ColorsPage />} />
                    <Route path="/color-palletes" element={<PalettesPage />} /> */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
            </main>

            <Footer />
        </>
    )
}

export default App
