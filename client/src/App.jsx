import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
// Common
import Navbar from "./common/navbar/navbar.jsx"
import Footer from './common/footer/footer.jsx'
import Login from './common/login/login.jsx'
import Register from './common/register/register.jsx'
import ForgotPassword from './common/forgot_password/forgot_password.jsx'
// Pages
import Dashboard from './userPages/dashboard/dashboard.jsx'
import Colors from './userPages/colors/colors.jsx'
import ColorPalettes from './userPages/color_palettes/color_palettes.jsx'

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
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/colors" element={<Colors />} />
                    <Route path="/color-palettes" element={<ColorPalettes />} />
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
