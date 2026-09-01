# Graph Report - .  (2026-08-10)

## Corpus Check
- 277 files · ~184,178 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1568 nodes · 2694 edges · 169 communities (104 shown, 65 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- API Routes
- Dashboard Pages
- Config API
- Template System
- Lead Hunter
- Package Config
- Audit API
- Page Routes
- Dependencies
- Similar Companies
- Embeddings
- App Components
- Analytics Events
- Admin Modules
- App Entry
- Billing API
- Wizard Flow
- PostHog Analytics
- Notification System
- API Hub
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168

## God Nodes (most connected - your core abstractions)
1. `createServiceClient()` - 144 edges
2. `requireAuthFromToken()` - 102 edges
3. `Supabase Client` - 96 edges
4. `Auth Library` - 78 edges
5. `checkKillSwitch()` - 31 edges
6. `Limits Library` - 30 edges
7. `track()` - 27 edges
8. `Kill Switches Library` - 27 edges
9. `dbSelect()` - 24 edges
10. `App (root component)` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Telegram Action Route - Approve/decline/takeover Telegram leads` --calls--> `Kill Switches Library`  [EXTRACTED]
  app/api/telegram/action/route.ts → dashboard/lib/kill-switches.ts
- `Telegram Auth Status Route - Check Telegram session connection status` --calls--> `Kill Switches Library`  [EXTRACTED]
  app/api/telegram/auth/status/route.ts → dashboard/lib/kill-switches.ts
- `App (root component)` --calls--> `Sidebar`  [EXTRACTED]
  admin-app/src/App.tsx → components/Sidebar.tsx
- `Telegram Leads API` --calls--> `Auth Library`  [EXTRACTED]
  app/api/telegram/leads/route.ts → dashboard/lib/auth.ts
- `Email Templates API` --calls--> `Auth Library`  [EXTRACTED]
  app/api/templates/route.ts → dashboard/lib/auth.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **App Module Routing (Tab-based navigation)** — admin_app_src_app_app, src_components_sidebar, src_components_overview, src_components_activitymodule, src_components_billingmodule, src_components_plansmodule, src_components_jobsmodule, src_components_leagsmodule, src_components_emailsmodule, src_components_telegrammodule, src_components_apihubmodule, src_components_integrationsmodule, src_components_posthogmodule, src_components_settingsmodule, src_components_teammodule, src_components_supportmodule [EXTRACTED 1.00]
- **Shared UI Component Library (PageHeader, DataTable, Badge, SearchInput, StatCard)** — src_components_pageheader, src_components_datatable, src_components_badge, src_components_searchinput, src_components_statcard [EXTRACTED 1.00]
- **PostHog Analytics Sub-tabs (Overview, Flags, Events, Persons, Settings)** — src_components_posthogmodule_overviewtab, src_components_posthogmodule_flagstab, src_components_posthogmodule_eventstab, src_components_posthogmodule_personstab, src_components_posthogmodule_settingstab [EXTRACTED 1.00]
- **Admin App Feature Modules** — admin_app_titlebar, admin_app_toast, admin_app_usersmodule, admin_app_websitemodule, admin_app_workermodule [INFERRED 0.85]
- **Dashboard Admin User API Routes** — dashboard_api_admin_users_list, dashboard_api_admin_user_detail, dashboard_api_admin_user_suspend, dashboard_api_admin_user_reset_usage [EXTRACTED 1.00]
- **Dashboard Analytics API Routes** — dashboard_api_analytics_events, dashboard_api_analytics_flags, dashboard_api_analytics_flags_toggle, dashboard_api_analytics_identify [EXTRACTED 1.00]
- **Authentication Flow** — app_api_auth_login_route, app_api_auth_logout_route, app_api_auth_refresh_route, app_api_auth_signup_route, supabase_auth, dashboard_lib_auth [EXTRACTED 1.00]
- **Billing Integration** — app_api_billing_checkout_route, app_api_billing_portal_route, app_api_billing_webhook_route, dashboard_lib_lemonsqueezy, lemonsqueezy_billing, orgs_table [EXTRACTED 1.00]
- **Sales Pipeline Core** — app_api_discover_route, app_api_audit_route, app_api_draft_route, app_api_leads_route, app_api_inbox_route, dashboard_lib_kill_switches, companies_table, jobs_table [INFERRED 0.85]
- **Auth middleware layer - All routes depending on requireAuthFromToken for cookie-based authentication** — api_org_route, api_overview_route, api_prospects_route, api_reject_route, api_search_route, api_send_reply_route, api_settings_domain_route, api_settings_keys_route, api_similar_route, api_support_route, api_support_id_route, api_support_unseen_route, api_team_accept_route, api_team_invite_route, api_team_member_route, api_team_route, api_telegram_action_route, api_telegram_auth_confirm_route, api_telegram_auth_start_route, api_telegram_auth_status_route, api_telegram_auth_verify_route [EXTRACTED 1.00]
- **External service integrations - Routes calling third-party APIs** — api_mcp_route, api_search_route, api_send_reply_route, api_sentry_tunnel_route, api_team_invite_route, api_telegram_auth_confirm_route, api_telegram_auth_verify_route [EXTRACTED 1.00]
- **Telegram auth flow - Start -> Verify -> Confirm connection sequence** — api_telegram_auth_start_route, api_telegram_auth_verify_route, api_telegram_auth_confirm_route, api_telegram_auth_status_route, api_telegram_action_route [INFERRED 0.90]
- **Authentication Flow** — app_auth_layout, auth_login_page, auth_signup_page, dashboard_lib_auth, lib_analytics, components_auth_hero [INFERRED 0.85]
- **Resend Inbound Email Processing Pipeline** — api_webhooks_resend_route, concept_resend_webhook, dashboard_lib_supabase [EXTRACTED 1.00]
- **Dashboard Shell Architecture** — app_dashboard_layout, components_dashboard_shell, components_dashboard_content, dashboard_lib_auth [EXTRACTED 1.00]
- **Dashboard Page Layer** — app_dashboard_prospects_page, app_dashboard_settings_page, app_dashboard_support_page, app_dashboard_team_page, app_dashboard_telegram_page, app_dashboard_telegram_setup_page, app_dashboard_templates_page [INFERRED 0.90]
- **Onboarding Wizard Flow** — app_dashboard_wizard_profile_page, app_dashboard_wizard_calendly_page, app_dashboard_wizard_domain_page, app_dashboard_wizard_keys_page, app_dashboard_wizard_telegram_page, concept_wizard_flow [INFERRED 0.85]
- **Public Site Pages** — app_enterprise_page, app_pricing_page, app_privacy_page, app_refund_page, app_security_page, app_success_page, component_navbar, component_footer [INFERRED 0.85]
- **Dashboard shell layout providing sidebar context, navigation, and feature gating** — components_dashboard_shell, components_sidebar, components_dashboard_content, components_setup_required_modal, concept_kill_switch_feature_flagging [EXTRACTED 0.95]
- **Landing page modular composition with reusable section components** — components_landing_page, components_landing_extras, components_navbar, components_footer, concept_landing_page_modularity [EXTRACTED 0.95]
- **Client-side provider stack integrating analytics, error tracking, and page view logging** — components_providers, components_sentry_user_provider, components_page_tracker [EXTRACTED 0.90]
- **lib utility modules** — dashboard_lib_analytics, dashboard_lib_auth, dashboard_lib_killswitches, dashboard_lib_lemonsqueezy, dashboard_lib_limits, dashboard_lib_logger, dashboard_lib_ratelimit, dashboard_lib_styles, dashboard_lib_supabase, dashboard_lib_telegramauth, dashboard_lib_templates, dashboard_lib_utils [EXTRACTED 1.00]
- **auth, kill-switch, and limits integration** — dashboard_lib_auth, dashboard_lib_killswitches, dashboard_lib_limits, dashboard_lib_supabase, dashboard_lib_lemonsqueezy [INFERRED 0.85]
- **database seeding and fix scripts** — dashboard_scripts_fixaudits, dashboard_scripts_seedtestdata [EXTRACTED 1.00]
- **Worker Job Processing Pipeline** — knight_worker_start_js, knight_worker_index_js, knight_worker_ai_hub_js, knight_worker_shared_audit_js, knight_worker_embeddings_js, knight_worker_analytics_js, knight_worker_global_config_js [EXTRACTED 0.90]
- **AI Provider Adapters** — knight_provider_cohere_js, knight_provider_gemini_js, knight_provider_groq_js, knight_provider_openrouter_js [EXTRACTED 1.00]
- **Supabase Database Schema & Migrations** — knight_supabase_schema_sql, knight_migration_018_scheduled_jobs, knight_migration_telegram_welcome, knight_migration_webhooks [EXTRACTED 1.00]
- **Telegram Autonomous Sales System** — worker_telegram_userbot, worker_telegram_agent, worker_telegram_hunter, worker_telegram_admin, knight_concept_userbot, knight_concept_ai_sales_agent, knight_concept_lead_hunter, knight_concept_sniper [INFERRED 0.95]
- **Knight CI/CD Pipeline** — knight_deploy_workflow, admin_app_autorelease, admin_app_builddesktop, knight_docker_compose [EXTRACTED 0.90]
- **Knight Documentation System** — docs_index, docs_quickstart, docs_features_index, docs_features_discovery, docs_billing_plans, docs_settings_company, docs_admin_controls_spec, docs_troubleshooting, knight_readme, knight_contributing [EXTRACTED 0.95]
- **Electron Application Icons** — electron_icons_icon_128x128, electron_icons_icon_16x16, electron_icons_icon_256x256, electron_icons_icon_32x32, electron_icons_icon_48x48, electron_icons_icon_512x512, electron_icons_icon_64x64 [EXTRACTED 1.00]
- **Dashboard Branding and Icons** — dashboard_public_knight_logo, dashboard_public_logo, dashboard_public_icon_16, dashboard_public_icon_32, dashboard_public_icon_192, dashboard_public_icon_512, dashboard_public_apple_touch_icon [EXTRACTED 1.00]
- **Admin App UI Assets** — admin_app_public_favicon, admin_app_public_icons, admin_app_src_assets_hero, admin_app_src_assets_react, admin_app_src_assets_vite [INFERRED 0.85]
- **Knight project media assets** — admin-app_warning, dashboard_intro [EXTRACTED 0.90]

## Communities (169 total, 65 thin omitted)

### Community 0 - "API Routes"
Cohesion: 0.05
Nodes (49): GET(), POST(), GET(), PATCH(), POST(), GET(), PATCH(), GET() (+41 more)

### Community 1 - "Dashboard Pages"
Cohesion: 0.05
Nodes (37): metadata, milestones, principles, values, metadata, metadata, FormData, initialForm (+29 more)

### Community 2 - "Config API"
Cohesion: 0.05
Nodes (61): /api/config, /api/org, /api/prospects, /api/send-reply, /api/settings/domain, /api/settings/keys, /api/support, /api/team (+53 more)

### Community 3 - "Template System"
Cohesion: 0.09
Nodes (28): template system, POST(), POST(), EmailDomain, OrgData, PendingInvite, ROLE_DESCRIPTIONS, ROLE_STYLES (+20 more)

### Community 4 - "Lead Hunter"
Cohesion: 0.11
Nodes (31): autonomous lead hunter, live sniper strategy, Telegram userbot, initAdminRemote(), supabase, startDripCron(), categorizeChannel(), extractContactInfo() (+23 more)

### Community 5 - "Package Config"
Cohesion: 0.05
Nodes (38): author, dependencies, puppeteer-core, description, devDependencies, concurrently, prettier, engines (+30 more)

### Community 6 - "Audit API"
Cohesion: 0.07
Nodes (34): Audit Create API, Audits List API, Billing Portal API, Config API, Discover API, Draft API, Engine Control API, Inbox API (+26 more)

### Community 7 - "Page Routes"
Cohesion: 0.08
Nodes (32): DEFAULTS, getLandingContent(), Page(), AnimatedWorkflow(), CASE_STUDIES, CaseStudies(), COMPARISON_ROWS, ComparisonTable() (+24 more)

### Community 8 - "Dependencies"
Cohesion: 0.06
Nodes (34): dependencies, clsx, framer-motion, @google/generative-ai, jimp, @lemonsqueezy/lemonsqueezy.js, next, react-dom (+26 more)

### Community 9 - "Similar Companies"
Cohesion: 0.15
Nodes (25): Similar Companies Route - pgvector cosine similarity company discovery, POST(), POST(), DELETE(), GET(), keyPrefix(), POST(), supabase (+17 more)

### Community 10 - "Embeddings"
Cohesion: 0.12
Nodes (30): auditToText(), companyToText(), generateEmbedding(), generateEmbeddings(), getClient(), dedupKey(), fetchPendingJobs(), fetchSearxNG() (+22 more)

### Community 11 - "App Components"
Cohesion: 0.15
Nodes (31): App (root component), loadZoom(), saveZoom(), planBadgeColor(), statusBadgeColor(), ActivityModule, ApiHubModule, KeysTab (+23 more)

### Community 12 - "Analytics Events"
Cohesion: 0.08
Nodes (27): analytics_events Table, analytics_persons Table, Resend Webhook Handler, Analytics Persons API, Analytics Stats API, Analytics Track API, Auth Login API, Auth Logout API (+19 more)

### Community 13 - "Admin Modules"
Cohesion: 0.21
Nodes (16): Badge(), BadgeProps, BadgeVariant, variantStyles, Column, DataTable(), DataTableProps, PageHeader() (+8 more)

### Community 14 - "App Entry"
Cohesion: 0.10
Nodes (21): ErrorState, ActivityModule(), BillingModule(), EmailsModule(), JobsModule(), LeadsModule(), LogViewer(), LogViewerProps (+13 more)

### Community 15 - "Billing API"
Cohesion: 0.10
Nodes (15): Billing Checkout API, Billing Webhook API, POST(), POST(), verifySignature(), LemonSqueezy Library, createCheckoutSession(), getPlanFromVariant() (+7 more)

### Community 16 - "Wizard Flow"
Cohesion: 0.13
Nodes (18): multi-step wizard flow, STEPS, EmailDomain, STEPS, KeysWizardPage(), PROVIDERS, STEPS, SERVICE_SUGGESTIONS (+10 more)

### Community 17 - "PostHog Analytics"
Cohesion: 0.13
Nodes (26): AnalyticsEvent, EVENT_COLORS, EventsTab(), FEATURE_FLAGS, FeatureFlag, FlagsTab(), formatProps(), formatTime() (+18 more)

### Community 18 - "Notification System"
Cohesion: 0.12
Nodes (22): notify(), COMMON_EMOJIS, ContentState, CtaContent, CtaTab(), DEFAULTS, FaqItem, FaqTab() (+14 more)

### Community 19 - "API Hub"
Cohesion: 0.15
Nodes (19): ApiHubModule(), getProvider(), PROVIDERS, Tab, TasksTab(), formatPeriod(), formatPrice(), getEnvValue() (+11 more)

### Community 20 - "Community 20"
Cohesion: 0.10
Nodes (23): ActivityLog, Audit, AuditResult, AuthUser, Company, CompanyWithContact, Contact, Draft (+15 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (23): MCP API Route - External tool server (audit_site, list_leads, get_audit, send_pitch), Org API Route - Organization CRUD, Overview API Route - Dashboard metrics and pipeline stats, Plans API Route - Fetch active subscription plans, Prospects API Route - CRUD for prospect companies with contacts, Reject API Route - Mark prospect as rejected with audit trail, Search API Route - Semantic company search via pgvector and Cohere embeddings, Send Reply API Route - Email sending with templates, rate limiting, and usage tracking (+15 more)

### Community 22 - "Community 22"
Cohesion: 0.09
Nodes (22): dependencies, cohere-ai, dotenv, @google/generative-ai, jsdom, @mozilla/readability, openai, posthog-node (+14 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (17): POST(), POST(), GET(), POST(), sendWelcomeMessage(), API_ID, apiCredentials, authEntries (+9 more)

### Community 24 - "Community 24"
Cohesion: 0.15
Nodes (16): addKey(), deleteKey(), forceRefresh(), getConfig(), getKeys(), getKeysRaw(), getProviderStatus(), PROVIDERS (+8 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (16): DashboardLayout(), DashboardContent(), pageTitles, DashboardShell(), SidebarContext, SidebarContextType, useSidebar(), SetupRequiredModal() (+8 more)

### Community 26 - "Community 26"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (9): Email, InboxPage(), Template, Thread, TelegramConfig, TelegramLead, PageTracker(), identifyUser() (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, concurrently, cross-env, electron, electron-builder, lucide-react, oxlint (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.12
Nodes (19): settings, Toast, supabase, Titlebar, types, UsersModule, WebsiteModule, WorkerModule (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (17): Telegram Leads API, MCP Integrations API, Webhooks Integrations API, limits and usage tracking, Plan-Based Feature Gating, plan-based feature gating, GET(), Limits Library (+9 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (16): author, email, name, bin, knight-admin, description, homepage, license (+8 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (17): Deploy Script, Scheduled Jobs Migration, Webhooks & MCP Keys Migration, Cohere Provider Adapter, Gemini Provider Adapter, Groq Provider Adapter, OpenRouter Provider Adapter, Supabase CLI Tool (+9 more)

### Community 35 - "Community 35"
Cohesion: 0.21
Nodes (15): CONTACT_METHOD_ICONS, formatTime(), getInitials(), getPriorityBadge(), getStatusBadge(), getSubmissionStatusBadge(), PRIORITY_CONFIG, Reply (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.20
Nodes (14): per-user-admin-controls-design.md, AI sales agent, drip sequence, complete(), getActiveKeysForProvider(), markKeyFailed(), markKeyUsed(), analyzeWithGroq() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.13
Nodes (15): build, appId, copyright, directories, extraResources, files, icon, productName (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.26
Nodes (10): SettingsModule(), COLORS, ICONS, ToastContainer(), AppSettings, DEFAULTS, getSetting(), loadSettings() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.30
Nodes (10): getGlobalConfig(), supabase, analyzeWithCohere(), extractContacts(), extractSemanticBusinessData(), fetchLighthouseData(), fetchViaAgent(), fetchWithProxy() (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.18
Nodes (11): scripts, build, build:linux, build:mac, build:win, cli, dev, icon (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (10): dependencies, electron-updater, react, react-dom, tslib, ws, vite, React Logo (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.24
Nodes (9): companies, contacts, daysAgo(), pitchBody(), pitchSubjects, rejectBodies, replyBodies, run() (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.28
Nodes (9): Settings Keys Route - Bring Your Own API keys (Cohere, Gemini, OpenRouter), Telegram Action Route - Approve/decline/takeover Telegram leads, Telegram Auth Confirm Route - Send connection confirmation via Knight bot, Telegram Auth Start Route - Initiate Telegram phone verification with code, Telegram Auth Status Route - Check Telegram session connection status, Telegram Auth Verify Route - Complete Telegram auth with code/password, save session, Telegram - Messaging platform for lead generation, planHasFeature - Plan-gating for features (telegram, byok) (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.31
Nodes (6): DashboardPage(), formatJobType(), getStatusStyle(), OverviewData, PERIODS, timeAgo()

### Community 45 - "Community 45"
Cohesion: 0.28
Nodes (8): CATEGORIES, formatTime(), PRIORITY_CONFIG, Reply, STATUS_CONFIG, SupportPage(), Ticket, timeAgo()

### Community 46 - "Community 46"
Cohesion: 0.31
Nodes (4): metadata, Providers(), SentryUserProvider(), UpdateChecker()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (3): ErrorBoundary, Props, State

### Community 48 - "Community 48"
Cohesion: 0.54
Nodes (7): formatTable(), http, main(), printResult(), runHttp(), runShell(), usage()

### Community 49 - "Community 49"
Cohesion: 0.25
Nodes (6): ConfigEntry, ENV_SECTIONS, EnvEntry, GLOBAL_CATEGORIES, GLOBAL_ORDER, IntegrationsModule()

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (6): analytics system, auth system, kill-switch system, DEFAULT_FLAGS, KillSwitches, kill-switches

### Community 51 - "Community 51"
Cohesion: 0.29
Nodes (6): columns, Company, Contact, ProspectsPage(), sortOptions, timeAgo()

### Community 52 - "Community 52"
Cohesion: 0.43
Nodes (7): captureEvent(), eventBuffer, flagCache, flush(), flushEvents(), getClient(), isFeatureEnabled()

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): mac, artifactName, category, gatekeeperAssess, hardenedRuntime, icon, target

### Community 54 - "Community 54"
Cohesion: 0.48
Nodes (7): EnterprisePage, PricingPage, PrivacyPage, RefundPage, SecurityPage, Footer, Navbar

### Community 55 - "Community 55"
Cohesion: 0.38
Nodes (5): authenticate(), handleTool(), POST(), supabase, TOOLS

### Community 56 - "Community 56"
Cohesion: 0.38
Nodes (6): DEFAULT_TEMPLATES, DELETE(), GET(), POST(), PUT(), tableExists()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (4): Audit, AuditResult, AuditsPage(), timeAgo()

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (4): eslint config, fs, Jimp, postcss config

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (7): Electron App Icon 128x128, Electron App Icon 16x16, Electron App Icon 256x256, Electron App Icon 32x32, Electron App Icon 48x48, Electron App Icon 512x512, Electron App Icon 64x64

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (6): nsis, allowToChangeInstallationDirectory, createDesktopShortcut, createStartMenuShortcut, oneClick, shortcutName

### Community 61 - "Community 61"
Cohesion: 0.47
Nodes (5): generateDNSRecords(), GET(), POST(), PUT(), verifyDNSRecord()

### Community 62 - "Community 62"
Cohesion: 0.47
Nodes (3): AuthHero(), generateSpherePoints(), SphereCanvas()

### Community 63 - "Community 63"
Cohesion: 0.47
Nodes (5): BillingPage(), formatPeriod(), formatPrice(), PlanData, UsageData

### Community 66 - "Community 66"
Cohesion: 0.47
Nodes (4): AES-256-GCM encryption, decrypt(), encrypt(), getKey()

### Community 67 - "Community 67"
Cohesion: 0.33
Nodes (3): heartbeatInterval, missing, required

### Community 68 - "Community 68"
Cohesion: 0.40
Nodes (5): linux, artifactName, category, icon, target

### Community 70 - "Community 70"
Cohesion: 0.40
Nodes (5): PageTracker, Providers, SentryUserProvider, Dashboard shell layout pattern, Modular landing page composition

### Community 72 - "Community 72"
Cohesion: 0.40
Nodes (3): Template, TEMPLATE_TYPES, VARIABLES

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 77 - "Community 77"
Cohesion: 0.50
Nodes (4): companies, randomBetween(), run(), supabase

### Community 78 - "Community 78"
Cohesion: 0.50
Nodes (4): fs, loadEnv(), main(), path

### Community 79 - "Community 79"
Cohesion: 0.70
Nodes (4): captureEvent(), flush(), getPostHog(), isFeatureEnabled()

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (4): Auth Layout, FadeIn/ScaleIn animation components, Auth Hero Component, TemplateManager

### Community 81 - "Community 81"
Cohesion: 0.83
Nodes (3): buildChartData(), GET(), getPeriodRange()

### Community 82 - "Community 82"
Cohesion: 0.83
Nodes (3): GET(), getToken(), PATCH()

### Community 83 - "Community 83"
Cohesion: 0.67
Nodes (3): GET(), getBuildVersion(), VERSION_FILE

### Community 85 - "Community 85"
Cohesion: 1.00
Nodes (3): Error Sound Effect, Notification Sound Effect, Success Sound Effect

### Community 88 - "Community 88"
Cohesion: 0.67
Nodes (3): analytics_flags table, GET /api/analytics/flags, PATCH /api/analytics/flags/[id]/toggle

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (3): Michelangelo Creation of Adam, Hands Image, Hands Icon

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (3): AboutPage, AcceptableUsePage, AIPolicyPage

## Ambiguous Edges - Review These
- `UpdateChecker.tsx` → `analytics.ts`  [AMBIGUOUS]
  components/UpdateChecker.tsx · relation: conceptually_related_to
- `Auth Hero Component` → `FadeIn/ScaleIn animation components`  [AMBIGUOUS]
  components/AuthHero.tsx · relation: conceptually_related_to
- `per-user-admin-controls-design.md` → `common-issues.md`  [AMBIGUOUS]
  /home/kenz/Projects/Knight/docs/superpowers/specs/2026-07-28-per-user-admin-controls-design.md · relation: conceptually_related_to

## Knowledge Gaps
- **597 isolated node(s):** `http`, `name`, `version`, `description`, `name` (+592 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `UpdateChecker.tsx` and `analytics.ts`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Auth Hero Component` and `FadeIn/ScaleIn animation components`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `per-user-admin-controls-design.md` and `common-issues.md`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Supabase Client` connect `Analytics Events` to `API Routes`, `Dashboard Pages`, `Config API`, `Template System`, `Audit API`, `Page Routes`, `Similar Companies`, `Billing API`, `Community 81`, `Community 82`, `Community 50`, `Community 54`, `Community 23`, `Community 56`, `Community 27`, `Community 61`, `Community 31`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `createServiceClient()` connect `API Routes` to `Dashboard Pages`, `Template System`, `Audit API`, `Page Routes`, `Similar Companies`, `Analytics Events`, `Billing API`, `Community 81`, `Community 82`, `Community 23`, `Community 56`, `Community 25`, `Community 61`, `Community 31`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `PersonsTab()` connect `PostHog Analytics` to `API Hub`, `Billing API`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Supabase Client` (e.g. with `analytics.ts` and `logger.ts`) actually correct?**
  _`Supabase Client` has 2 INFERRED edges - model-reasoned connections that need verification._