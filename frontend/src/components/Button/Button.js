import React from 'react'
import './button.modules.scss'
import styled from 'styled-components'

function Button({ name, icon, onClick, bg, bPad, color, bRad }) {
    return (
        <button style={{
            background: bg,
            padding: bPad,
            borderRadius: bRad,
            color: color,
        }} onClick={onClick}>
            {icon}
            {name}
        </button>
    )
}



export default Button