import React from 'react';
import "./Home.modules.scss"
import { Link } from "react-router-dom";
import home1 from "../../assets/home1.png"



const Home = () => {
    return (

        <div className='container'>
            <div className='home__wrap'>
                <div className='home__mid'>
                    <div className='home__logo'>
                        <img src={home1} alt='logo'></img>
                    </div>
                    <div className='home__content'>
                        <div className='home__mid__content '>
                            <h1 className='home__content__tytul'>MyMoney</h1>

                            <h2 className='home__content__text'>MyMoney helps efficiently manage finances, track expenses, and create a budget so that you can achieve your financial goals.</h2>
                        </div>
                        <div className='button-container'>
                            <div className='home__btn' id='1'><Link className='home__content__button' to="/registration">Sign Up</Link></div>
                            <div className='home__btn' id='2'><Link className='home__content__button' to="/login">Sign in</Link></div>
                        </div>

                    </div>
                </div>


            </div>
        </div >

    )
}

export default Home