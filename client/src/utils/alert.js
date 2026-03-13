import toast from "react-hot-toast";

const toastBase = {
  duration: 3500,
  style: {
    borderRadius: "14px",
    border: "1px solid #d1fae5",
    padding: "12px 14px",
    background: "linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%)",
    color: "#0f172a",
    boxShadow: "0 10px 30px rgba(2, 6, 23, 0.14)",
    fontWeight: 500,
    maxWidth: "460px",
  },
};

export const showSuccess = (message = "Operation successful") => {
  toast.success(message, {
    ...toastBase,
    iconTheme: {
      primary: "#16a34a",
      secondary: "#f0fdf4",
    },
  });
};

export const showError = (message = "Something went wrong") => {
  toast.error(message, {
    ...toastBase,
    duration: 4200,
    style: {
      ...toastBase.style,
      border: "1px solid #fecaca",
      background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)",
    },
    iconTheme: {
      primary: "#dc2626",
      secondary: "#fff1f2",
    },
  });
};

export const showWarning = (message = "Please review this action") => {
  toast(message, {
    ...toastBase,
    icon: "⚠️",
    duration: 4000,
    style: {
      ...toastBase.style,
      border: "1px solid #fcd34d",
      background: "linear-gradient(135deg, #fffbeb 0%, #fefce8 100%)",
    },
  });
};

export const showInfo = (message = "Heads up") => {
  toast(message, {
    ...toastBase,
    icon: "ℹ️",
  });
};

export const showConfirm = async (message) => window.confirm(message);

export const showLoading = (message = "Please wait...") =>
  toast.loading(message, {
    ...toastBase,
    duration: Infinity,
  });

export const closeAlert = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
    return;
  }

  toast.dismiss();
};
