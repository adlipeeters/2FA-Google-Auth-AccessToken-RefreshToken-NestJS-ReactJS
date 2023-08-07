import axios from 'axios'
import React, { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import qrcode from 'qrcode'

const AuthenticatorForm = (props: {
  loginData: {
    id: number,
    secret?: string,
    otpauth_url?: string,
  },
  success: Function,
}) => {

  const [code, setCode] = useState('')
  const [image, setImage] = useState<ReactElement | null>(null);

  useEffect(() => {
    if (props.loginData.otpauth_url) {

      qrcode.toDataURL(props.loginData.otpauth_url, (err, data) => {
        setImage(<img src={data} alt="qr" style={{ width: '100%' }}></img>)
      })
    }
  }, [props.loginData.otpauth_url])


  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      const { data, status } = await axios.post('two-factor', {
        ...props.loginData,
        code
      });
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      if (status === 200) {
        props.success();
      }
    } catch (error) {
      console.log(error)

    }

  }

  return (
    <>
      <form onSubmit={submit}>
        <h1 className="h3 mb-3 fw-normal">Please insert your authenticator code</h1>
        <div className="form-floating">
          <input type="text" className="form-control" placeholder="6 digits code" name="code" onChange={e => setCode(e.target.value)} />
          <label htmlFor="floatingInput">6 digits code</label>
        </div>
        <div className="mb-3">
          {/* <Link to={'/forgot'}>Forgot password?</Link> */}
        </div>
        <button className="btn btn-primary w-100 py-2" type="submit">Submit</button>
      </form>
      {image}
    </>
  )
}

export default AuthenticatorForm