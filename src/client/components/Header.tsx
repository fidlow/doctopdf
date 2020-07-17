import * as React from "react";

export default function Header() {
    return <header className="header">
      <div className="logo">
        <p className="logo__title">Doc To Pdf</p>
      </div>
      <nav className="menu">
        <button className="menu__button" type="button">
          <use
            className="menu__icon-menu"
            href="images/sprite.svg#menu"
          ></use>
          <use
            className="menu__icon-cross"
            href="images/sprite.svg#cross"
          ></use>
        </button>
        <ul className="menu__list" id="menu__list">
          <li className="menu__item">
            <a className="menu__link menu__link--current" href="/">
                  Главная
            </a>
          </li>
          <li className="menu__item">
            <a className="menu__link menu__link--inactive">О нас</a>
          </li>
        </ul>
      </nav>
    </header>;
  }