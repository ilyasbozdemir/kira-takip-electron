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

  const [defaultCity, setDefaultCityState] = useState<string>(() => {
    return localStorage.getItem("default_city") || "Ankara";
  });

  const [defaultDistrict, setDefaultDistrictState] = useState<string>(() => {
    return localStorage.getItem("default_district") || "Çankaya";
  });

  const [defaultTariffBasis, setDefaultTariffBasisState] = useState<string>(() => {
    return (
      localStorage.getItem("default_tariff_basis") ||
      ""
    );
  });

  const [accountingModuleEnabled, setAccountingModuleEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem("accounting_module_enabled");
    return val === null ? true : val === "true";
  });

  const [workingYear, setWorkingYearState] = useState<string>(() => {
    return localStorage.getItem("working_year") || String(new Date().getFullYear());
  });

  const [securityPin, setSecurityPinState] = useState<string>(() => {
    return localStorage.getItem("security_pin") || "";
  });

  const [authorizedPersonnelName, setAuthorizedPersonnelNameState] = useState<string>(() => {
    return localStorage.getItem("authorized_personnel_name") || "";
  });

  const [authorizedPersonnelTitle, setAuthorizedPersonnelTitleState] = useState<string>(() => {
    return localStorage.getItem("authorized_personnel_title") || "Tesis & İşletme Yetkilisi";
  });

  // Load settings from SQLite Database
  const loadDbSettings = useCallback(async () => {
    try {
      if (window.electronAPI?.db?.getAllSettings) {
        const settings = await window.electronAPI.db.getAllSettings();
        if (settings) {
          if (settings.app_name !== undefined && settings.app_name !== null) {
            setAppNameState(settings.app_name);
            localStorage.setItem("app_name", settings.app_name);
          }
          if (settings.institution_name !== undefined && settings.institution_name !== null) {
            setInstitutionNameState(settings.institution_name);
            localStorage.setItem("institution_name", settings.institution_name);
          }
          if (settings.institution_subheader !== undefined && settings.institution_subheader !== null) {
            setInstitutionSubHeaderState(settings.institution_subheader);
            localStorage.setItem("institution_subheader", settings.institution_subheader);
          }
          if (settings.institution_logo !== undefined && settings.institution_logo !== null) {
            setInstitutionLogoState(settings.institution_logo);
            localStorage.setItem("institution_logo", settings.institution_logo);
          }
          if (settings.institution_phone !== undefined && settings.institution_phone !== null) {
            setInstitutionPhoneState(settings.institution_phone);
            localStorage.setItem("institution_phone", settings.institution_phone);
          }
          if (settings.institution_email !== undefined && settings.institution_email !== null) {
            setInstitutionEmailState(settings.institution_email);
            localStorage.setItem("institution_email", settings.institution_email);
          }
          if (settings.institution_website !== undefined && settings.institution_website !== null) {
            setInstitutionWebsiteState(settings.institution_website);
            localStorage.setItem("institution_website", settings.institution_website);
          }
          if (settings.institution_kep_address !== undefined && settings.institution_kep_address !== null) {
            setInstitutionKepAddressState(settings.institution_kep_address);
            localStorage.setItem("institution_kep_address", settings.institution_kep_address);
          }
          if (settings.institution_address !== undefined && settings.institution_address !== null) {
            setInstitutionAddressState(settings.institution_address);
            localStorage.setItem("institution_address", settings.institution_address);
          }
          if (settings.default_city !== undefined && settings.default_city !== null) {
            setDefaultCityState(settings.default_city);
            localStorage.setItem("default_city", settings.default_city);
          }
          if (settings.default_district !== undefined && settings.default_district !== null) {
            setDefaultDistrictState(settings.default_district);
            localStorage.setItem("default_district", settings.default_district);
          }
          if (settings.default_tariff_basis !== undefined && settings.default_tariff_basis !== null) {
            setDefaultTariffBasisState(settings.default_tariff_basis);
            localStorage.setItem("default_tariff_basis", settings.default_tariff_basis);
          }
          if (settings.accounting_module_enabled !== undefined && settings.accounting_module_enabled !== null) {
            const isEnabled = settings.accounting_module_enabled === "true";
            setAccountingModuleEnabledState(isEnabled);
            localStorage.setItem("accounting_module_enabled", String(isEnabled));
          }
          if (settings.working_year !== undefined && settings.working_year !== null) {
            setWorkingYearState(settings.working_year);
            localStorage.setItem("working_year", settings.working_year);
          }
          if (settings.security_pin !== undefined && settings.security_pin !== null) {
            setSecurityPinState(settings.security_pin);
            localStorage.setItem("security_pin", settings.security_pin);
          }
          if (settings.authorized_personnel_name !== undefined && settings.authorized_personnel_name !== null) {
            setAuthorizedPersonnelNameState(settings.authorized_personnel_name);
            localStorage.setItem("authorized_personnel_name", settings.authorized_personnel_name);
          }
          if (settings.authorized_personnel_title !== undefined && settings.authorized_personnel_title !== null) {
            setAuthorizedPersonnelTitleState(settings.authorized_personnel_title);
            localStorage.setItem("authorized_personnel_title", settings.authorized_personnel_title);
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

  const setDefaultCity = async (city: string) => {
    setDefaultCityState(city);
    localStorage.setItem("default_city", city);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("default_city", city);
      }
    } catch (err) {
      console.error("Failed to save default_city to SQLite:", err);
    }
  };

  const setDefaultDistrict = async (dist: string) => {
    setDefaultDistrictState(dist);
    localStorage.setItem("default_district", dist);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("default_district", dist);
      }
    } catch (err) {
      console.error("Failed to save default_district to SQLite:", err);
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

  const setAccountingModuleEnabled = async (enabled: boolean) => {
    setAccountingModuleEnabledState(enabled);
    localStorage.setItem("accounting_module_enabled", String(enabled));
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("accounting_module_enabled", String(enabled));
      }
    } catch (err) {
      console.error("Failed to save accounting_module_enabled to SQLite:", err);
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

  const setWorkingYear = async (year: string) => {
    setWorkingYearState(year);
    localStorage.setItem("working_year", year);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("working_year", year);
      }
    } catch (err) {
      console.error("Failed to save working_year to SQLite:", err);
    }
  };

  const setSecurityPin = async (pin: string) => {
    setSecurityPinState(pin);
    localStorage.setItem("security_pin", pin);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("security_pin", pin);
      }
    } catch (err) {
      console.error("Failed to save security_pin to SQLite:", err);
    }
  };

  const setAuthorizedPersonnelName = async (name: string) => {
    setAuthorizedPersonnelNameState(name);
    localStorage.setItem("authorized_personnel_name", name);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("authorized_personnel_name", name);
      }
    } catch (err) {
      console.error("Failed to save authorized_personnel_name to SQLite:", err);
    }
  };

  const setAuthorizedPersonnelTitle = async (title: string) => {
    setAuthorizedPersonnelTitleState(title);
    localStorage.setItem("authorized_personnel_title", title);
    try {
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("authorized_personnel_title", title);
      }
    } catch (err) {
      console.error("Failed to save authorized_personnel_title to SQLite:", err);
    }
  };

  const saveSettingsBulk = async (updates: Partial<{
    appName: string;
    institutionName: string;
    institutionSubHeader: string;
    institutionLogo: string;
    institutionPhone: string;
    institutionEmail: string;
    institutionWebsite: string;
    institutionKepAddress: string;
    institutionAddress: string;
    defaultCity: string;
    defaultDistrict: string;
    defaultTariffBasis: string;
    accountingModuleEnabled: boolean;
    workingYear: string;
    securityPin: string;
    authorizedPersonnelName: string;
    authorizedPersonnelTitle: string;
  }>) => {
    const dbPayload: Record<string, string> = {};

    if (updates.appName !== undefined) {
      setAppNameState(updates.appName);
      localStorage.setItem("app_name", updates.appName);
      dbPayload["app_name"] = updates.appName;
    }
    if (updates.institutionName !== undefined) {
      setInstitutionNameState(updates.institutionName);
      localStorage.setItem("institution_name", updates.institutionName);
      dbPayload["institution_name"] = updates.institutionName;
    }
    if (updates.institutionSubHeader !== undefined) {
      setInstitutionSubHeaderState(updates.institutionSubHeader);
      localStorage.setItem("institution_subheader", updates.institutionSubHeader);
      dbPayload["institution_subheader"] = updates.institutionSubHeader;
    }
    if (updates.institutionLogo !== undefined) {
      setInstitutionLogoState(updates.institutionLogo);
      localStorage.setItem("institution_logo", updates.institutionLogo);
      dbPayload["institution_logo"] = updates.institutionLogo;
    }
    if (updates.institutionPhone !== undefined) {
      setInstitutionPhoneState(updates.institutionPhone);
      localStorage.setItem("institution_phone", updates.institutionPhone);
      dbPayload["institution_phone"] = updates.institutionPhone;
    }
    if (updates.institutionEmail !== undefined) {
      setInstitutionEmailState(updates.institutionEmail);
      localStorage.setItem("institution_email", updates.institutionEmail);
      dbPayload["institution_email"] = updates.institutionEmail;
    }
    if (updates.institutionWebsite !== undefined) {
      setInstitutionWebsiteState(updates.institutionWebsite);
      localStorage.setItem("institution_website", updates.institutionWebsite);
      dbPayload["institution_website"] = updates.institutionWebsite;
    }
    if (updates.institutionKepAddress !== undefined) {
      setInstitutionKepAddressState(updates.institutionKepAddress);
      localStorage.setItem("institution_kep_address", updates.institutionKepAddress);
      dbPayload["institution_kep_address"] = updates.institutionKepAddress;
    }
    if (updates.institutionAddress !== undefined) {
      setInstitutionAddressState(updates.institutionAddress);
      localStorage.setItem("institution_address", updates.institutionAddress);
      dbPayload["institution_address"] = updates.institutionAddress;
    }
    if (updates.defaultCity !== undefined) {
      setDefaultCityState(updates.defaultCity);
      localStorage.setItem("default_city", updates.defaultCity);
      dbPayload["default_city"] = updates.defaultCity;
    }
    if (updates.defaultDistrict !== undefined) {
      setDefaultDistrictState(updates.defaultDistrict);
      localStorage.setItem("default_district", updates.defaultDistrict);
      dbPayload["default_district"] = updates.defaultDistrict;
    }
    if (updates.defaultTariffBasis !== undefined) {
      setDefaultTariffBasisState(updates.defaultTariffBasis);
      localStorage.setItem("default_tariff_basis", updates.defaultTariffBasis);
      dbPayload["default_tariff_basis"] = updates.defaultTariffBasis;
    }
    if (updates.accountingModuleEnabled !== undefined) {
      setAccountingModuleEnabledState(updates.accountingModuleEnabled);
      localStorage.setItem("accounting_module_enabled", String(updates.accountingModuleEnabled));
      dbPayload["accounting_module_enabled"] = String(updates.accountingModuleEnabled);
    }
    if (updates.workingYear !== undefined) {
      setWorkingYearState(updates.workingYear);
      localStorage.setItem("working_year", updates.workingYear);
      dbPayload["working_year"] = updates.workingYear;
    }
    if (updates.securityPin !== undefined) {
      setSecurityPinState(updates.securityPin);
      localStorage.setItem("security_pin", updates.securityPin);
      dbPayload["security_pin"] = updates.securityPin;
    }
    if (updates.authorizedPersonnelName !== undefined) {
      setAuthorizedPersonnelNameState(updates.authorizedPersonnelName);
      localStorage.setItem("authorized_personnel_name", updates.authorizedPersonnelName);
      dbPayload["authorized_personnel_name"] = updates.authorizedPersonnelName;
    }
    if (updates.authorizedPersonnelTitle !== undefined) {
      setAuthorizedPersonnelTitleState(updates.authorizedPersonnelTitle);
      localStorage.setItem("authorized_personnel_title", updates.authorizedPersonnelTitle);
      dbPayload["authorized_personnel_title"] = updates.authorizedPersonnelTitle;
    }

    try {
      if (Object.keys(dbPayload).length > 0) {
        if (window.electronAPI?.db?.setSettingsBulk) {
          await window.electronAPI.db.setSettingsBulk(dbPayload);
        } else if (window.electronAPI?.db?.setSetting) {
          for (const [k, v] of Object.entries(dbPayload)) {
            await window.electronAPI.db.setSetting(k, v);
          }
        }
      }
    } catch (err) {
      console.error("Failed to save bulk settings to SQLite:", err);
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
    defaultCity,
    defaultDistrict,
    defaultTariffBasis,
    accountingModuleEnabled,
    workingYear,
    securityPin,
    authorizedPersonnelName,
    authorizedPersonnelTitle,
    setAppName,
    setInstitutionName,
    setInstitutionSubHeader,
    setInstitutionLogo,
    setInstitutionPhone,
    setInstitutionEmail,
    setInstitutionWebsite,
    setInstitutionKepAddress,
    setInstitutionAddress,
    setDefaultCity,
    setDefaultDistrict,
    setDefaultTariffBasis,
    setAccountingModuleEnabled,
    setWorkingYear,
    setSecurityPin,
    setAuthorizedPersonnelName,
    setAuthorizedPersonnelTitle,
    saveSettingsBulk,
    reloadSettings: loadDbSettings,
  };
}
