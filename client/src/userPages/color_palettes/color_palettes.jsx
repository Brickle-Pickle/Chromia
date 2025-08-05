import React from 'react'
import PaletteCreate from './palette_create/palette_create.jsx'
import PaletteGrid from './palette_grid/palette_grid.jsx'

const ColorPalettes = () => {
    return (
        <>
            <PaletteGrid />
            <PaletteCreate />
        </>
    )
}

export default ColorPalettes