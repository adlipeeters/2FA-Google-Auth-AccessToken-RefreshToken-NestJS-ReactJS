import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../redux/store'
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/authSlice';

const Nav = () => {

    const auth = useSelector((state: RootState) => state.auth.value)

    const dispatch = useDispatch()

    const logout = async () => {
        await axios.post('logout');
        axios.defaults.headers.common['Authorization'] = '';
        dispatch(setAuth(false));
    }

    let links

    if (auth) {
        links = <div className="text-end">
            <Link to={'/login'} onClick={logout}>
                <button type="button" className="btn btn-outline-light me-2">Logout</button>
            </Link>

        </div>
    } else {
        links = <div className="text-end">
            <Link to={'/login'}>
                <button type="button" className="btn btn-outline-light me-2">Login</button>
            </Link>
            <Link to={'/register'}>
                <button type="button" className="btn btn-outline-light me-2">Register</button>
            </Link>
        </div>
    }

    return (
        <header className="p-3 text-bg-dark">
            <div className="container">
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                        <li>
                            <Link className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6 text-white" to={'/'}>Home</Link>
                        </li>
                    </ul>
                    {links}
                </div>
            </div>
        </header>
    )
}


export default Nav