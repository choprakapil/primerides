import "server-only";
import fs from "fs";
import path from "path";
import { prisma } from "../db/client";
import {
  ExtendedSiteSettings,
  HeaderConfig,
  FooterConfig,
  NotificationSettings,
  HomepageConfig,
  AboutConfig,
  PoliciesConfig,
  ContactConfig,
  FleetCmsConfig,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_HOMEPAGE_CONFIG,
  DEFAULT_ABOUT_CONFIG,
  DEFAULT_POLICIES_CONFIG,
  DEFAULT_CONTACT_CONFIG,
  DEFAULT_FLEET_CMS_CONFIG,
} from "@/types/siteSettings";

export * from "@/types/siteSettings";

const SETTINGS_FILE = path.join(process.cwd(), "src/data/persistedSiteSettings.json");
const NOTIFICATIONS_FILE = path.join(process.cwd(), "src/data/persistedNotifications.json");
const HEADER_FILE = path.join(process.cwd(), "src/data/persistedHeader.json");
const FOOTER_FILE = path.join(process.cwd(), "src/data/persistedFooter.json");
const HOMEPAGE_FILE = path.join(process.cwd(), "src/data/persistedHomepage.json");
const ABOUT_FILE = path.join(process.cwd(), "src/data/persistedAbout.json");
const POLICIES_FILE = path.join(process.cwd(), "src/data/persistedPolicies.json");
const CONTACT_FILE = path.join(process.cwd(), "src/data/persistedContact.json");
const FLEET_FILE = path.join(process.cwd(), "src/data/persistedFleet.json");

/**
 * Persists configuration snapshot to MySQL tbl_site_settings table for serverless safety.
 */
async function persistToDb(key: string, value: any): Promise<void> {
  try {
    await (prisma as any).siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } catch (err) {
    // Graceful fallback: database might be disconnected or initializing
  }
}

export async function getSiteSettingsAsync(): Promise<ExtendedSiteSettings> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({
      where: { key: "site_settings" },
    });
    if (record && record.value) {
      return { ...DEFAULT_SITE_SETTINGS, ...(record.value as object) };
    }
  } catch (err) {
    // fallback to file
  }
  return getSiteSettings();
}

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
  persistToDb("site_settings", updated).catch(() => {});
  return updated;
}

export async function getHeaderConfigAsync(): Promise<HeaderConfig> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key: "header" } });
    if (record && record.value) return { ...DEFAULT_HEADER_CONFIG, ...(record.value as object) };
  } catch {}
  return getHeaderConfig();
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
  persistToDb("header", updated).catch(() => {});
  return updated;
}

export async function getFooterConfigAsync(): Promise<FooterConfig> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key: "footer" } });
    if (record && record.value) return { ...DEFAULT_FOOTER_CONFIG, ...(record.value as object) };
  } catch {}
  return getFooterConfig();
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
  persistToDb("footer", updated).catch(() => {});
  return updated;
}

export async function getNotificationSettingsAsync(): Promise<NotificationSettings> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key: "notifications" } });
    if (record && record.value) return { ...DEFAULT_NOTIFICATION_SETTINGS, ...(record.value as object) };
  } catch {}
  return getNotificationSettings();
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
  persistToDb("notifications", updated).catch(() => {});
  return updated;
}

export async function getHomepageConfigAsync(): Promise<HomepageConfig> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key: "homepage" } });
    if (record && record.value) return { ...DEFAULT_HOMEPAGE_CONFIG, ...(record.value as object) };
  } catch {}
  return getHomepageConfig();
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
  persistToDb("homepage", updated).catch(() => {});
  return updated;
}

export async function getAboutConfigAsync(): Promise<AboutConfig> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key: "about" } });
    if (record && record.value) return { ...DEFAULT_ABOUT_CONFIG, ...(record.value as object) };
  } catch {}
  return getAboutConfig();
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
  persistToDb("about", updated).catch(() => {});
  return updated;
}

export async function getPoliciesConfigAsync(): Promise<PoliciesConfig> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key: "policies" } });
    if (record && record.value) return { ...DEFAULT_POLICIES_CONFIG, ...(record.value as object) };
  } catch {}
  return getPoliciesConfig();
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
  persistToDb("policies", updated).catch(() => {});
  return updated;
}

export async function getContactConfigAsync(): Promise<ContactConfig> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key: "contact" } });
    if (record && record.value) return { ...DEFAULT_CONTACT_CONFIG, ...(record.value as object) };
  } catch {}
  return getContactConfig();
}

export function getContactConfig(): ContactConfig {
  try {
    if (fs.existsSync(CONTACT_FILE)) {
      const content = fs.readFileSync(CONTACT_FILE, "utf8");
      return { ...DEFAULT_CONTACT_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading contact config, using defaults:", err);
  }
  return DEFAULT_CONTACT_CONFIG;
}

export function saveContactConfig(data: Partial<ContactConfig>): ContactConfig {
  const current = getContactConfig();
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving contact config:", err);
  }
  persistToDb("contact", updated).catch(() => {});
  return updated;
}

export async function getFleetConfigAsync(): Promise<FleetCmsConfig> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key: "fleet" } });
    if (record && record.value) return { ...DEFAULT_FLEET_CMS_CONFIG, ...(record.value as object) };
  } catch {}
  return getFleetConfig();
}

export function getFleetConfig(): FleetCmsConfig {
  try {
    if (fs.existsSync(FLEET_FILE)) {
      const content = fs.readFileSync(FLEET_FILE, "utf8");
      return { ...DEFAULT_FLEET_CMS_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error("Error reading fleet config, using defaults:", err);
  }
  return DEFAULT_FLEET_CMS_CONFIG;
}

export function saveFleetConfig(data: Partial<FleetCmsConfig>): FleetCmsConfig {
  const current = getFleetConfig();
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(FLEET_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving fleet config:", err);
  }
  persistToDb("fleet", updated).catch(() => {});
  return updated;
}



