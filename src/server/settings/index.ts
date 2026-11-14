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

function readConfigFile<T>(filePath: string, defaultVal: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return { ...defaultVal, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error(`Error reading config file ${filePath}:`, err);
  }
  return defaultVal;
}

async function readConfigDbOrFile<T>(key: string, filePath: string, defaultVal: T): Promise<T> {
  try {
    const record = await (prisma as any).siteSetting.findUnique({ where: { key } });
    if (record && record.value) return { ...defaultVal, ...(record.value as object) };
  } catch {}
  return readConfigFile(filePath, defaultVal);
}

function writeConfigFileAndDb<T extends object>(key: string, filePath: string, data: Partial<T>, current: T): T {
  const updated = { ...current, ...data };
  try {
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error(`Error saving config ${key}:`, err);
  }
  persistToDb(key, updated).catch(() => {});
  return updated;
}

export async function getSiteSettingsAsync(): Promise<ExtendedSiteSettings> {
  return readConfigDbOrFile<ExtendedSiteSettings>("site_settings", SETTINGS_FILE, DEFAULT_SITE_SETTINGS);
}

export function getSiteSettings(): ExtendedSiteSettings {
  return readConfigFile<ExtendedSiteSettings>(SETTINGS_FILE, DEFAULT_SITE_SETTINGS);
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

// Header
export const getHeaderConfigAsync = (): Promise<HeaderConfig> =>
  readConfigDbOrFile<HeaderConfig>("header", HEADER_FILE, DEFAULT_HEADER_CONFIG);
export const getHeaderConfig = (): HeaderConfig =>
  readConfigFile<HeaderConfig>(HEADER_FILE, DEFAULT_HEADER_CONFIG);
export const saveHeaderConfig = (data: Partial<HeaderConfig>): HeaderConfig =>
  writeConfigFileAndDb<HeaderConfig>("header", HEADER_FILE, data, getHeaderConfig());

// Footer
export const getFooterConfigAsync = (): Promise<FooterConfig> =>
  readConfigDbOrFile<FooterConfig>("footer", FOOTER_FILE, DEFAULT_FOOTER_CONFIG);
export const getFooterConfig = (): FooterConfig =>
  readConfigFile<FooterConfig>(FOOTER_FILE, DEFAULT_FOOTER_CONFIG);
export const saveFooterConfig = (data: Partial<FooterConfig>): FooterConfig =>
  writeConfigFileAndDb<FooterConfig>("footer", FOOTER_FILE, data, getFooterConfig());

// Notifications
export const getNotificationSettingsAsync = (): Promise<NotificationSettings> =>
  readConfigDbOrFile<NotificationSettings>("notifications", NOTIFICATIONS_FILE, DEFAULT_NOTIFICATION_SETTINGS);
export const getNotificationSettings = (): NotificationSettings =>
  readConfigFile<NotificationSettings>(NOTIFICATIONS_FILE, DEFAULT_NOTIFICATION_SETTINGS);
export const saveNotificationSettings = (data: Partial<NotificationSettings>): NotificationSettings =>
  writeConfigFileAndDb<NotificationSettings>("notifications", NOTIFICATIONS_FILE, data, getNotificationSettings());

// Homepage
export const getHomepageConfigAsync = (): Promise<HomepageConfig> =>
  readConfigDbOrFile<HomepageConfig>("homepage", HOMEPAGE_FILE, DEFAULT_HOMEPAGE_CONFIG);
export const getHomepageConfig = (): HomepageConfig =>
  readConfigFile<HomepageConfig>(HOMEPAGE_FILE, DEFAULT_HOMEPAGE_CONFIG);
export const saveHomepageConfig = (data: Partial<HomepageConfig>): HomepageConfig =>
  writeConfigFileAndDb<HomepageConfig>("homepage", HOMEPAGE_FILE, data, getHomepageConfig());

// About
export const getAboutConfigAsync = (): Promise<AboutConfig> =>
  readConfigDbOrFile<AboutConfig>("about", ABOUT_FILE, DEFAULT_ABOUT_CONFIG);
export const getAboutConfig = (): AboutConfig =>
  readConfigFile<AboutConfig>(ABOUT_FILE, DEFAULT_ABOUT_CONFIG);
export const saveAboutConfig = (data: Partial<AboutConfig>): AboutConfig =>
  writeConfigFileAndDb<AboutConfig>("about", ABOUT_FILE, data, getAboutConfig());

// Policies
export const getPoliciesConfigAsync = (): Promise<PoliciesConfig> =>
  readConfigDbOrFile<PoliciesConfig>("policies", POLICIES_FILE, DEFAULT_POLICIES_CONFIG);
export const getPoliciesConfig = (): PoliciesConfig =>
  readConfigFile<PoliciesConfig>(POLICIES_FILE, DEFAULT_POLICIES_CONFIG);
export const savePoliciesConfig = (data: Partial<PoliciesConfig>): PoliciesConfig =>
  writeConfigFileAndDb<PoliciesConfig>("policies", POLICIES_FILE, data, getPoliciesConfig());

// Contact
export const getContactConfigAsync = (): Promise<ContactConfig> =>
  readConfigDbOrFile<ContactConfig>("contact", CONTACT_FILE, DEFAULT_CONTACT_CONFIG);
export const getContactConfig = (): ContactConfig =>
  readConfigFile<ContactConfig>(CONTACT_FILE, DEFAULT_CONTACT_CONFIG);
export const saveContactConfig = (data: Partial<ContactConfig>): ContactConfig =>
  writeConfigFileAndDb<ContactConfig>("contact", CONTACT_FILE, data, getContactConfig());

// Fleet
export const getFleetConfigAsync = (): Promise<FleetCmsConfig> =>
  readConfigDbOrFile<FleetCmsConfig>("fleet", FLEET_FILE, DEFAULT_FLEET_CMS_CONFIG);
export const getFleetConfig = (): FleetCmsConfig =>
  readConfigFile<FleetCmsConfig>(FLEET_FILE, DEFAULT_FLEET_CMS_CONFIG);
export const saveFleetConfig = (data: Partial<FleetCmsConfig>): FleetCmsConfig =>
  writeConfigFileAndDb<FleetCmsConfig>("fleet", FLEET_FILE, data, getFleetConfig());
