-- =====================================================================
-- Cortracker Timesheet Management System
-- Database schema (Microsoft SQL Server / T-SQL)
--
-- Naming convention:
--   - tables:            plural, snake_case                (users, timesheet_entries)
--   - primary keys:      <singular_table_name>_id           (user_id, entry_id)
--   - foreign keys:      named after the column they hold   (role_id, approved_by)
--   - constraints:       PK_ / FK_ / UQ_ / CK_ / DF_ / IX_ prefixes
--
-- Design notes:
--   - Every screen's data need is covered by exactly one table below —
--     nothing is duplicated between roles. Super Admin, Super Admin
--     (Manager), HR, Editor/Contributor, Contributor (View), Resource
--     Manager (View) and Candidate are the SAME `users` table, only
--     distinguished by `role_id`. The two "Super Administrator" demo
--     accounts (Naresh Kumar, Srikanth Boora) are simply two rows with
--     the same role_id.
--   - Role -> menu and Role -> permission are many-to-many join tables
--     (role_menus, role_permissions), matching the Roles & Access
--     screen exactly: you tick which menus a role can open and which
--     actions it can perform, and every user under that role inherits
--     it automatically. There is no per-user permission table because
--     the UI we built never exposed per-user overrides — only
--     per-role — so add one later only if that becomes a real need.
--   - Timesheets are stored at DAILY grain (one row per user per date,
--     enforced by a UNIQUE constraint — this is what "duplicate rows
--     are rejected" in the Bulk Upload validation rules maps to).
--     Weekly figures (My History, Dashboard's "Week progress") are
--     derived by GROUP BY on this table, not stored separately, so
--     there is nothing to keep in sync and no duplicate source of truth.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Reference data: companies & teams
--    (the "All companies" / "All teams" filters seen on every list page)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.companies (
    company_id      INT             IDENTITY(1,1) NOT NULL,
    company_name    NVARCHAR(200)   NOT NULL,
    created_at      DATETIME2(0)    NOT NULL CONSTRAINT DF_companies_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_companies PRIMARY KEY (company_id),
    CONSTRAINT UQ_companies_company_name UNIQUE (company_name)
);

CREATE TABLE dbo.teams (
    team_id         INT             IDENTITY(1,1) NOT NULL,
    team_name       NVARCHAR(100)   NOT NULL,          -- 'USA team', 'India team', 'UK team'
    dial_code       VARCHAR(6)      NOT NULL,          -- '+1', '+91', '+44'
    created_at      DATETIME2(0)    NOT NULL CONSTRAINT DF_teams_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_teams PRIMARY KEY (team_id),
    CONSTRAINT UQ_teams_team_name UNIQUE (team_name)
);

-- ---------------------------------------------------------------------
-- 2. RBAC: roles, menus, permissions + join tables
--    (the Roles & Access screen manages these three tables directly)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.roles (
    role_id         INT             IDENTITY(1,1) NOT NULL,
    role_key        VARCHAR(50)     NOT NULL,          -- 'super_administrator'
    role_name       NVARCHAR(100)   NOT NULL,          -- 'Super Administrator'
    description     NVARCHAR(300)   NULL,
    is_built_in     BIT             NOT NULL CONSTRAINT DF_roles_is_built_in DEFAULT (0), -- 'Fixed — cannot be changed'
    created_at      DATETIME2(0)    NOT NULL CONSTRAINT DF_roles_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at      DATETIME2(0)    NOT NULL CONSTRAINT DF_roles_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_roles PRIMARY KEY (role_id),
    CONSTRAINT UQ_roles_role_key UNIQUE (role_key),
    CONSTRAINT UQ_roles_role_name UNIQUE (role_name)
);

CREATE TABLE dbo.menus (
    menu_id         INT             IDENTITY(1,1) NOT NULL,
    menu_key        VARCHAR(50)     NOT NULL,          -- 'timesheet_approvals'
    menu_label      NVARCHAR(100)   NOT NULL,          -- 'Timesheet Approvals'
    description     NVARCHAR(300)   NULL,
    display_order   INT             NOT NULL CONSTRAINT DF_menus_display_order DEFAULT (0),
    CONSTRAINT PK_menus PRIMARY KEY (menu_id),
    CONSTRAINT UQ_menus_menu_key UNIQUE (menu_key)
);

CREATE TABLE dbo.permissions (
    permission_id   INT             IDENTITY(1,1) NOT NULL,
    permission_key  VARCHAR(50)     NOT NULL,          -- 'approve_timesheets'
    permission_name NVARCHAR(100)   NOT NULL,          -- 'Approve timesheets'
    description     NVARCHAR(300)   NULL,
    CONSTRAINT PK_permissions PRIMARY KEY (permission_id),
    CONSTRAINT UQ_permissions_permission_key UNIQUE (permission_key)
);

CREATE TABLE dbo.role_menus (
    role_id         INT             NOT NULL,
    menu_id         INT             NOT NULL,
    CONSTRAINT PK_role_menus PRIMARY KEY (role_id, menu_id),
    CONSTRAINT FK_role_menus_role FOREIGN KEY (role_id) REFERENCES dbo.roles (role_id) ON DELETE CASCADE,
    CONSTRAINT FK_role_menus_menu FOREIGN KEY (menu_id) REFERENCES dbo.menus (menu_id) ON DELETE CASCADE
);

CREATE TABLE dbo.role_permissions (
    role_id         INT             NOT NULL,
    permission_id   INT             NOT NULL,
    CONSTRAINT PK_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT FK_role_permissions_role FOREIGN KEY (role_id) REFERENCES dbo.roles (role_id) ON DELETE CASCADE,
    CONSTRAINT FK_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES dbo.permissions (permission_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 3. Users
--    (Login, People, Roles & Access "People" table, My Profile)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.users (
    user_id                INT             IDENTITY(1,1) NOT NULL,
    first_name              NVARCHAR(100)   NOT NULL,
    last_name                NVARCHAR(100)   NOT NULL,
    email                      NVARCHAR(254)   NOT NULL,
    password_hash               VARBINARY(256)  NOT NULL,
    phone_dial_code                VARCHAR(6)      NULL,
    phone_number                     VARCHAR(20)     NULL,
    date_of_birth                      DATE            NULL,           -- candidates
    role_id                              INT             NOT NULL,
    company_id                             INT             NULL,
    team_id                                  INT             NULL,
    manager_id                                 INT             NULL,       -- self-FK: reports to / approver
    account_status                              VARCHAR(20)     NOT NULL CONSTRAINT DF_users_account_status DEFAULT ('Active'),
    joining_date                                  DATE            NULL,
    onboarded_on                                    DATE            NULL,
    onboarding_request_id                             INT             NULL,       -- FK added below, after onboarding_requests exists
    created_at                                          DATETIME2(0)    NOT NULL CONSTRAINT DF_users_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at                                            DATETIME2(0)    NOT NULL CONSTRAINT DF_users_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_users PRIMARY KEY (user_id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT FK_users_role FOREIGN KEY (role_id) REFERENCES dbo.roles (role_id),
    CONSTRAINT FK_users_company FOREIGN KEY (company_id) REFERENCES dbo.companies (company_id),
    CONSTRAINT FK_users_team FOREIGN KEY (team_id) REFERENCES dbo.teams (team_id),
    CONSTRAINT FK_users_manager FOREIGN KEY (manager_id) REFERENCES dbo.users (user_id),
    CONSTRAINT CK_users_account_status CHECK (account_status IN ('Active', 'Inactive', 'Suspended'))
);

CREATE INDEX IX_users_role_id ON dbo.users (role_id);
CREATE INDEX IX_users_company_team ON dbo.users (company_id, team_id);

-- ---------------------------------------------------------------------
-- 4. Onboarding & registration requests
--    (candidate self-onboarding form, Register Manager form,
--     Onboarding Approvals screen)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.onboarding_requests (
    request_id          INT             IDENTITY(1,1) NOT NULL,
    request_type         VARCHAR(20)     NOT NULL,      -- 'Candidate' | 'Resource Manager'
    first_name            NVARCHAR(100)   NOT NULL,
    last_name               NVARCHAR(100)   NOT NULL,
    email                     NVARCHAR(254)   NOT NULL,
    phone_dial_code             VARCHAR(6)      NULL,
    phone_number                  VARCHAR(20)     NULL,
    date_of_birth                   DATE            NULL,
    joining_date                      DATE            NULL,
    team_id                             INT             NULL,
    company_id                            INT             NULL,
    status                                   VARCHAR(20)     NOT NULL CONSTRAINT DF_onboarding_requests_status DEFAULT ('Pending'),
    flag_reason                                NVARCHAR(200)   NULL,       -- 'Name contains digits', etc.
    submitted_at                                  DATETIME2(0)    NOT NULL CONSTRAINT DF_onboarding_requests_submitted_at DEFAULT (SYSUTCDATETIME()),
    decided_by                                       INT             NULL,       -- FK users: who approved/rejected
    decided_at                                          DATETIME2(0)    NULL,
    resulting_user_id                                      INT             NULL,       -- FK users: account created on approval
    CONSTRAINT PK_onboarding_requests PRIMARY KEY (request_id),
    CONSTRAINT FK_onboarding_requests_team FOREIGN KEY (team_id) REFERENCES dbo.teams (team_id),
    CONSTRAINT FK_onboarding_requests_company FOREIGN KEY (company_id) REFERENCES dbo.companies (company_id),
    CONSTRAINT FK_onboarding_requests_decided_by FOREIGN KEY (decided_by) REFERENCES dbo.users (user_id),
    CONSTRAINT FK_onboarding_requests_resulting_user FOREIGN KEY (resulting_user_id) REFERENCES dbo.users (user_id),
    CONSTRAINT CK_onboarding_requests_status CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    CONSTRAINT CK_onboarding_requests_request_type CHECK (request_type IN ('Candidate', 'Resource Manager'))
);

ALTER TABLE dbo.users
    ADD CONSTRAINT FK_users_onboarding_request FOREIGN KEY (onboarding_request_id) REFERENCES dbo.onboarding_requests (request_id);

-- ---------------------------------------------------------------------
-- 5. Timesheets — one row per user per calendar day
--    (My Timesheet, Timesheet Approvals, Timesheets, Dashboard,
--     My History, Bulk Upload's imported rows)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.timesheet_entries (
    entry_id                   INT             IDENTITY(1,1) NOT NULL,
    user_id                      INT             NOT NULL,
    work_date                      DATE            NOT NULL,
    log_in_time                      TIME(0)         NULL,
    log_out_time                       TIME(0)         NULL,
    break_minutes                        INT             NOT NULL CONSTRAINT DF_timesheet_entries_break_minutes DEFAULT (0),
    task                                    NVARCHAR(80)    NULL,
    description                               NVARCHAR(500)   NULL,
    hours_worked                                AS (CASE
                                                        WHEN log_in_time IS NOT NULL AND log_out_time IS NOT NULL
                                                        THEN ROUND(DATEDIFF(MINUTE, log_in_time, log_out_time) / 60.0 - break_minutes / 60.0, 2)
                                                        ELSE NULL
                                                      END) PERSISTED,
    status                                        VARCHAR(20)     NOT NULL CONSTRAINT DF_timesheet_entries_status DEFAULT ('Not entered'),
    is_flagged                                       BIT             NOT NULL CONSTRAINT DF_timesheet_entries_is_flagged DEFAULT (0),
    flag_reason                                        NVARCHAR(200)   NULL,
    submitted_at                                          DATETIME2(0)    NULL,
    approved_by                                             INT             NULL,       -- FK users: the manager who decided
    approved_at                                                DATETIME2(0)    NULL,
    rejected_reason                                              NVARCHAR(300)   NULL,
    source_bulk_upload_row_id                                      INT             NULL,       -- FK added below
    created_at                                                        DATETIME2(0)    NOT NULL CONSTRAINT DF_timesheet_entries_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at                                                          DATETIME2(0)    NOT NULL CONSTRAINT DF_timesheet_entries_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_timesheet_entries PRIMARY KEY (entry_id),
    CONSTRAINT UQ_timesheet_entries_user_work_date UNIQUE (user_id, work_date),    -- "duplicate rows are rejected"
    CONSTRAINT FK_timesheet_entries_user FOREIGN KEY (user_id) REFERENCES dbo.users (user_id),
    CONSTRAINT FK_timesheet_entries_approved_by FOREIGN KEY (approved_by) REFERENCES dbo.users (user_id),
    CONSTRAINT CK_timesheet_entries_status CHECK (status IN ('Not entered', 'Draft', 'Saved', 'Pending', 'Approved', 'Rejected', 'Upcoming')),
    CONSTRAINT CK_timesheet_entries_break_minutes CHECK (break_minutes >= 0)
);

CREATE INDEX IX_timesheet_entries_user_status ON dbo.timesheet_entries (user_id, status);
CREATE INDEX IX_timesheet_entries_work_date ON dbo.timesheet_entries (work_date);

-- ---------------------------------------------------------------------
-- 6. Live clock punches (optional) — powers the clock-in card /
--    "Live attendance today" widget. The row a manager approves is
--    still timesheet_entries; this table is just the raw punch trail.
-- ---------------------------------------------------------------------
CREATE TABLE dbo.time_clock_events (
    event_id        INT             IDENTITY(1,1) NOT NULL,
    user_id         INT             NOT NULL,
    event_type      VARCHAR(20)     NOT NULL,          -- 'Clock In' | 'Clock Out' | 'Break Start' | 'Break End'
    event_time      DATETIME2(0)    NOT NULL CONSTRAINT DF_time_clock_events_event_time DEFAULT (SYSUTCDATETIME()),
    entry_id        INT             NULL,               -- FK timesheet_entries: the day it rolls up into
    CONSTRAINT PK_time_clock_events PRIMARY KEY (event_id),
    CONSTRAINT FK_time_clock_events_user FOREIGN KEY (user_id) REFERENCES dbo.users (user_id),
    CONSTRAINT FK_time_clock_events_entry FOREIGN KEY (entry_id) REFERENCES dbo.timesheet_entries (entry_id),
    CONSTRAINT CK_time_clock_events_event_type CHECK (event_type IN ('Clock In', 'Clock Out', 'Break Start', 'Break End'))
);

CREATE INDEX IX_time_clock_events_user_time ON dbo.time_clock_events (user_id, event_time);

-- ---------------------------------------------------------------------
-- 7. Bulk upload (Bulk Upload screen)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.bulk_upload_batches (
    batch_id        INT             IDENTITY(1,1) NOT NULL,
    uploaded_by     INT             NOT NULL,
    file_name       NVARCHAR(260)   NOT NULL,
    uploaded_at     DATETIME2(0)    NOT NULL CONSTRAINT DF_bulk_upload_batches_uploaded_at DEFAULT (SYSUTCDATETIME()),
    total_rows      INT             NOT NULL CONSTRAINT DF_bulk_upload_batches_total_rows DEFAULT (0),
    valid_rows      INT             NOT NULL CONSTRAINT DF_bulk_upload_batches_valid_rows DEFAULT (0),
    error_rows      INT             NOT NULL CONSTRAINT DF_bulk_upload_batches_error_rows DEFAULT (0),
    CONSTRAINT PK_bulk_upload_batches PRIMARY KEY (batch_id),
    CONSTRAINT FK_bulk_upload_batches_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES dbo.users (user_id)
);

CREATE TABLE dbo.bulk_upload_rows (
    row_id                INT             IDENTITY(1,1) NOT NULL,
    batch_id                INT             NOT NULL,
    row_number                 INT             NOT NULL,
    candidate_email               NVARCHAR(254)   NOT NULL,
    work_date                       DATE            NULL,
    log_in_time                       VARCHAR(10)     NULL,       -- raw text as uploaded, e.g. '9:00 AM'
    log_out_time                        VARCHAR(10)     NULL,
    break_minutes                         INT             NULL,
    task                                    NVARCHAR(80)    NULL,
    description                               NVARCHAR(500)   NULL,
    validation_status                           VARCHAR(20)     NOT NULL CONSTRAINT DF_bulk_upload_rows_validation_status DEFAULT ('Pending'),
    error_message                                 NVARCHAR(300)   NULL,
    resulting_entry_id                              INT             NULL,       -- FK timesheet_entries: set once imported
    CONSTRAINT PK_bulk_upload_rows PRIMARY KEY (row_id),
    CONSTRAINT FK_bulk_upload_rows_batch FOREIGN KEY (batch_id) REFERENCES dbo.bulk_upload_batches (batch_id) ON DELETE CASCADE,
    CONSTRAINT FK_bulk_upload_rows_resulting_entry FOREIGN KEY (resulting_entry_id) REFERENCES dbo.timesheet_entries (entry_id),
    CONSTRAINT CK_bulk_upload_rows_validation_status CHECK (validation_status IN ('Pending', 'Valid', 'Error', 'Imported'))
);

ALTER TABLE dbo.timesheet_entries
    ADD CONSTRAINT FK_timesheet_entries_bulk_upload_row FOREIGN KEY (source_bulk_upload_row_id) REFERENCES dbo.bulk_upload_rows (row_id);

-- ---------------------------------------------------------------------
-- 8. Activity log & simulated email alerts (Activity Log screen)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.activity_logs (
    log_id          INT             IDENTITY(1,1) NOT NULL,
    actor_user_id   INT             NULL,               -- NULL = system-generated event
    category        VARCHAR(20)     NOT NULL,           -- 'Submissions' | 'Approvals' | 'Edits & roles' | 'Alerts'
    action_summary  NVARCHAR(200)   NOT NULL,           -- "edited Jordan Alvarez's timesheet"
    description     NVARCHAR(500)   NULL,
    related_table   VARCHAR(50)     NULL,               -- 'timesheet_entries', 'onboarding_requests', ...
    related_id      INT             NULL,
    occurred_at     DATETIME2(0)    NOT NULL CONSTRAINT DF_activity_logs_occurred_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_activity_logs PRIMARY KEY (log_id),
    CONSTRAINT FK_activity_logs_actor FOREIGN KEY (actor_user_id) REFERENCES dbo.users (user_id),
    CONSTRAINT CK_activity_logs_category CHECK (category IN ('Submissions', 'Approvals', 'Edits & roles', 'Alerts'))
);

CREATE INDEX IX_activity_logs_occurred_at ON dbo.activity_logs (occurred_at DESC);

CREATE TABLE dbo.email_alerts (
    alert_id            INT             IDENTITY(1,1) NOT NULL,
    recipient_user_id   INT             NULL,           -- FK users; NULL if recipient isn't a user yet (e.g. rejected candidate)
    recipient_label      NVARCHAR(200)   NOT NULL,           -- denormalized display fallback
    subject                 NVARCHAR(200)   NOT NULL,
    activity_log_id            INT             NULL,           -- FK activity_logs: the event that triggered it
    sent_at                       DATETIME2(0)    NOT NULL CONSTRAINT DF_email_alerts_sent_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_email_alerts PRIMARY KEY (alert_id),
    CONSTRAINT FK_email_alerts_recipient FOREIGN KEY (recipient_user_id) REFERENCES dbo.users (user_id),
    CONSTRAINT FK_email_alerts_activity_log FOREIGN KEY (activity_log_id) REFERENCES dbo.activity_logs (log_id)
);

-- =====================================================================
-- SEED DATA — RBAC backbone
-- Reproduces exactly the roles/menus/permissions built into the app,
-- one row per role/menu/permission, no duplicates.
-- =====================================================================

-- ---- Companies & teams ----
INSERT INTO dbo.companies (company_name) VALUES
    (N'Cortracker Inc'),
    (N'Perfect Solutions Group Inc'),
    (N'Others');

INSERT INTO dbo.teams (team_name, dial_code) VALUES
    (N'USA team', '+1'),
    (N'India team', '+91'),
    (N'UK team', '+44');

-- ---- Menus (union of every nav tab across every role) ----
INSERT INTO dbo.menus (menu_key, menu_label, display_order) VALUES
    ('dashboard',            N'Dashboard',            1),
    ('onboarding',           N'Onboarding',           2),
    ('timesheet_approvals',  N'Timesheet Approvals',  3),
    ('timesheets',           N'Timesheets',           4),
    ('bulk_upload',          N'Bulk Upload',          5),
    ('people',               N'People',               6),
    ('roles_access',         N'Roles & Access',       7),
    ('activity_log',         N'Activity Log',         8),
    ('my_timesheet',         N'My Timesheet',         9),
    ('upload_hours',         N'Upload Hours',        10),
    ('my_history',           N'My History',          11),
    ('my_profile',           N'My Profile',          12);

-- ---- Permissions ----
INSERT INTO dbo.permissions (permission_key, permission_name) VALUES
    ('approve_timesheets', N'Approve timesheets'),
    ('edit_timesheets',    N'Edit timesheets'),
    ('bulk_upload',        N'Bulk upload'),
    ('approve_onboarding', N'Approve onboarding'),
    ('manage_roles_users', N'Manage roles & users');

-- ---- Roles ----
INSERT INTO dbo.roles (role_key, role_name, description, is_built_in) VALUES
    ('super_administrator',  N'Super Administrator',    N'Full control of every menu and permission.', 1),
    ('hr',                   N'HR',                     N'Reviews onboarding and oversees candidate records.', 0),
    ('editor_contributor',   N'Editor / Contributor',   N'Logs and edits day-to-day timesheet entries.', 0),
    ('contributor_view',     N'Contributor (View)',     N'Read-only visibility into timesheets and approvals.', 0),
    ('resource_manager_view',N'Resource Manager (View)',N'Read-only visibility into resourcing.', 0),
    ('candidate',            N'Candidate',              N'Self-service — logs time and tracks onboarding status.', 1);

-- ---- Role -> Menu access (exactly what each role's nav shows today) ----
INSERT INTO dbo.role_menus (role_id, menu_id)
SELECT r.role_id, m.menu_id FROM dbo.roles r CROSS JOIN dbo.menus m
WHERE r.role_key = 'super_administrator'
  AND m.menu_key IN ('dashboard','onboarding','timesheet_approvals','timesheets','bulk_upload','people','roles_access','activity_log');

INSERT INTO dbo.role_menus (role_id, menu_id)
SELECT r.role_id, m.menu_id FROM dbo.roles r CROSS JOIN dbo.menus m
WHERE r.role_key = 'hr'
  AND m.menu_key IN ('dashboard','onboarding','timesheet_approvals','timesheets','people','activity_log');

INSERT INTO dbo.role_menus (role_id, menu_id)
SELECT r.role_id, m.menu_id FROM dbo.roles r CROSS JOIN dbo.menus m
WHERE r.role_key = 'editor_contributor'
  AND m.menu_key IN ('dashboard','timesheet_approvals','timesheets','bulk_upload','activity_log');

INSERT INTO dbo.role_menus (role_id, menu_id)
SELECT r.role_id, m.menu_id FROM dbo.roles r CROSS JOIN dbo.menus m
WHERE r.role_key = 'contributor_view'
  AND m.menu_key IN ('dashboard','timesheet_approvals','timesheets','activity_log');

INSERT INTO dbo.role_menus (role_id, menu_id)
SELECT r.role_id, m.menu_id FROM dbo.roles r CROSS JOIN dbo.menus m
WHERE r.role_key = 'resource_manager_view'
  AND m.menu_key IN ('dashboard','timesheets');

INSERT INTO dbo.role_menus (role_id, menu_id)
SELECT r.role_id, m.menu_id FROM dbo.roles r CROSS JOIN dbo.menus m
WHERE r.role_key = 'candidate'
  AND m.menu_key IN ('dashboard','my_timesheet','upload_hours','my_history','my_profile');

-- ---- Role -> Permission grants ----
INSERT INTO dbo.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM dbo.roles r CROSS JOIN dbo.permissions p
WHERE r.role_key = 'super_administrator';   -- Super Admin gets every permission

INSERT INTO dbo.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM dbo.roles r CROSS JOIN dbo.permissions p
WHERE r.role_key = 'hr' AND p.permission_key IN ('approve_onboarding','edit_timesheets');

INSERT INTO dbo.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM dbo.roles r CROSS JOIN dbo.permissions p
WHERE r.role_key = 'editor_contributor' AND p.permission_key IN ('edit_timesheets','bulk_upload');

-- contributor_view, resource_manager_view and candidate get no permissions:
-- their menus are all read-only, so absence of a permission row IS the
-- "view only" restriction — no separate is_view_only flag needed.

-- =====================================================================
-- QUICK START — create one working Super Admin login
-- Run this block after the schema + RBAC seed data above.
-- Demo password used across this app is Demo@123 (matches the login
-- page's demo accounts). HASHBYTES/SHA2_256 is used here only so this
-- script is runnable stand-alone — swap this for your real password
-- hashing (bcrypt/argon2 in application code) before going to prod.
-- =====================================================================
DECLARE @companyId INT = (SELECT company_id FROM dbo.companies WHERE company_name = N'Cortracker Inc');
DECLARE @teamId     INT = (SELECT team_id FROM dbo.teams WHERE team_name = N'USA team');
DECLARE @roleId     INT = (SELECT role_id FROM dbo.roles WHERE role_key = 'super_administrator');

INSERT INTO dbo.users (
    first_name, last_name, email, password_hash,
    phone_dial_code, phone_number, role_id, company_id, team_id,
    account_status, joining_date
)
VALUES (
    N'Naresh', N'Kumar', 'superadmin@cortracker360.com',
    HASHBYTES('SHA2_256', 'Demo@123'),
    '+1', '234-567-8910', @roleId, @companyId, @teamId,
    'Active', '2023-01-06'
);

-- Log in with:
--   email:    superadmin@cortracker360.com
--   password: Demo@123
