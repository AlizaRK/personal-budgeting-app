import { useState } from "react";
import { Account } from "../types";

// TODO: Define proper types for form
export const useCreateRecord = (accounts: Account[], refetch: () => void) => {
  const [loading, setLoading] = useState(false);

  const create = async (form: any) => {
    // move ALL logic here
  };

  return { create, loading };
};