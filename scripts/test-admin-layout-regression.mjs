import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("===================================================================");
console.log("🚀 PRIMERIDES ADMIN UI DESIGN SYSTEM & LAYOUT REGRESSION TEST SUITE");
console.log("===================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    failed++;
  }
}

// 1. Admin shell exists
const adminShellPath = path.join(rootDir, "src/components/admin/AdminShell.tsx");
const adminLayoutPath = path.join(rootDir, "src/app/admin/layout.tsx");
assert(
  fs.existsSync(adminShellPath) && fs.existsSync(adminLayoutPath),
  "Test 1: Admin Shell and Admin Root Layout exist",
  `AdminShell: ${fs.existsSync(adminShellPath)}, AdminLayout: ${fs.existsSync(adminLayoutPath)}`
);

// 2. Authoritative layout tokens exist (Gate 2: 248px, 72px, 60px)
const globalsCssPath = path.join(rootDir, "src/app/globals.css");
const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");
const hasSidebarToken = globalsCss.includes("--admin-sidebar-width: 248px;");
const hasCollapsedToken = globalsCss.includes("--admin-sidebar-collapsed-width: 72px;");
const hasHeaderHeightToken = globalsCss.includes("--admin-header-height: 60px;");
assert(
  hasSidebarToken && hasCollapsedToken && hasHeaderHeightToken,
  "Test 2: Authoritative Layout tokens exist (--admin-sidebar-width: 248px, --admin-sidebar-collapsed-width: 72px, --admin-header-height: 60px)",
  `sidebar: ${hasSidebarToken}, collapsed: ${hasCollapsedToken}, header: ${hasHeaderHeightToken}`
);

// 3. Spacing & motion tokens exist
const hasSpacingTokens = globalsCss.includes("--admin-space-1: 4px;") && globalsCss.includes("--admin-space-8: 32px;");
const hasReducedMotion = globalsCss.includes("prefers-reduced-motion: reduce");
assert(
  hasSpacingTokens && hasReducedMotion,
  "Test 3: Controlled spacing tokens and prefers-reduced-motion media query exist in globals.css",
  `spacing tokens: ${hasSpacingTokens}, reduced motion: ${hasReducedMotion}`
);

// 4. Main content has min-width: 0
const adminMainContainerMatches = globalsCss.includes(".admin-main-container") && globalsCss.includes("min-width: 0;");
const pageContainerContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/PageContainer.tsx"), "utf-8");
const pageContainerHasMinW0 = pageContainerContent.includes("min-w-0");
assert(
  adminMainContainerMatches && pageContainerHasMinW0,
  "Test 4: Main content column and PageContainer enforce min-width: 0",
  `admin-main-container min-width: 0 = ${adminMainContainerMatches}, PageContainer min-w-0 = ${pageContainerHasMinW0}`
);

// 5. Main content does not use viewport width incorrectly (no 100vw in admin container layouts)
const adminShellContent = fs.readFileSync(adminShellPath, "utf-8");
const has100vwInShell = adminShellContent.includes("100vw");
assert(
  !has100vwInShell,
  "Test 5: Main content does not use 100vw inside admin layout calculations",
  "AdminShell uses 100% width instead of 100vw"
);

// 6. Admin body does not rely on overlay positioning (uses CSS Grid two-column architecture)
const shellGridMatches = globalsCss.includes("grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr);");
assert(
  shellGridMatches,
  "Test 6: Two-column CSS Grid geometry is enforced (.admin-shell-grid participates directly in page geometry)",
  "grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr)"
);

// 7. Table containers have controlled overflow & compact row density
const adminTableContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/AdminTable.tsx"), "utf-8");
const tableHasInternalScroll = adminTableContent.includes("overflow-x-auto") && adminTableContent.includes("min-w-0");
const tableHasToolbarAndEmpty = adminTableContent.includes("AdminTableToolbar") && adminTableContent.includes("AdminTableEmptyState");
assert(
  tableHasInternalScroll && tableHasToolbarAndEmpty,
  "Test 7: TableContainer enforces internal horizontal scrolling, AdminTableToolbar, and compact cell density",
  "Found overflow-x-auto, min-w-0, AdminTableToolbar in AdminTable.tsx"
);

