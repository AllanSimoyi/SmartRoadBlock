import { useContext } from "react";
import { createContext, useState } from "react";

interface ContextProps {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_UPLOAD_RESET: string;
}

export const CloudinaryContext = createContext<ContextProps | undefined>(undefined);

interface Props {
  children: React.ReactNode;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_UPLOAD_RESET: string;
}

export function CloudinaryContextProvider (props: Props) {
  const { children, ...restOfProps } = props;
  const [state] = useState(restOfProps);
  return (
    <CloudinaryContext.Provider value={state}>
      {children}
    </CloudinaryContext.Provider>
  )
}

export function useCloudinary () {
  const context = useContext(CloudinaryContext);
  if (!context) {
    throw new Error(`useCloudinary must be used within a CloudinaryContextProvider`);
  }
  return context;
}