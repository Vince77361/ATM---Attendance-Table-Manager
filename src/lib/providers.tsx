import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            backgroundColor: "#fff",
            color: "black",
          },
          duration: 3000,
        }}
      />
    </>
  );
};

const Providers = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <>
      <ToasterProvider />
      {children}
    </>
  );
};

export default Providers;
