import { useState, useEffect, useCallback } from "react";

export function useSettingsStore() {
  const [appName, setAppNameState] = useState<string>(() => {
    return localStorage.getItem("app_name") || "VenueKeeper Tesis & Salon İşletim Otomasyonu";
  });

  const [institutionName, setInstitutionNameState] = useState<string>(() => {
    return localStorage.getItem("institution_name") || "BELEDİYE & KURUMSAL BAŞKANLIK";
  });

  const [institutionSubHeader, setInstitutionSubHeaderState] = useState<string>(() => {
    return localStorage.getItem("institution_subheader") || "Kültür ve Sosyal İşler Dairesi / Tesis İşletme Müdürlüğü";
  });

  const [institutionLogo, setInstitutionLogoState] = useState<string>(() => {
    return localStorage.getItem("institution_logo") || "";
  });

  const [institutionPhone, setInstitutionPhoneState] = useState<string>(() => {
    return localStorage.getItem("institution_phone") || "0850 000 00 00";
  });

  const [institutionEmail, setInstitutionEmailState] = useState<string>(() => {
    return localStorage.getItem("institution_email") || "info@kurum.bel.tr";
  });

  const [institutionWebsite, setInstitutionWebsiteState] = useState<string>(() => {
    return localStorage.getItem("institution_website") || "www.kurum.bel.tr";
  });

  const [institutionKepAddress, setInstitutionKepAddressState] = useState<string>(() => {
    return localStorage.getItem("institution_kep_address") || "kurumbelediyesi@hs01.kep.tr";
  });

  const [institutionAddress, setInstitutionAddressState] = useState<string>(() => {
    return localStorage.getItem("institution_address") || "Belediye Hizmet Binası, Merkez";
  });

  const [defaultTariffBasis, setDefaultTariffBasisState] = useState<string>(() => {
    return (
      localStorage.getItem("default_tariff_basis") ||
      ""
    );
  });

  // Load settings from SQLite Database
  const loadDbSettings = useCallback(async () => {
    try {
      if (window.electronAPI?.db?.getAllSettings) {
        const settings = await window.electronAPI.db.getAllSettings();
        if (settings) {
          if (settings.app_name) {
            setAppNameState(settings.app_name);
            localStorage.setItem("app_name", settings.app_name);
          }
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
          if (settings.institution_phone) {
            setInstitutionPhoneState(settings.institution_phone);
            localStorage.setItem("institution_phone", settings.institution_phone);
          }
          if (settings.institution_email) {
            setInstitutionEmailState(settings.institution_email);
            localStorage.setItem("institution_email", settings.institution_email);
          }
          if (settings.institution_website) {
            setInstitutionWebsiteState(settings.institution_website);
            localStorage.setItem("institution_website", settings.institution_website);
          }
          if (settings.institution_kep_address) {
            setInstitutionKepAddressState(settings.institution_kep_address);
            localStorage.setItem("institution_kep_address", settings.institution_kep_address);
          }
          if (settings.institution_address) {
            setInstitutionAddressState(settings.institution_address);
            localStorage.setItem("institution_address", settings.institution_address);
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

  const setInstitutionPhone = async (phone: string) => {
    setInstitutionPhoneState(phone);
    localStorage.setItem("institution_phone", phone);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("institution_phone", phone);
      }
    } catch (err) {
      console.error("Failed to save institution_phone to SQLite:", err);
    }
  };

  const setInstitutionEmail = async (email: string) => {
    setInstitutionEmailState(email);
    localStorage.setItem("institution_email", email);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("institution_email", email);
      }
    } catch (err) {
      console.error("Failed to save institution_email to SQLite:", err);
    }
  };

  const setInstitutionWebsite = async (website: string) => {
    setInstitutionWebsiteState(website);
    localStorage.setItem("institution_website", website);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("institution_website", website);
      }
    } catch (err) {
      console.error("Failed to save institution_website to SQLite:", err);
    }
  };

  const setInstitutionKepAddress = async (kep: string) => {
    setInstitutionKepAddressState(kep);
    localStorage.setItem("institution_kep_address", kep);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("institution_kep_address", kep);
      }
    } catch (err) {
      console.error("Failed to save institution_kep_address to SQLite:", err);
    }
  };

  const setInstitutionAddress = async (addr: string) => {
    setInstitutionAddressState(addr);
    localStorage.setItem("institution_address", addr);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("institution_address", addr);
      }
    } catch (err) {
      console.error("Failed to save institution_address to SQLite:", err);
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

  const setAppName = async (name: string) => {
    setAppNameState(name);
    localStorage.setItem("app_name", name);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("app_name", name);
      }
    } catch (err) {
      console.error("Failed to save app_name to SQLite:", err);
    }
  };

  return {
    appName,
    institutionName,
    institutionSubHeader,
    institutionLogo,
    institutionPhone,
    institutionEmail,
    institutionWebsite,
    institutionKepAddress,
    institutionAddress,
    defaultTariffBasis,
    setAppName,
    setInstitutionName,
    setInstitutionSubHeader,
    setInstitutionLogo,
    setInstitutionPhone,
    setInstitutionEmail,
    setInstitutionWebsite,
    setInstitutionKepAddress,
    setInstitutionAddress,
    setDefaultTariffBasis,
    reloadSettings: loadDbSettings,
  };
}
