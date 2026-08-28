import { useState, useEffect } from "react";

export function useSettingsStore() {
  const [institutionName, setInstitutionNameState] = useState<string>(() => {
    return localStorage.getItem("institution_name") || "T.C. BELEDİYE BAŞKANLIĞI";
  });

  const [institutionLogo, setInstitutionLogoState] = useState<string>(() => {
    return localStorage.getItem("institution_logo") || "";
  });

  const [defaultTariffBasis, setDefaultTariffBasisState] = useState<string>(() => {
    return localStorage.getItem("default_tariff_basis") || "Belediye Encümeni Kararı: 15/01/2026 - Karar No: 42 (2464 Sayılı Kanun Md. 97)";
  });

  const setInstitutionName = (name: string) => {
    setInstitutionNameState(name);
    localStorage.setItem("institution_name", name);
  };

  const setInstitutionLogo = (logo: string) => {
    setInstitutionLogoState(logo);
    localStorage.setItem("institution_logo", logo);
  };

  const setDefaultTariffBasis = (basis: string) => {
    setDefaultTariffBasisState(basis);
    localStorage.setItem("default_tariff_basis", basis);
  };

  return {
    institutionName,
    institutionLogo,
    defaultTariffBasis,
    setInstitutionName,
    setInstitutionLogo,
    setDefaultTariffBasis,
  };
}
