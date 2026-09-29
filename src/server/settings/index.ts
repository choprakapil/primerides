import "server-only";
import fs from "fs";
import path from "path";
import {
  ExtendedSiteSettings,
  HeaderConfig,
  FooterConfig,
  NotificationSettings,
  HomepageConfig,
  AboutConfig,
  PoliciesConfig,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_HOMEPAGE_CONFIG,
  DEFAULT_ABOUT_CONFIG,
  DEFAULT_POLICIES_CONFIG,
} from "@/types/siteSettings";

export * from "@/types/siteSettings";

const SETTINGS_FILE = path.join(process.cwd(), "src/data/persistedSiteSettings.json");
const NOTIFICATIONS_FILE = path.join(process.cwd(), "src/data/persistedNotifications.json");
const HEADER_FILE = path.join(process.cwd(), "src/data/persistedHeader.json");
const FOOTER_FILE = path.join(process.cwd(), "src/data/persistedFooter.json");
const HOMEPAGE_FILE = path.join(process.cwd(), "src/data/persistedHomepage.json");
const ABOUT_FILE = path.join(process.cwd(), "src/data/persistedAbout.json");
const POLICIES_FILE = path.join(process.cwd(), "src/data/persistedPolicies.json");

export function getSiteSettings(): ExtendedSiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, "utf8");
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading site settings, using defaults:", err);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(data: Partial<ExtendedSiteSettings> & { siteName?: string }): ExtendedSiteSettings {
  const current = getSiteSettings();
  
  // Format raw phone numbers for tel: and wa.me links
  const phone = data.phone || current.phone;
  const phoneRaw = phone ? phone.replace(/[^0-9+]/g, "") : current.phoneRaw;
  const whatsapp = data.whatsapp || current.whatsapp || phone;
  const whatsappRaw = whatsapp ? whatsapp.replace(/[^0-9]/g, "") : current.whatsappRaw;
  const brandName = data.siteName || data.brandName || current.brandName;

  const updated: ExtendedSiteSettings = {
    ...current,
    ...data,
    brandName,
    phone,
    phoneRaw,
    whatsapp,
    whatsappRaw,
  };

  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf8");

    // Synchronize Header Config with new phone number & concierge triggers
    try {
      const header = getHeaderConfig();
      if (header.buttons) {
        if (header.buttons.phoneButton) {
          header.buttons.phoneButton.label = phone;
          header.buttons.phoneButton.phoneNumber = phoneRaw;
        }
        if (header.buttons.whatsappButton) {
          header.buttons.whatsappButton.number = whatsappRaw;
        }
      }
      fs.writeFileSync(HEADER_FILE, JSON.stringify(header, null, 2), "utf8");
    } catch (hErr) {
      console.error("Error syncing header with site settings:", hErr);
    }

    // Synchronize Footer Config
    try {
      const footer = getFooterConfig();
      footer.supportPhone = phone;
      if (data.email || data.supportEmail) {
        footer.supportEmail = data.email || data.supportEmail || footer.supportEmail;
      }
      if (data.businessHours) {
        footer.hours = data.businessHours;
      }
      fs.writeFileSync(FOOTER_FILE, JSON.stringify(footer, null, 2), "utf8");
    } catch (fErr) {
      console.error("Error syncing footer with site settings:", fErr);
    }

    // Synchronize Notification alerts
    try {
      const notifs = getNotificationSettings();
      if (notifs.adminAlerts) {
        if (data.email || data.supportEmail) {
          notifs.adminAlerts.alertEmail = data.email || data.supportEmail || notifs.adminAlerts.alertEmail;
        }
        if (phoneRaw) {
          notifs.adminAlerts.alertPhone = phoneRaw;
        }
      }
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifs, null, 2), "utf8");
    } catch (nErr) {
      console.error("Error syncing notifications with site settings:", nErr);
    }
  } catch (err) {
    console.error("Error saving site settings:", err);
  }
  return updated;
}

export function getHeaderConfig(): HeaderConfig {
  try {
    if (fs.existsSync(HEADER_FILE)) {
      const content = fs.readFileSync(HEADER_FILE, "utf8");
      return { ...DEFAULT_HEADER_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading header config, using defaults:", err);
  }
  return DEFAULT_HEADER_CONFIG;
}

export function saveHeaderConfig(data: Partial<HeaderConfig>): HeaderConfig {
  const current = getHeaderConfig();
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(HEADER_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving header config:", err);
  }
  return updated;
}

export function getFooterConfig(): FooterConfig {
  try {
    if (fs.existsSync(FOOTER_FILE)) {
      const content = fs.readFileSync(FOOTER_FILE, "utf8");
      return { ...DEFAULT_FOOTER_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading footer config, using defaults:", err);
  }
  return DEFAULT_FOOTER_CONFIG;
}

export function saveFooterConfig(data: Partial<FooterConfig>): FooterConfig {
  const current = getFooterConfig();
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(FOOTER_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving footer config:", err);
  }
  return updated;
}

export function getNotificationSettings(): NotificationSettings {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const content = fs.readFileSync(NOTIFICATIONS_FILE, "utf8");
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading notification settings, using defaults:", err);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(data: Partial<NotificationSettings>): NotificationSettings {
  const current = getNotificationSettings();
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving notification settings:", err);
  }
  return updated;
}

export function getHomepageConfig(): HomepageConfig {
  try {
    if (fs.existsSync(HOMEPAGE_FILE)) {
      const content = fs.readFileSync(HOMEPAGE_FILE, "utf8");
      return { ...DEFAULT_HOMEPAGE_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading homepage config, using defaults:", err);
  }
  return DEFAULT_HOMEPAGE_CONFIG;
}

export function saveHomepageConfig(data: Partial<HomepageConfig>): HomepageConfig {
  const current = getHomepageConfig();
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(HOMEPAGE_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving homepage config:", err);
  }
  return updated;
}

export function getAboutConfig(): AboutConfig {
  try {
    if (fs.existsSync(ABOUT_FILE)) {
      const content = fs.readFileSync(ABOUT_FILE, "utf8");
      return { ...DEFAULT_ABOUT_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading about config, using defaults:", err);
  }
  return DEFAULT_ABOUT_CONFIG;
}

export function saveAboutConfig(data: Partial<AboutConfig>): AboutConfig {
  const current = getAboutConfig();
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(ABOUT_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving about config:", err);
  }
  return updated;
}

export function getPoliciesConfig(): PoliciesConfig {
  try {
    if (fs.existsSync(POLICIES_FILE)) {
      const content = fs.readFileSync(POLICIES_FILE, "utf8");
      return { ...DEFAULT_POLICIES_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading policies config, using defaults:", err);
  }
  return DEFAULT_POLICIES_CONFIG;
}

export function savePoliciesConfig(data: Partial<PoliciesConfig>): PoliciesConfig {
  const current = getPoliciesConfig();
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(POLICIES_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving policies config:", err);
  }
  return updated;
}

