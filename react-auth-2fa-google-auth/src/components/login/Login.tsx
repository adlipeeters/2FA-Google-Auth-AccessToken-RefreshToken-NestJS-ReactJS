import React, { useState, useEffect, SyntheticEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../login.css'
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import AuthenticatorForm from './AuthenticatorForm';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/authSlice';


const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [redirect, setRedirect] = useState(false);
    const [loginData, seLoginData] = useState<{
        id: number,
        secret?: string,
        otpauth_url?: string,
    }>({
        id: 0,
        secret: '',
        otpauth_url: '',
    });

    useEffect(() => {
        if (redirect) {
            navigate('/');
        }
    }, [redirect, navigate]);

    const success = () => {
        setRedirect(true);
        dispatch(setAuth(true));
    }

    let form;
    if (loginData?.id === 0) {
        form = <LoginForm loginData={seLoginData} success={success} />
    } else {
        form = <AuthenticatorForm loginData={loginData} success={success} />
    }

    return (
        <main className="form-signin w-100 m-auto">
            {form}
        </main>
    );
};

export default Login;
