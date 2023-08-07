import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../redux/authSlice';
import { RootState } from '../redux/store';

const Home = () => {
    const dispatch = useDispatch()
    const [message, setMessage] = useState('You are not logged in');
    const auth = useSelector((state: RootState) => state.auth.value)

    useEffect(() => {
        (async () => {
            const { data } = await axios.get('user')
            if (data?.first_name || data?.last_name) {
                setMessage(`Hi ${data?.first_name || ''} ${data?.last_name || ''}`);
                dispatch(setAuth(true));
            } else {
                setMessage('You are not logged in');
                dispatch(setAuth(false));
            }
        })()

    }, [])


    return (
        <div className="container mt-5 text-center">
            <h3>
                {auth ? message : 'You are not logged in!'}
            </h3>
        </div>
    )
}

export default Home