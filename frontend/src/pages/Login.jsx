import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response?.data?.success) {
        toast.success(response?.data?.message);

        // navigate to verify account
        navigate("/");
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="w-80 xs:w-96 bg-rose-100 shadow-md px-6 py-8 rounded">
        <h2 className="text-slate-600 text-xl font-semibold mb-4 text-center">
          MERN Stack App
        </h2>

        <p className="text-sm text-slate-500 mb-8 text-center">
          Login to start your journey!
        </p>

        <input
          type="email"
          name="email"
          placeholder="Email: e.g. name@company.com"
          required
          className="w-full text-slate-600 p-2 border border-slate-400 rounded mb-6 placeholder:text-slate-500 focus:outline-none"
          onChange={handleInputChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password: e.g. ********"
          required
          className="w-full text-slate-600 p-2 border border-slate-400 rounded mb-6 placeholder:text-slate-500 focus:outline-none"
          onChange={handleInputChange}
        />

        <div className="flex items-center justify-center mb-4">
          <button
            disabled={isLoading}
            className="bg-[crimson] text-white px-8 py-1 rounded hover:bg-[#dc143cd2] transition-all duration-300 cursor-pointer"
            onClick={handleFormSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin inline-block h-5 w-5 mr-2" />
                Logging In...
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>

        <div className="flex items-center justify-center mt-8 mb-4">
          <Link to="/password-reset" className="text-indigo-900 pl-1 text-sm">
            Forgot password?
          </Link>
        </div>
        <div className="flex items-center justify-center mt-3">
          <p className="text-sm text-slate-600">
            Don't have an account ?
            <Link className="text-indigo-700 pl-1 text-sm" to="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
