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

  const navigate = useNavigate();

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data:", data);

    try {
      const res = await fetch(
        `http://localhost:9000/user/${isSignInPage ? "login" : "signUp"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const resData = await res.json(); // Call res.json() once

      if (!res.ok) {
        throw new Error(resData.message || "An error occurred");
      }

      console.log("Response data:", resData);

      if (resData.token) {
        console.log("Token received:", resData.token);
        localStorage.setItem("user:token", resData.token);
        if (isSignInPage) {
          console.log("Navigating to /");
          navigate("/");
        } else {
          console.log("Navigating to /users/sign_in");
          navigate("/users/sign_in"); // Correct path to sign in
        }
        alert("Login Successfully...", data.fullName);
      } else {
        console.log(data.fullName);
        alert("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle the error (e.g., show an error message to the user)
      alert(error.message); // Or use a more user-friendly way to show error
    }
  };

  return (
    <div className="bg-gray-50 flex h-screen items-center justify-center">
      <div className="bg-white w-[500px] h-[600px] shadow-lg rounded-lg flex flex-col justify-center items-center">
        <div className="text-4xl font-extrabold">
          Welcome {isSignInPage && "Back"}
        </div>
        <div className="text-xl font-light mb-14">
          {isSignInPage
            ? "Sign in to get explored"
            : "Sign up now to get started !"}
        </div>
        <form
          className="flex flex-col items-center justify-center w-[75%]"
          onSubmit={handleOnSubmit}
        >
          {!isSignInPage && (
            <Input
              label="Full Name"
              name="Name"
              placeholder="enter Your Full Name"
              className="mb-6"
              value={data.fullName}
              onChange={(e) =>
                setData({ ...data, fullName: e.target.value })
              }
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
          {isSignInPage ? "Didn't have an account" : "Already have an account?"}{" "}
          <span
            className="text-primary cursor-pointer underline"
            onClick={() =>
              navigate(`/users/${isSignInPage ? "sign_up" : "sign_in"}`)
            }
          >
            {isSignInPage ? "Sign up" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Form;
