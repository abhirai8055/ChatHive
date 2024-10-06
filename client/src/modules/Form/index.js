import { useState } from "react";
import Button from "../../components/button";
import Input from "../../components/input";
import { useNavigate } from "react-router-dom";


const Form = ({ isSignInPage = true }) => {
  const [data, setData] = useState({
    ...(!isSignInPage && { fullName: "" }),
    email: "",
    password: "",
  });

  const handleOnSubmit=async(e)=>{
    e.preventDefault();
    console.log(data);
    const res=await fetch(`http://localhost:9000/user/${isSignInPage ? 'login' : 'signUp'}`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        },
        body:JSON.stringify(data)
    })
    const resData=await res.json();
    console.log(resData);
  }

  const navigate=useNavigate();
  return (
    <div className="bg-gray-50 flex h-screen items-center justify-center">
      <div className="bg-white w-[500px] h-[600px] shadow-lg rounded-lg flex flex-col justify-center  items-center">
        <div className=" text-4xl font-extrabold ">
          Welcome {isSignInPage && "Back"}
        </div>
        <div className="text-xl font-light mb-14">
          {isSignInPage
            ? "Sign in to get explored"
            : "Sign up now to get started !"}
        </div>
        <form
          className="flex flex-col items-center justify-center w-[75%]"
          onSubmit={(e) => handleOnSubmit()}
        >
          {!isSignInPage && (
            <Input
              label="Full Name"
              name="Name"
              
              placeholder="enter Your Full Name"
              className="mb-6"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
            />
          )}
          <Input
            label="Email Address"
            name="Email"
            placeholder="enter Your Email"
            className="mb-6"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            name="Password"
            placeholder="enter Your Password"
            className="mb-10"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
          <Button
            label={isSignInPage ? "Sign in" : "Sign up"}
            className="w-[75%] mb-2"
            type="submit"
          />
        </form>
        <div>
          {isSignInPage ? "Did'nt have an account" : "Already have an account?"}{" "}
          <span className="text-primary cursor-pointer underline" onClick={()=>navigate(`/users/${isSignInPage ?'sign_up':'sign_in'}`)}>
            {isSignInPage ? "Sign up" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Form;
