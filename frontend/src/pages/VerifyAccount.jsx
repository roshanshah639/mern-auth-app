import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const VerifyAccount = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState({
    verificationCode: "",
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
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/verify-account`,
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
        navigate("/login");
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

        <p className="text-xs text-slate-500 mb-8 text-center">
          Enter the Verification Code sent to your email
        </p>

        <input
          type="text"
          name="verificationCode"
          placeholder="Verification Code: e.g. 123456 "
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
                Verifying Account...
              </>
            ) : (
              "Verify Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
