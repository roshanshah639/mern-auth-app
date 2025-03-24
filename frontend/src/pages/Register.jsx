import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { Loader2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
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
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/register`,
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
        navigate("/verify-account");
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
          Register to start your journey!
        </p>

        <input
          type="text"
          name="name"
          placeholder="Name: e.g John Doe"
          required
          className="w-full text-slate-600 p-2 border border-slate-400 rounded mb-6 placeholder:text-slate-500 focus:outline-none"
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email: e.g. name@company.com"
          required
          className="w-full text-slate-600 p-2 border border-slate-400 rounded mb-6 placeholder:text-slate-500 focus:outline-none"
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="phoneNumber"
          placeholder="Phone Number: e.g. 9811223344"
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
                <Loader2 className="inline-block h-5 w-5 animate-spin mr-2" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </div>

        <div className="flex items-center justify-center mt-3">
          <p className="text-sm text-slate-600">
            Already have an account ?
            <Link className="text-indigo-700 pl-1 text-sm" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