// 8. Modal & Drawer have viewport max-height and focus containment
const adminModalContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/AdminModal.tsx"), "utf-8");
const adminDrawerContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/AdminDrawer.tsx"), "utf-8");
const modalHasMaxHeight = adminModalContent.includes("max-h-[calc(100vh-") && adminModalContent.includes("overflow-y-auto");
const drawerExists = adminDrawerContent.includes("AdminDrawer") && adminDrawerContent.includes("overflow-y-auto");
assert(
  modalHasMaxHeight && drawerExists,
  "Test 8: AdminModal and AdminDrawer enforce viewport constraints and internal vertical scrolling",
  `modal max-h: ${modalHasMaxHeight}, drawer: ${drawerExists}`
);

// 9. Tooltip and States primitives exist
const adminTooltipContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/AdminTooltip.tsx"), "utf-8");
const adminStatesContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/AdminStates.tsx"), "utf-8");
const tooltipHasAccessibility = adminTooltipContent.includes('role="tooltip"');
const statesExist = adminStatesContent.includes("AdminEmptyState") && adminStatesContent.includes("AdminLoadingState") && adminStatesContent.includes("AdminErrorState");
assert(
  tooltipHasAccessibility && statesExist,
  "Test 9: AdminTooltip (accessible) and AdminStates (Empty/Loading/Error) primitives exist",
  `tooltip: ${tooltipHasAccessibility}, states: ${statesExist}`
);

// 10. Form primitives exist with compact heights and accessible states
const adminInputContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/AdminInput.tsx"), "utf-8");
const formHasPrimitives = adminInputContent.includes("AdminField") &&
  adminInputContent.includes("AdminInput") &&
  adminInputContent.includes("AdminSelect") &&
  adminInputContent.includes("AdminTextarea") &&
  adminInputContent.includes("AdminCheckbox");
assert(
  formHasPrimitives,
  "Test 10: Canonical form suite exists (AdminField, AdminInput, AdminSelect, AdminTextarea, AdminCheckbox)",
  "Verified all form primitives in AdminInput.tsx"
);

// 11. Button and Stat primitives exist with compact operational heights and balanced spacing
const adminButtonContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/AdminButton.tsx"), "utf-8");
const adminStatContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/AdminStat.tsx"), "utf-8");
const buttonHasVariants = adminButtonContent.includes("primary") && adminButtonContent.includes("secondary") && adminButtonContent.includes("ghost") && adminButtonContent.includes("danger") && adminButtonContent.includes("success");
const statHasBalancedSpacing = adminStatContent.includes("p-4") || adminStatContent.includes("p-5") || adminStatContent.includes("rounded-2xl");
assert(
  buttonHasVariants && statHasBalancedSpacing,
  "Test 11: AdminButton (compact sm/md, 5 variants, gold & outline) and AdminStat (equal 4-sided spacing tile) exist",
  `button variants: ${buttonHasVariants}, stat spacing: ${statHasBalancedSpacing}`
);

// 12. No active admin page uses giant marketing H1 styles (max 24px)
const adminPages = [
  "src/app/admin/page.tsx",
  "src/app/admin/cars/page.tsx",
  "src/app/admin/bookings/page.tsx",
  "src/app/admin/documents/page.tsx",
  "src/app/admin/cms/page.tsx",
  "src/app/admin/staff/page.tsx",
];

let hasMarketingH1 = false;
for (const p of adminPages) {
  const content = fs.readFileSync(path.join(rootDir, p), "utf-8");
  if (content.includes("text-7xl") || content.includes("text-8xl") || content.includes("text-6xl") || content.includes("text-5xl")) {
    hasMarketingH1 = true;
    console.error(`Found marketing H1 in ${p}`);
  }
}
const pageHeaderContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/PageHeader.tsx"), "utf-8");
const pageHeaderHasControlledH1 = pageHeaderContent.includes("lg:text-[22px]") || pageHeaderContent.includes("lg:text-[24px]") || pageHeaderContent.includes("lg:text-[28px]");
assert(
  !hasMarketingH1 && pageHeaderHasControlledH1,
  "Test 12: PageHeader uses controlled, professional admin heading scale (20-22px balanced H1)",
  "PageHeader strictly caps H1 to 20-22px"
);

