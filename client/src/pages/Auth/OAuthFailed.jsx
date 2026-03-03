import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthFailed = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const message = params.get("message");

  return (
    <div className="h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Login Failed</h1>

        <p className="text-gray-700">{message || "Something went wrong"}</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default OAuthFailed;
