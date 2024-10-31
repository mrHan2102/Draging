import { Toaster, toast } from 'react-hot-toast';

const Toast = () => {
  return <Toaster position="top-right" reverseOrder={false} />;
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    style: {
      border: '1px solid #4CAF50',
      padding: '16px',
      color: '#4CAF50',
    },
    iconTheme: {
      primary: '#4CAF50',
      secondary: '#FFFAEE',
    },
  });
};

export const showFailToast = (message: string) => {
    toast.error(message);
  };

export default Toast;