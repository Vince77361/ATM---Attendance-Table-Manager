import { useState } from "react";

export const useInput = () => {
  const [value, setValue] = useState("");
  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value.trimStart());
  };
  const clearValue = () => {
    setValue("");
  };
  return { value, changeValue, clearValue };
};
