import React, { useState, useEffect, SyntheticEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../login.css'
import { Link } from 'react-router-dom';


const Forgot = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');

    const [notify, setNotify] = useState({
        show: false,
        error: false,
        message: '',
    });

    const handleChange = (event: any) => {
        setEmail(event.target.value);
    };

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('forgot', {
                email: email,
            });

            setNotify({
                show: true,
                error: false,
                message: 'Please check your email!',
            })
        } catch (error) {
            setNotify({
                show: true,
                error: false,
                message: 'Error occurred!',
            })
        } finally {
            setTimeout(() =>
                setNotify({
                    show: false,
                    error: false,
                    message: ''
                }), 3000)
            setEmail('');
        }

    };

    let info;

    if (notify.show) {
        info = <div className={notify.error ? 'alert alert-danger' : 'alert alert-success'} role='alert'>
            {notify.message}
        </div>
    }

    return (
        <main className="form-signin w-100 m-auto">
            {info}
            <form onSubmit={submit}>
                <h1 className="h3 mb-3 fw-normal">Please put your email</h1>
                <div className="form-floating">
                    <input type="email" className="form-control" placeholder="name@example.com" name="email" onChange={handleChange} value={email} />
                    <label htmlFor="floatingInput">Email address</label>
                </div>
                <button className="btn btn-primary w-100 py-2 mt-3" type="submit">Submit</button>
            </form>
        </main>
    );
};

export default Forgot;
