import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../login.css'

const Register = () => {
    const navigate = useNavigate();
    const { token } = useParams();

    const [user, setUser] = useState({
        password: '',
        passwordConfirm: '',
    });

    const [redirect, setRedirect] = useState(false);

    const handleChange = (event: any) => {
        setUser({
            ...user,
            [event.target.name]: event.target.value,
        });
    };

    const submit = async (e: any) => {
        e.preventDefault();

        try {
            await axios.post('reset', {
                token: token,
                password: user.password,
                password_confirm: user.passwordConfirm,
            });
            setRedirect(true);
        } catch (error) {

        }
    };

    useEffect(() => {
        if (redirect) {
            navigate('/login');
        }
    }, [redirect, navigate]);

    return (
        <main className="form-signin w-100 m-auto">
            <form onSubmit={submit}>
                <h1 className="h3 mb-3 fw-normal">Reset your password</h1>
                <div className="form-floating">
                    <input type="password" className="form-control" placeholder="Password" name="password" onChange={handleChange} />
                    <label htmlFor="floatingPassword">Password</label>
                </div>
                <div className="form-floating">
                    <input type="password" className="form-control" placeholder="Confirm Password" name="passwordConfirm" onChange={handleChange} />
                    <label htmlFor="floatingPassword">Confirm Password</label>
                </div>
                <button className="btn btn-primary w-100 py-2" type="submit">Submit</button>
            </form>
        </main>
    );
};

export default Register;
