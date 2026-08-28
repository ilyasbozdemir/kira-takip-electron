import { useState, useEffect, useCallback } from "react";

export function useSettingsStore() {
  const [institutionName, setInstitutionNameState] = useState<string>(() => {
    return localStorage.getItem("institution_name") || "BELEDİYE & KURUMSAL BAŞKANLIK";
  });

  const [institutionSubHeader, setInstitutionSubHeaderState] = useState<string>(() => {
    return localStorage.getItem("institution_subheader") || "Kültür ve Sosyal İşler Dairesi / Tesis İşletme Müdürlüğü";
  });

  const [institutionLogo, setInstitutionLogoState] = useState<string>(() => {
    return localStorage.getItem("institution_logo") || "";
  });

  const [defaultTariffBasis, setDefaultTariffBasisState] = useState<string>(() => {
    return (
      localStorage.getItem("default_tariff_basis") ||
      "Belediye Encümeni Kararı: 15/01/2026 - Karar No: 42 (2464 Sayılı Kanun Md. 97)"
    );
  });

  // Load settings from SQLite Database
  const loadDbSettings = useCallback(async () => {
    try {
      if (window.electronAPI?.db?.getAllSettings) {
        const settings = await window.electronAPI.db.getAllSettings();
        if (settings) {
          if (settings.institution_name) {
            setInstitutionNameState(settings.institution_name);
            localStorage.setItem("institution_name", settings.institution_name);
          }
          if (settings.institution_subheader) {
            setInstitutionSubHeaderState(settings.institution_subheader);
            localStorage.setItem("institution_subheader", settings.institution_subheader);
          }
          if (settings.institution_logo) {
            setInstitutionLogoState(settings.institution_logo);
            localStorage.setItem("institution_logo", settings.institution_logo);
          }
          if (settings.default_tariff_basis) {
            setDefaultTariffBasisState(settings.default_tariff_basis);
            localStorage.setItem("default_tariff_basis", settings.default_tariff_basis);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load settings from SQLite db:", err);
    }
  }, []);

  useEffect(() => {
    loadDbSettings();

    if (window.electronAPI?.onDbUpdated) {
      const unsub = window.electronAPI.onDbUpdated(() => {
        loadDbSettings();
      });
      return () => {
        unsub();
      };
    }
  }, [loadDbSettings]);

  const setInstitutionName = async (name: string) => {
    setInstitutionNameState(name);
    localStorage.setItem("institution_name", name);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("institution_name", name);
      }
    } catch (err) {
      console.error("Failed to save institution_name to SQLite:", err);
    }
  };

  const setInstitutionSubHeader = async (subHeader: string) => {
    setInstitutionSubHeaderState(subHeader);
    localStorage.setItem("institution_subheader", subHeader);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("institution_subheader", subHeader);
      }
    } catch (err) {
      console.error("Failed to save institution_subheader to SQLite:", err);
    }
  };

  const setInstitutionLogo = async (logo: string) => {
    setInstitutionLogoState(logo);
    localStorage.setItem("institution_logo", logo);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("institution_logo", logo);
      }
    } catch (err) {
      console.error("Failed to save institution_logo to SQLite:", err);
    }
  };

  const setDefaultTariffBasis = async (basis: string) => {
    setDefaultTariffBasisState(basis);
    localStorage.setItem("default_tariff_basis", basis);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("default_tariff_basis", basis);
      }
    } catch (err) {
      console.error("Failed to save default_tariff_basis to SQLite:", err);
    }
  };

  return {
    institutionName,
    institutionSubHeader,
    institutionLogo,
    defaultTariffBasis,
    setInstitutionName,
    setInstitutionSubHeader,
    setInstitutionLogo,
    setDefaultTariffBasis,
    reloadSettings: loadDbSettings,
  };
}
