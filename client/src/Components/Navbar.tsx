
import { useNavigate } from 'react-router-dom'

function Navbar() {
    const navigate=useNavigate();
  return (
    <div className='flex justify-between px-50 pt-5 border border-slate-700 shadow-2xl p-5'>
        <div className='font-bold text-3xl '>
            HelpOnRoute
        </div>
        {localStorage.getItem("token")?<div>
            <button onClick={()=>{
                localStorage.removeItem("token");
                navigate("/")
            }} className='border rounded-2xl p-2 bg-red-600 text-white' >Logout</button>
        </div>:
        <div>
        <button className='text-2xl cursor-pointer' onClick={()=>{
            navigate("/signin")
        }}>
            Login
        </button>
         <button className='text-2xl cursor-pointer pl-5' onClick={()=>{
            navigate("/signup")
         }}>
            Signup
        </button>
        </div>}
    </div>
  )
}

export default Navbar