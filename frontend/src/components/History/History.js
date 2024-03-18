import React from 'react'
import avatar from "./../../assets/avatar.png"
import menuItems from "../../utils/menu-items/menuItems"
import { useDispatch, useSelector } from "react-redux";
import "./History.modules.scss"
function History(active, setActive, displayDataContent) {
    const isAuth = useSelector(state => state.user.isAuth)
    const dispatch = useDispatch()
    const currentUser = useSelector(state => state.user.currentUser);

    return (
        <div className='container'>
            <div className='section'>
                <div className="user-con">
                    <img src={avatar} alt="" />
                    <div className="text">
                        <h2>{currentUser.name}</h2>
                    </div>
                </div>
                <ul className="menu-items">
                    {menuItems.map((item) => {
                        return <li
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={active === item.id ? 'active' : ''}
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </li>
                    })}
                </ul>
            </div>
            <div className='content'>{displayDataContent}</div>
        </div>

    )
}

export default History