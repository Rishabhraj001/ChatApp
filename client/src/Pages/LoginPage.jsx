import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {
  const [currState, setcurrstate] = useState("Sign up")
  const [fullName, setFullName] = useState("") 
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [bio, setbio] = useState("")
  const [isSubmitted, setisSubmitted] = useState(false)

  const {login} = useContext(AuthContext)
   
  const onSubmithandler = (e)=>{
    e.preventDefault();
    if(currState === "Sign up" && !isSubmitted){
      setisSubmitted(true)
      return;
    }
    
    login(currState === "Sign up" ?'signup' : 'login',{fullName,email,password,bio})
  }
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center
    gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* left */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />
      {/* Right */}
      <form onSubmit={onSubmithandler} className='border-2 bg-white/8 text-white border border-gray-500 p-6
     flex flex-col gap-6 rounded-lg shaadow-lg' action="">
        <h2 className='font-medium text-2xl flex justify-between items-center'>{currState}
          {
            isSubmitted && <img onClick={()=> setisSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />
          }
          
        </h2>


        {currState === "Sign up" && !isSubmitted && (
          <input onChange={(e) => setFullName(e.target.value)} value={fullName} type="text" className='p-2
               border-gray-500 rounded-md focus:outline-none 
               focus:ring-2 focus:ring-indigo-500' placeholder='Full Name' required />)}

        {
          !isSubmitted && (
            <>
              <input onChange={(e) => setemail(e.target.value)} value={email} type="email"
                placeholder='Email Address' required className='p-2
               border-gray-500 rounded-md focus:outline-none 
               focus:ring-2 focus:ring-indigo-500'/>
               <input onChange={(e) => setpassword(e.target.value)} value={password} type="password"
                placeholder='Password' required className='p-2
               border-gray-500 rounded-md focus:outline-none 
               focus:ring-2 focus:ring-indigo-500'/>
               
            </>
          )
        }

        {
          currState === "Sign up" && isSubmitted && (
            <textarea onChange={(e) => setbio(e.target.value)} value={bio} rows={4} required className='p-2
               border-gray-500 rounded-md focus:outline-none 
               focus:ring-2 focus:ring-indigo-500' placeholder='Provide A Short Bio'></textarea>
          )
        }

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 
        text-white rounded-md cursor-pointer'>
          {currState === 'Sign up' ? "Create Account" : "Login Now"}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy</p>
        </div>

        <div className='flex flex-col gap-2 '>
          {currState === "Sign up" ? (
            <p className='text-sm text-gray-600'> Already have an account? <span onClick={()=>{setcurrstate("Login"); setisSubmitted(false)}} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
          ) : (
            <p className='text-sm text-gray-600'>Create an account <span onClick={()=>{setcurrstate("Sign up"); setisSubmitted(false)}} className='font-medium text-violet-500 cursor-pointer'>Click Here</span></p>
          )}
        </div>



      </form>
    </div>
  )
}

export default LoginPage