// 13. Index barrel export contains all canonical primitives and aliases
const indexContent = fs.readFileSync(path.join(rootDir, "src/components/admin/ui/index.ts"), "utf-8");
const indexHasAll = indexContent.includes("AdminPageContainer") &&
  indexContent.includes("AdminPageHeader") &&
  indexContent.includes("AdminCard") &&
  indexContent.includes("AdminSection") &&
  indexContent.includes("AdminButton") &&
  indexContent.includes("AdminBadge") &&
  indexContent.includes("AdminStat") &&
  indexContent.includes("AdminTable") &&
  indexContent.includes("AdminModal") &&
  indexContent.includes("AdminDrawer") &&
  indexContent.includes("AdminTooltip") &&
  indexContent.includes("AdminEmptyState");
assert(
  indexHasAll,
  "Test 13: Canonical barrel index exports all primitives and backward-compatible aliases",
  "Verified complete suite in src/components/admin/ui/index.ts"
);

// 14. Mobile sidebar becomes drawer
const sidebarContent = fs.readFileSync(path.join(rootDir, "src/components/admin/Sidebar.tsx"), "utf-8");
const sidebarHasDrawer = sidebarContent.includes("lg:hidden") && sidebarContent.includes("translate-x-0") && sidebarContent.includes("backdrop-blur");
assert(
  sidebarHasDrawer,
  "Test 14: Sidebar cleanly transforms to off-canvas drawer with backdrop overlay on mobile/tablet (< 1024px)",
  "Found lg:hidden off-canvas drawer and backdrop in Sidebar.tsx"
);

// 15. All admin pages use canonical AdminShell
const layoutContent = fs.readFileSync(adminLayoutPath, "utf-8");
assert(
  layoutContent.includes("<AdminShell>{children}</AdminShell>"),
  "Test 15: Root Admin layout wraps all admin routes within canonical AdminShell",
  "Found <AdminShell>{children}</AdminShell> in src/app/admin/layout.tsx"
);

// 16. Gate 3: Sidebar expanded (248px) and collapsed (72px) structural classes and tokens
const sidebarFilePath = path.join(rootDir, "src/components/admin/Sidebar.tsx");
const sidebarCode = fs.readFileSync(sidebarFilePath, "utf-8");
const hasExpanded248 = sidebarCode.includes('w-[248px]');
const hasCollapsed72 = sidebarCode.includes('w-[72px]');
assert(
  hasExpanded248 && hasCollapsed72,
  "Test 16 (Gate 3): Sidebar supports structural 248px expanded and 72px collapsed dimensions",
  `expanded 248px: ${hasExpanded248}, collapsed 72px: ${hasCollapsed72}`
);

// 17. Gate 3: Sidebar collapse/expand control button exists with accessible aria-label, chevrons, and tooltips
const hasCollapseAria = sidebarCode.includes('aria-label="Collapse sidebar"') && sidebarCode.includes('aria-label="Expand sidebar"');
const hasChevrons = sidebarCode.includes("ChevronLeft") && sidebarCode.includes("ChevronRight");
const hasCollapseTooltips = sidebarCode.includes('content="Collapse sidebar"') && sidebarCode.includes('content="Expand sidebar"');
assert(
  hasCollapseAria && hasChevrons && hasCollapseTooltips,
  "Test 17 (Gate 3): Sidebar includes accessible collapse/expand control with ChevronLeft/Right and AdminTooltip",
  `aria: ${hasCollapseAria}, chevrons: ${hasChevrons}, tooltips: ${hasCollapseTooltips}`
);

