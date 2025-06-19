import SignupForm from "@/components/common/SignupForm.tsx";
import LoginForm from "@/components/common/LoginForm.tsx";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

interface AuthLayoutProps {
  isLogin?: boolean;
}

export default function AuthLayout({ isLogin = false }: AuthLayoutProps) {
  const tabTriggerData = ["user", "hospital", "organization"];
  const [current, setCurrent] = useState(tabTriggerData[0]);

  return (
    <div className="relative bg-white/20 backdrop-blur-2xl border border-white/20 p-8 shadow-2xl rounded-2xl w-fit max-w-2xl">
      <h2 className="text-2xl font-bold mb-8 text-white text-center">
        {isLogin ? "Login" : "Create an Account"}
      </h2>
      {isLogin ? (
        <LoginForm />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex justify-between gap-4 w-full">
            {tabTriggerData.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrent(item)}
                className={`w-full h-12 text-lg shadow-even-2xl rounded-lg transition-all
                  ${
                    current === item
                      ? "bg-primary-magenta text-white"
                      : "bg-white text-primary-magenta hover:bg-primary-magenta/10"
                  }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-full">
            <SignupForm userType={current} isLogin={false} />
          </div>
        </div>
      )}{" "}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center space-x-4 text-white/90 text-sm">
        <Link to="/terms" className="hover:text-white">
          Terms
        </Link>
        <span>•</span>
        <Link to="/privacy" className="hover:text-white">
          Privacy
        </Link>
        <span>•</span>
        <Link to="/" className="hover:text-white">
          Home
        </Link>
      </div>
    </div>
  );
}
