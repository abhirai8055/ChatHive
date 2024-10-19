import { useState } from "react";
import Button from "../../components/button/index";
import Input from "../../components/input/index";
import { useNavigate } from 'react-router-dom';

const Form = ({
    isSignInPage = true,
}) => {
    const [data, setData] = useState({
        ...(!isSignInPage && {
            fullName: ''
        }),
        email: '',
        password: ''
    });
    const [isGuest, setIsGuest] = useState(false);
    const [guestName, setGuestName] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isGuest) {
            // Handle guest login
            localStorage.setItem('user:token', 'guest-token'); // Example token for guest
            localStorage.setItem('user:detail', JSON.stringify({
                id: 'guest-id',
                fullName: guestName,
                email: 'guest@example.com',
            }));
            navigate('/');
            return;
        }

        try {
            const res = await fetch(`http://localhost:9000/user/${isSignInPage ? 'login' : 'signUp'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (res.status === 400) {
                alert('Invalid credentials');
            } else {
                const resData = await res.json();
                if (resData.token) {
                    localStorage.setItem('user:token', resData.token);
                    localStorage.setItem('user:detail', JSON.stringify({
                        id: resData.id,
                        fullName: resData.name,
                        email: resData.email,
                    }));
                    navigate('/');
                } else {
                    if (!isSignInPage) {
                        alert('Sign up successful! Redirecting to sign in...');
                        navigate('/users/sign_in');
                    } else {
                        alert('An error occurred. Please try again.');
                    }
                }
            }
        } catch (error) {
            console.error("Error during form submission:", error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="bg-blue-50 h-screen flex items-center justify-center">
            <div className="bg-white w-[400px] sm:w-[500px] h-auto p-8 shadow-lg rounded-lg flex flex-col justify-center items-center">
                <div className="text-3xl font-extrabold text-blue-600">Welcome {isSignInPage && 'Back'}</div>
                <div className="text-lg font-light mb-8 text-gray-600">{isSignInPage ? 'Sign in to continue' : 'Create your account'}</div>
                <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
                    {!isSignInPage && 
                        <Input 
                            label="Full Name" 
                            name="fullName" 
                            placeholder="Enter your full name" 
                            className="mb-6 w-full" 
                            value={data.fullName} 
                            onChange={(e) => setData({ ...data, fullName: e.target.value })} 
                        /> 
                    }
                    <Input 
                        label="Email Address" 
                        type="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        className="mb-6 w-full" 
                        value={data.email} 
                        onChange={(e) => setData({ ...data, email: e.target.value })} 
                    />
                    <Input 
                        label="Password" 
                        type="password" 
                        name="password" 
                        placeholder="Enter your password" 
                        className="mb-8 w-full" 
                        value={data.password} 
                        onChange={(e) => setData({ ...data, password: e.target.value })} 
                    />
                    <Button 
                        label={isSignInPage ? 'Sign In' : 'Sign Up'} 
                        type='submit' 
                        className="w-[75%] mb-4 bg-blue-600 hover:bg-blue-700 text-white" 
                    />
                </form>
                <div className="text-gray-600">
                    {isSignInPage ? "Don't have an account?" : "Already have an account?"} 
                    <span 
                        className="text-blue-600 cursor-pointer underline ml-1" 
                        onClick={() => navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)}
                    >
                        {isSignInPage ? 'Sign Up' : 'Sign In'}
                    </span>
                </div>
                {/* Guest Login Button */}
                <div className="mt-4">
                    <button
                        className="text-blue-600 underline cursor-pointer"
                        onClick={() => setIsGuest(true)}
                    >
                        Continue as Guest
                    </button>
                </div>
                {/* Guest Name Input Modal */}
                {isGuest && (
                    <div className="mt-4">
                        <Input
                            label="Guest Name"
                            name="guestName"
                            placeholder="Enter your name"
                            className="mb-6 w-full"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                        <Button
                            label="Confirm Guest"
                            type='button'
                            className="w-[75%] mb-4 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSubmit} // Reuse handleSubmit for guest
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Form;