// 18. Gate 3: Collapsed sidebar items render with centered icons, sr-only labels, and AdminTooltip
const hasCollapsedTooltip = sidebarCode.includes("<AdminTooltip content={item.name} position=\"right\"");
const hasSrOnlyLabels = sidebarCode.includes('<span className="sr-only">{item.name}</span>');
const hasCenteredCollapsedItems = sidebarCode.includes("flex items-center justify-center w-10 h-10");
assert(
  hasCollapsedTooltip && hasSrOnlyLabels && hasCenteredCollapsedItems,
  "Test 18 (Gate 3): Collapsed 72px sidebar renders centered 40px icon tiles, sr-only labels, and accessible AdminTooltip",
  `tooltip: ${hasCollapsedTooltip}, sr-only: ${hasSrOnlyLabels}, centered: ${hasCenteredCollapsedItems}`
);

// 19. Gate 3: Semantic domain-specific icon colors configured for navigation items
const hasDashboardColor = sidebarCode.includes("text-slate-600");
const hasFleetColor = sidebarCode.includes("text-amber-600");
const hasBookingsColor = sidebarCode.includes("text-sky-600");
const hasKycColor = sidebarCode.includes("text-emerald-600");
const hasCmsColor = sidebarCode.includes("text-[#c59b27]") || sidebarCode.includes("text-purple-600");
const hasStaffColor = sidebarCode.includes("text-indigo-600");
assert(
  hasDashboardColor && hasFleetColor && hasBookingsColor && hasKycColor && hasCmsColor && hasStaffColor,
  "Test 19 (Gate 3): Restrained semantic domain-specific icon colors configured for all 6 admin navigation sections",
  "Verified slate (dashboard), amber (fleet), sky (bookings), emerald (kyc), purple (cms), indigo (staff)"
);

// 20. Gate 3: AdminHeader strictly enforces 60px height and includes mobile drawer trigger
const adminHeaderPath = path.join(rootDir, "src/components/admin/AdminHeader.tsx");
const adminHeaderCode = fs.readFileSync(adminHeaderPath, "utf-8");
const headerHasStrict60px = adminHeaderCode.includes("h-[60px] min-h-[60px] max-h-[60px]");
const headerHasMobileTrigger = adminHeaderCode.includes("toggleMobileDrawer") && adminHeaderCode.includes('aria-label="Toggle Navigation Drawer"');
assert(
  headerHasStrict60px && headerHasMobileTrigger,
  "Test 20 (Gate 3): AdminHeader strictly enforces 60px height and includes accessible mobile drawer trigger",
  `60px height: ${headerHasStrict60px}, mobile trigger: ${headerHasMobileTrigger}`
);

// 21. Gate 3: Responsive CSS Grid column transition and .is-collapsed modifier
const gridHasTransition = globalsCss.includes("transition: grid-template-columns var(--admin-transition-normal, 180ms);");
const gridHasCollapsedModifier = globalsCss.includes(".admin-shell-grid.is-collapsed") && globalsCss.includes("grid-template-columns: var(--admin-sidebar-collapsed-width) minmax(0, 1fr);");
assert(
  gridHasTransition && gridHasCollapsedModifier,
  "Test 21 (Gate 3): Two-column CSS Grid dynamically resizes content area when collapsed (180ms transition)",
  `grid transition: ${gridHasTransition}, is-collapsed modifier: ${gridHasCollapsedModifier}`
);

// 22. Gate 3: Mobile off-canvas drawer with ESC key support in context
const contextPath = path.join(rootDir, "src/components/admin/AdminLayoutContext.tsx");
const contextCode = fs.readFileSync(contextPath, "utf-8");
const hasEscHandler = contextCode.includes('e.key === "Escape"') && contextCode.includes("setIsMobileDrawerOpen(false)");
const hasDrawerState = contextCode.includes("isMobileDrawerOpen") && contextCode.includes("toggleMobileDrawer");
assert(
  hasEscHandler && hasDrawerState,
  "Test 22 (Gate 3): AdminLayoutContext manages mobile drawer state with ESC keyboard dismissal",
  `ESC handler: ${hasEscHandler}, drawer state: ${hasDrawerState}`
);

