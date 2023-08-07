import React, { useState, useEffect, SyntheticEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';


const LoginForm = (props: { loginData: Function, success: Function }) => {
    const [user, setUser] = useState({
        email: '',
        password: '',
    });

    const handleChange = (event: any) => {
        setUser({
            ...user,
            [event.target.name]: event.target.value,
        });
    };

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        try {

            const { data } = await axios.post('login', {
                email: user.email,
                password: user.password,
            });

            // axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
            console.log(data)
            props.loginData(data);
        } catch (error) {

        }

    };

    const onSuccess = async (googleUser: any) => {
        try {
            const { status, data } = await axios.post('google-auth', {
                token: googleUser.credential
            })
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
            if (status === 200) {
                props.success();
            }

            // console.log(googleUser.credential)
        } catch (error) {

        }
    }
    const onFailure = () => {

    }

    const responseGoogle = (response: any) => {
        console.log(response);
    }

    return (
        <>
            <form onSubmit={submit}>
                <h1 className="h3 mb-3 fw-normal">Please login</h1>
                <div className="form-floating">
                    <input type="email" className="form-control" placeholder="name@example.com" name="email" onChange={handleChange} />
                    <label htmlFor="floatingInput">Email address</label>
                </div>
                <div className="form-floating">
                    <input type="password" className="form-control" placeholder="Password" name="password" onChange={handleChange} />
                    <label htmlFor="floatingPassword">Password</label>
                </div>

                <div className="mb-3">
                    <Link to={'/forgot'}>Forgot password?</Link>
                </div>
                <button className="btn btn-primary w-100 py-2" type="submit">Submit</button>
            </form>
            <div className="mt-3">
                <GoogleLogin
                    width={'100%'}
                    onSuccess={onSuccess}
                    onError={() => {
                        console.log('Login Failed');
                    }}

                />
            </div>
        </>
    )
}

export default LoginForm