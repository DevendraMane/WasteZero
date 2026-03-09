import Swal from "sweetalert2";

const baseConfig = {
  confirmButtonColor: "#16a34a",
  background: "#ffffff",
  color: "#333",
};

export const showSuccess = (message = "Operation successful") => {
  Swal.fire({
    ...baseConfig,
    icon: "success",
    title: "Success",
    text: message,
  });
};

export const showError = (message = "Something went wrong") => {
  Swal.fire({
    ...baseConfig,
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonColor: "#dc2626",
  });
};

export const showWarning = (message) => {
  Swal.fire({
    ...baseConfig,
    icon: "warning",
    title: "Warning",
    text: message,
    confirmButtonColor: "#f59e0b",
  });
};

export const showInfo = (message) => {
  Swal.fire({
    ...baseConfig,
    icon: "info",
    title: "Info",
    text: message,
  });
};

export const showConfirm = async (message) => {
  return Swal.fire({
    ...baseConfig,
    icon: "question",
    title: "Are you sure?",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
  });
};

export const showLoading = (message = "Please wait...") => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeAlert = () => {
  Swal.close();
};