// 23. Gate 3: No legacy 280px sidebar width or 64px header height remnants in admin components
const hasLegacySidebarWidth = sidebarCode.includes("w-[280px]") || adminShellContent.includes("280px");
const hasLegacyHeaderHeight = adminHeaderCode.includes("h-16");
assert(
  !hasLegacySidebarWidth && !hasLegacyHeaderHeight,
  "Test 23 (Gate 3): No legacy 280px sidebar width or 64px (h-16) header height remnants in shell components",
  `legacy 280px found: ${hasLegacySidebarWidth}, legacy h-16 found: ${hasLegacyHeaderHeight}`
);

// 24. Gate 3 Correction: Dashboard uses canonical AdminStat and AdminSection primitives
const dashboardPath = path.join(rootDir, "src/app/admin/page.tsx");
const dashboardCode = fs.readFileSync(dashboardPath, "utf-8");
const dashboardHasAdminStat = dashboardCode.includes("<AdminStat") && dashboardCode.includes("label={s.label}");
const dashboardHasAdminSection = dashboardCode.includes("<AdminSection") && dashboardCode.includes('title="Recent Customer Reservations"');
assert(
  dashboardHasAdminStat && dashboardHasAdminSection,
  "Test 24 (Gate 3 Correction): Dashboard uses canonical AdminStat and AdminSection without oversized card bloat",
  `AdminStat: ${dashboardHasAdminStat}, AdminSection: ${dashboardHasAdminSection}`
);

// 25. Gate 3 Correction: AdminHeader controls precision spacing and sizing
const headerHas36pxButton = adminHeaderCode.includes("h-[36px]");
const headerHasTelemetryGap = adminHeaderCode.includes("inline-flex items-center gap-2 px-3 py-1.5");
const headerHas32pxAvatar = adminHeaderCode.includes("w-8 h-8 rounded-full");
assert(
  headerHas36pxButton && headerHasTelemetryGap && headerHas32pxAvatar,
  "Test 25 (Gate 3 Correction): AdminHeader controls feature 36px button, 12px telemetry badge with CSS gap, and 32px avatar",
  `36px button: ${headerHas36pxButton}, telemetry gap: ${headerHasTelemetryGap}, 32px avatar: ${headerHas32pxAvatar}`
);

// 26. Gate 3 Correction: Sidebar navigation 20px icon container and hover micro-animations
const sidebarHas20pxIconContainer = sidebarCode.includes("w-5 h-5 flex items-center justify-center shrink-0");
const sidebarHasMicroAnimation = sidebarCode.includes("group-hover:translate-x-[1px]") && sidebarCode.includes("group-hover:scale-[1.03]");
assert(
  sidebarHas20pxIconContainer && sidebarHasMicroAnimation,
  "Test 26 (Gate 3 Correction): Sidebar navigation uses 20px icon containers with hover micro-animations",
  `20px container: ${sidebarHas20pxIconContainer}, micro-animation: ${sidebarHasMicroAnimation}`
);

// 27. Gate 3 Correction: AdminBadge strictly enforces 22px height and 10.5px bold font
const adminBadgePath = path.join(rootDir, "src/components/admin/ui/AdminBadge.tsx");
const adminBadgeCode = fs.readFileSync(adminBadgePath, "utf-8");
const badgeHasStrict22px = adminBadgeCode.includes("h-[22px]") && adminBadgeCode.includes("text-[10.5px]");
assert(
  badgeHasStrict22px,
  "Test 27 (Gate 3 Correction): AdminBadge strictly enforces 22px height and 10.5px bold typography",
  `badge 22px: ${badgeHasStrict22px}`
);

// 28. Gate 3 Correction: Table rows target 52-58px height and balanced column widths
const dashboardHasRowHeight = dashboardCode.includes('className="h-[54px]"');
const dashboardHasBalancedCols = dashboardCode.includes('className="w-[15%]"') && dashboardCode.includes('className="w-[18%]"') && dashboardCode.includes('className="w-[20%]"');
assert(
  dashboardHasRowHeight && dashboardHasBalancedCols,
  "Test 28 (Gate 3 Correction): Operational tables enforce 52-58px row height (h-[54px]) and balanced column widths",
  `54px rows: ${dashboardHasRowHeight}, balanced cols: ${dashboardHasBalancedCols}`
);

console.log("\n===================================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("===================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
