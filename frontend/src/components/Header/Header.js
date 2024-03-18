import React, { useEffect, useState } from 'react';
import classes from "./Header.module.scss";
import { Link } from "react-router-dom";
import { BiMenuAltRight } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import home from "./../../assets/home.png"
import { logout } from "../../reducers/userReducer";
import { useDispatch, useSelector } from "react-redux";
import Button from '../Button/Button';
import { useNavigate } from 'react-router-dom';

const Header = () => {

  const dispatch = useDispatch()
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuth = useSelector(state => state.user.isAuth)
  const navigate = useNavigate();
  const [size, setSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (size.width > 1080 && menuOpen) {
      setMenuOpen(false);
    }
  }, [size.width, menuOpen]);

  const menuToggleHandler = () => {
    setMenuOpen((p) => !p);
  };

  const ctaClickHandler = () => {
    menuToggleHandler();

  }
  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
    window.location.reload()
  };

  return (
    <header className={classes.header}>
      <div className={classes.header__content}>
        <div className={classes.header__content__mid}>
          <img className={classes.header__content__mid__logo__img} src={home} alt="MyMoney"></img>
          <Link to="/" className={classes.header__content__mid__text}>
            <h1 className='header__logo'>MyMoney</h1>
          </Link>
        </div>


        <nav
          className={`${classes.header__content__nav} ${menuOpen && size.width < 1080 ? classes.isMenu : ""
            }`}>
          <ul>
            <li>
              <Link to="/main" onClick={menuToggleHandler}>
                Wallets
              </Link>
            </li>
            <li>
              <Link to="/calendar" onClick={menuToggleHandler}>
                Calendar
              </Link>
            </li>
            <li>
              <Link to="/card" onClick={menuToggleHandler}>
                Cards
              </Link>
            </li>
            <li>
              <Link to="/paragon" onClick={menuToggleHandler}>
                Receipts
              </Link>
            </li>
            <li>
              <Link to="/setting" onClick={menuToggleHandler}>
                Settings
              </Link>
            </li>
            {!isAuth && <li>
              <Link to="/login" onClick={menuToggleHandler}>Sign In</Link>
            </li>}
            <ul>
              {isAuth && <div className="submit-btn">
                <Button onClick={handleLogout}
                  name={'Sign Out'}
                  bPad={'.8rem 1.6rem'}
                  bRad={'30px'}
                  bg={'var(--color-accent'}
                  color={'#fff'}
                />
              </div>}
            </ul>
          </ul>
        </nav>
        <div className={classes.header__content__toggle}>
          {!menuOpen ? (
            <BiMenuAltRight onClick={menuToggleHandler} />
          ) : (
            <AiOutlineClose onClick={menuToggleHandler} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;