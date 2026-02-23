"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type FieldMap = Record<string, number | number[]>;

type ClaimContextType = {
  uploadId: string | null;
  fieldMap: FieldMap;
  setUploadId: (id: string | null) => void;
  setFieldMap: (map: FieldMap) => void;
  setFieldMapping: (key: string, value: number | number[]) => void;
};

const STORAGE_KEY = "claim-generator-ui";
const SEMANTIC_KEYS = [
  "employeeName",
  "employeeId",
  "phone",
  "address",
  "city",
  "dateOfBirth",
  "state",
  "zipCode",
  "ssn",
  "jobTitle",
  "checkbox1",
  "checkbox2",
  "checkbox3",
] as const;

const defaultFieldMap: FieldMap = {};

const ClaimContext = createContext<ClaimContextType | null>(null);

export function ClaimProvider({ children }: { children: React.ReactNode }) {
  const [uploadId, setUploadIdState] = useState<string | null>(null);
  const [fieldMap, setFieldMapState] = useState<FieldMap>(defaultFieldMap);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.uploadId) setUploadIdState(data.uploadId);
        if (data.fieldMap && typeof data.fieldMap === "object") setFieldMapState({ ...defaultFieldMap, ...data.fieldMap });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ uploadId, fieldMap })
      );
    } catch {
      // ignore
    }
  }, [uploadId, fieldMap]);

  const setUploadId = useCallback((id: string | null) => {
    setUploadIdState(id);
  }, []);

  const setFieldMap = useCallback((map: FieldMap) => {
    setFieldMapState(map);
  }, []);

  const setFieldMapping = useCallback((key: string, value: number | number[]) => {
    setFieldMapState((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <ClaimContext.Provider
      value={{
        uploadId,
        fieldMap,
        setUploadId,
        setFieldMap,
        setFieldMapping,
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  const ctx = useContext(ClaimContext);
  if (!ctx) throw new Error("useClaim must be used within ClaimProvider");
  return ctx;
}

export { SEMANTIC_KEYS };
