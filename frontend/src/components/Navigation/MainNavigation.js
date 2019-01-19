import React from 'react';
import { NavLink } from 'react-router-dom'

import AuthContext from '../../context/auth-context'

import './MainNavigation.css'

const mainNavigation = props => (
  <AuthContext.Consumer>
    {(context) => {
      return (
      <header className="main-navigation">
        <div className="main-navigation__logo">
          <h1>Fluent Truant</h1>
        </div>
        <nav className="main-navigation__items">
          <ul>
            {!context.token && (<li>
              <NavLink to="/auth">Authenticate</NavLink>
            </li>
            )}
            <li><NavLink to="/lessons">Lessons</NavLink></li>
            {!context.token && (
            <li>
              <NavLink to="/create-lesson">Create Lessons</NavLink>
            </li>
            )}
            <li>
              <NavLink to="/text-lesson">Text Lessons</NavLink>
            </li>
          </ul>
        </nav>
      </header>
      );
    }
  }
  </AuthContext.Consumer>
)
export default mainNavigation;
