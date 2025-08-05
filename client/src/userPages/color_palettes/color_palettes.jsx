import React from 'react'
import { useAppContext } from '../../context/app_context.jsx'
import PaletteCreate from './palette_create/palette_create.jsx'
import PaletteGrid from './palette_grid/palette_grid.jsx'
import PaletteLogin from './palette_login/palette_login.jsx'

const ColorPalettes = () => {
    const { isAuthenticated } = useAppContext();

    // Show login component if user is not authenticated
    if (!isAuthenticated) {
        return <PaletteLogin />;
    }

    // Show palette functionality if user is authenticated
    return (
        <>
            <PaletteGrid />
            <PaletteCreate />
        </>
    )
}

export default ColorPalettes