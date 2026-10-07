# OrangeHRM Playwright Automation Framework

## 📌 Project Overview

This is an end-to-end UI and API automation framework built using **Playwright** with **TypeScript** for the OrangeHRM application.

The framework follows the **Page Object Model (POM)** design pattern and focuses on clean architecture, reusable components, maintainability, and scalable test automation practices.

It includes automated coverage for authentication, dashboard validation, employee management, admin user management, logout, and authenticated API validation.

The framework also includes **GitHub Actions CI integration** to run smoke tests automatically on push and pull request events.

---

## 🚀 Tech Stack

- Playwright
- TypeScript
- Node.js
- Playwright Test Runner
- GitHub Actions
- dotenv
- Allure Reporting
- k6 (API performance testing)

---

## 📂 Project Structure

```text
OrangeHRM
│
├── .github/workflows
│   ├── playwright-smoke.yml
│   └── playwright-regression.yml
│
├── constants
│   ├── Routes.ts
│   └── Messages.ts
│
├── fixtures
│   └── fixtures.ts
│
├── pages
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── AdminPage.ts
│   ├── AddUserPage.ts
│   ├── PIMPage.ts
│   ├── AddEmployeePage.ts
│   ├── EmployeeDetailsPage.ts
│   ├── DeleteEmployeePage.ts
│   └── LogoutPage.ts
│
├── tests
│   ├── Authentication
│   ├── Admin
│   ├── Employee E2E
│   ├── API
│   └── Smoke
│
├── test-data
│   ├── login.json
│   ├── users.json
│   ├── employee.json
│   └── profile.jpg
│
├── utils
│   └── RandomGenerator.ts
│
├── k6
│   ├── lib
│   │   ├── config.js
│   │   ├── auth.js
│   │   ├── api.js
│   │   ├── scenarios.js
│   │   └── lifecycle.js
│   ├── tests
│   │   ├── auth-login.test.js
│   │   ├── dashboard.test.js
│   │   ├── pim-employee-list.test.js
│   │   ├── pim-employee-details.test.js
│   │   ├── admin-users.test.js
│   │   ├── admin-reference-data.test.js
│   │   ├── directory.test.js
│   │   ├── leave-list.test.js
│   │   ├── time-timesheets.test.js
│   │   ├── attendance-summary.test.js
│   │   ├── recruitment.test.js
│   │   └── buzz-feed.test.js
│   └── login-load.js
│
├── global-setup.ts
├── playwright.config.ts
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🏗 Framework Highlights

- Page Object Model design pattern
- Reusable Base Page
- Playwright fixtures for page object initialization
- Global Setup with Storage State authentication
- Environment configuration using `.env`
- External JSON test data
- Reusable constants and utility classes
- Dynamic employee ID and username generation
- Smoke and regression test tagging
- UI automation and authenticated API validation
- HTML reporting with screenshots, videos, and traces on failure
- Allure Reporting support
- Cross-browser execution with Chromium, Firefox, and WebKit
- Mobile device emulation using Playwright device profiles
- GitHub Actions CI integration
- GitHub Actions browser matrix for smoke tests
- Manual regression workflow using GitHub Actions

---

## ✅ Automated Coverage

- Authentication
- Dashboard validation
- Admin user management
- Employee lifecycle flow
- Logout and session validation
- Authenticated API validation

---

## 🔁 GitHub Actions CI

The project includes GitHub Actions workflows for smoke and regression test execution.

### Smoke Test Workflow

Smoke tests run automatically on:

- Push
- Pull request

Workflow file:

```text
.github/workflows/playwright-smoke.yml
```

The smoke workflow runs tests using a browser matrix for:

- Chromium
- Firefox

Smoke test command:

```bash
npx playwright test --grep "@smoke"
```

### Manual Regression Workflow

Regression tests can be triggered manually from GitHub Actions using `workflow_dispatch`.

Workflow file:

```text
.github/workflows/playwright-regression.yml
```

Regression test command:

```bash
npx playwright test --grep "@regression" --project=chromium
```

---

## ▶️ Installation

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

---

## ▶️ Execute Tests

Run all tests:

```bash
npx playwright test
```

Run smoke tests:

```bash
npx playwright test --grep "@smoke"
```

Run regression tests:

```bash
npx playwright test --grep "@regression"
```

Run tests on a specific browser:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run mobile emulation smoke tests:

```bash
npx playwright test --grep "@smoke" --project=mobile-chrome
npx playwright test --grep "@smoke" --project=mobile-safari
```

Run employee E2E test:

```bash
npx playwright test "tests/Employee E2E/addeditdeleteEmployee.spec.ts"
```

Run API validation test:

```bash
npx playwright test tests/API/apiValidation.spec.ts
```

---

## ⚡ Performance Testing (k6)

The `k6/` folder contains an API performance suite for the OrangeHRM demo. It has one test file per API or use case, and every file is independently executable.

### Endpoints under test

Every endpoint was taken from the real browser network traffic of the OrangeHRM demo (OrangeHRM 5 REST API, `/web/index.php/api/v2/...`) and confirmed against the live site. No endpoints are invented. All load tests are **read-only (GET)**, so they never create or delete data on the shared demo.

| Test file | Module | Endpoints | Purpose |
|---|---|---|---|
| `auth-login.test.js` | Authentication | `GET /auth/login`, `POST /auth/validate`, `GET /auth/logout` | Measures the full UI login flow: CSRF token, credential validation, a session check, logout and a post-logout 401 check. It also checks once that invalid credentials are rejected. |
| `dashboard.test.js` | Dashboard | `dashboard/employees/action-summary`, `dashboard/shortcuts`, `dashboard/employees/leaves`, `dashboard/employees/time-at-work`, `dashboard/employees/subunit`, `dashboard/employees/locations` | Sends all six widget APIs in parallel, the same way the dashboard page loads. |
| `pim-employee-list.test.js` | PIM | `pim/employees` (list, paged, sorted) and `pim/employees?nameOrId=` | Covers the Employee List grid and the employee search. |
| `pim-employee-details.test.js` | PIM | `pim/employees/{empNumber}`, `.../personal-details`, `.../custom-fields?screen=personal` | Opens employee profiles. The employee ids are discovered at runtime. |
| `admin-users.test.js` | Admin | `admin/users` (list and `username` filter) | Covers the User Management grid and the user search. |
| `admin-reference-data.test.js` | Admin | `admin/job-titles`, `admin/employment-statuses`, `admin/subunits` | Covers the lookup data used by filters across PIM, Recruitment and Performance. |
| `directory.test.js` | Directory | `directory/employees` (paged and `nameOrId` search) | Covers the Employee Directory card grid, scrolling and search. |
| `leave-list.test.js` | Leave | `leave/leave-periods`, `leave/leave-types`, `leave/workweek`, `leave/holidays`, `leave/employees/leave-requests` | Loads the Leave List page (lookups plus the leave-request grid). |
| `time-timesheets.test.js` | Time | `time/employees/timesheets/list` | Covers the Employee Timesheets grid. |
| `attendance-summary.test.js` | Attendance | `attendance/employees/summary` | Covers the Attendance Employee Records grid. |
| `recruitment.test.js` | Recruitment | `recruitment/candidates`, `recruitment/vacancies`, `recruitment/candidates/statuses` | Loads the Candidates page. |
| `buzz-feed.test.js` | Buzz | `buzz/feed`, `buzz/anniversaries` | Covers the Buzz newsfeed and anniversaries. |

Each test file starts with a comment block. It says which API is tested, what is validated, which scenarios the file supports and what result to expect.

### Scenarios

Choose a scenario with `-e SCENARIO=<name>`. The default is `load`.

| Scenario | Profile | Thresholds |
|---|---|---|
| `smoke` | 1 VU, 3 iterations | p95 < 2s, p99 < 3s, errors < 1%, checks > 99% |
| `load` (baseline) | Ramp to 5 VUs over 30s, hold for 1m, ramp down (~1m45s) | p95 < 2s, p99 < 3s, errors < 1%, checks > 99% |
| `stress` | Step 5 → 10 → 15 VUs (~2m50s) | p95 < 4s, p99 < 6s, errors < 5%, checks > 95% |
| `spike` | 1 VU, burst to 15 VUs for 30s, back to 1 VU (~1m35s) | p95 < 5s, p99 < 8s, errors < 5%, checks > 95% |

> ⚠️ The target is the **public, shared OrangeHRM demo**, so every profile is deliberately small: at most 15 VUs, under 3 minutes, and 1–3s of think time per iteration. Please don't raise these numbers against the public demo. Use your own OrangeHRM instance for real capacity testing.

Every test uses these checks and thresholds:

- **Checks**: HTTP status, response time under `CHECK_MAX_MS` (the scenario p99 limit by default), a JSON body with `data`, and endpoint-specific validations such as `meta.total`, page size, required fields and matching ids.
- **Thresholds**: an overall `http_req_failed`, p95/p99 `http_req_duration` and `checks`, plus one p95 threshold per endpoint (`http_req_duration{endpoint:...}`), so the summary shows a line for each API.
- **Tags**: every request is tagged with `test`, `endpoint`, `type` (`api`/`auth`) and `profile`, so results can be filtered per API and per scenario. Check names are prefixed with the endpoint, for example `[pim_employee_list] status is 200`.

### Authentication and session reuse

The tests log in the same way the browser does: they read the CSRF token from the login page, then `POST /auth/validate`. The session is carried by the `orangehrm` cookie.

- `setup()` performs one preflight login, so wrong credentials fail fast instead of flooding the demo with 401s.
- Each VU logs in **once** and reuses its session for all iterations (`noCookiesReset: true`). Sessions are per VU rather than shared, because PHP locks a session while a request runs. A single shared session would serialise concurrent VUs and distort the latency numbers.
- If a session expires (401), the VU logs in again once and retries.
- `auth-login.test.js` is the exception. It logs in on every iteration on purpose, because login is what it measures.

### Configuration

k6 does not read `.env` automatically. It uses the same variable names as the Playwright framework, taken from your shell environment or from `-e` flags:

| Variable | Default | Description |
|---|---|---|
| `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` | Application origin (same as `.env`) |
| `ORANGEHRM_USERNAME` / `ORANGEHRM_PASSWORD` | from `test-data/login.json` | Login credentials |
| `SCENARIO` | `load` | `smoke`, `load`, `stress` or `spike` |
| `CHECK_MAX_MS` | `3000` (load/smoke), `6000` (stress), `8000` (spike) | Per-request response-time check (defaults to the scenario p99 threshold) |
| `THINK_TIME_MIN` / `THINK_TIME_MAX` | `1` / `3` | Think time in seconds between iterations |
| `SEARCH_TERMS` | `a,e,an,test` | Search terms for the PIM and Directory tests |
| `EMPLOYEE_POOL_SIZE` | `20` | Number of employees sampled by the PIM details test |

### Running the k6 tests

Install k6 first: https://grafana.com/docs/k6/latest/set-up/install-k6/

Run a single test. The default scenario is `load`:

```bash
k6 run k6/tests/dashboard.test.js
```

Choose a scenario:

```bash
k6 run -e SCENARIO=smoke  k6/tests/dashboard.test.js
k6 run -e SCENARIO=load   k6/tests/dashboard.test.js
k6 run -e SCENARIO=stress k6/tests/dashboard.test.js
k6 run -e SCENARIO=spike  k6/tests/dashboard.test.js
```

Run every test with its npm script. Pass extra k6 flags after `--`:

```bash
npm run k6:auth
npm run k6:dashboard
npm run k6:pim-list
npm run k6:pim-details
npm run k6:admin-users
npm run k6:admin-reference
npm run k6:directory
npm run k6:leave
npm run k6:time
npm run k6:attendance
npm run k6:recruitment
npm run k6:buzz

npm run k6:leave -- -e SCENARIO=stress
```

Override the environment:

```bash
k6 run -e ORANGEHRM_BASE_URL=https://my-orangehrm.example.com -e ORANGEHRM_USERNAME=Admin -e ORANGEHRM_PASSWORD=secret k6/tests/admin-users.test.js
```

Export the raw metrics or an end-of-test summary:

```bash
k6 run --out json=k6-results.json k6/tests/pim-employee-list.test.js
k6 run --summary-export=k6-summary.json k6/tests/pim-employee-list.test.js
```

k6 exits with code `99` when a threshold fails, which makes the tests usable as a CI gate.

> Note: `k6/login-load.js` is the earlier prototype. It uses a hard-coded CSRF token, which expires, so it no longer performs a real login. `k6/tests/auth-login.test.js` replaces it.

---

## 📊 Reporting

View the Playwright HTML report:

```bash
npx playwright show-report
```

Generate Allure report:

```bash
npx allure-commandline generate allure-results --clean -o allure-report
```

Open Allure report:

```bash
npx allure-commandline open allure-report
```

The framework captures screenshots, videos, and trace files on failure.

---

## 🔮 Future Enhancements

- Additional API automation scenarios
- Enhanced CI reporting
- Docker support
- Test data cleanup strategy
- Logger utility
- Test annotations and test case metadata

---

## 📌 Project Progress

### 25 Aug 2026 : Phase 2 updates:

- Integrated GitHub Actions CI workflow
- Configured smoke tests to run on push and pull request events
- Added GitHub repository secrets for environment-specific values
- Updated Playwright execution for CI-safe headless mode
- Added reusable Playwright fixtures for page object initialization
- Added constants for routes and UI messages
- Added utility class for dynamic test data generation
- Added smoke and regression test tags for selective execution
- Added dashboard smoke test for CI validation
- Updated README with CI badge and project progress

### 28 Aug 2026 : Phase 3 updates:

- Added Allure Reporting support
- Generated and opened Allure reports locally
- Added cross-browser execution for Chromium, Firefox, and WebKit
- Added mobile device emulation support using Playwright device profiles
- Added GitHub Actions browser matrix for smoke tests
- Configured Chromium and Firefox smoke tests in CI
- Added browser-specific Playwright report artifacts
- Added manual regression workflow using GitHub Actions
- Configured manual regression execution using `workflow_dispatch`

### 31 Aug 2026 : Phase 4 API updates:

- Refactored API validation using a reusable API client
- Moved dashboard API request logic out of the spec file
- Added stronger API response assertions
- Added TypeScript response typing for API validation
- Added reusable API endpoint constants
- Validated API tests as part of regression execution

### 30 Sep 2026 : Phase 5 k6 performance updates:

- Added a k6 API performance suite with one test per module: Auth, Dashboard, PIM, Admin, Directory, Leave, Time, Attendance, Recruitment and Buzz
- Discovered the real OrangeHRM `/api/v2` endpoints from application network traffic
- Added smoke, load (baseline), stress and spike scenarios with safe, low load levels for the public demo
- Added per-endpoint checks and p95 thresholds, plus tags for per-API and per-scenario reporting
- Reused the login session per VU, with CSRF-token based login and a fail-fast preflight in `setup()`
- Externalised configuration through the existing `ORANGEHRM_*` environment variables and `test-data/login.json`
- Added npm scripts for each k6 test
---
## 🤝 Website : https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
---

## 🤝 Contributions

This is a personal QA/SDET portfolio project created for learning, practice, and showcasing automation framework development skills.
Suggestions, feedback, and improvements are welcome. If you would like to contribute:

- Fork the repository
- Create a new feature branch
- Make your changes
- Raise a pull request with a clear description

Please ensure that any contribution follows clean coding practices and maintains the existing framework structure.

---

## 📜 Copyright and Usage

This project is created and maintained by **Lekshmi Mahadevan** as part of a personal automation testing portfolio.
You are welcome to refer to this repository for learning and educational purposes. Please do not copy, republish, or claim this project as your own work without proper credit.
If you use any part of this framework as a reference, kindly provide appropriate attribution to the original repository.



npx playwright test tests/Admin --project=chromium --headed

npx playwright test tests/API --project=chromium --headed

npx playwright test tests/Authentication --project=chromium --headed

npx playwright test tests/Smoke --project=chromium --headed

Employee E2E workflow

The file is tests/Employee E2E/addeditdeleteEmployee.spec.ts. It has one test, tagged @regression, that adds an employee, edits their job details, and deletes them. It uses the Page Object Model: the spec only calls page-object methods, and the locators live in pages/.

Setup, before the test body runs

1. Global setup (global-setup.ts) logs in once and saves the session to playwright/.auth/user.json.
2. The chromium project loads that file as storageState. The test therefore starts already logged in, with no login steps.
3. Fixtures (fixtures/fixtures.ts) create the page objects (pimPage, addEmployeePage, and so on) and inject them into the test.
4. Test data:
   - employee.json supplies Lakshmi / M / Test and the profile picture path.
   - RandomGenerator.generateEmployeeId() produces a random 6-digit ID, so repeated runs don't collide on the unique Employee Id field.

Step by step

1. Open the dashboard

- page.goto(Routes.DASHBOARD) goes to /web/index.php/dashboard/index. The relative path is resolved against baseURL.
- dashboardPage.verifyDashboardLoaded() confirms the session is valid and the app is ready.

2. Go to PIM, then Add Employee

- pimPage.navigateToPIM() first calls openSideMenuIfCollapsed() in BasePage. It waits for the top bar and clicks the hamburger only if it is visible, which matters at mobile widths. It then clicks the "PIM" menu item.
- pimPage.clickAddEmployee() clicks the "Add Employee" link.

3. Add the employee (AddEmployeePage.addEmployee)

It runs six sub-steps in order:
- Fill first, middle and last name. Their locators are the input[name=...] attributes.
- Clear and fill Employee Id. Its locator is the input group whose text starts with "Employee Id".
- Upload the picture with setInputFiles on input[type=file], using test-data/profile.jpg.
- Click Save, then wait 2 seconds for the navigation to settle.
- verifyEmployeeCreated() asserts that the URL matches viewPersonalDetails and that the "Personal Details" heading is visible. This proves the record was created and the app redirected to the new employee's page.

4. Edit job details (EmployeeDetailsPage.updateJobDetails)

The test is still on the new employee's profile.
- Click the Job tab.
- Job Title: open the dropdown and pick option index 1. Index 0 is the "-- Select --" placeholder, so the code throws if there are 1 or fewer options. It logs the chosen text (this run picked "Account Assistant").
- Employment Status: same approach (this run picked "Freelance").
- Click Save (the first Save button on the page).
- Assert that the toast contains "Successfully Updated".

5. Delete the employee (DeleteEmployeePage.deleteEmployee("Lakshmi Test"))

- navigateToEmployeeList: click the "Employee List" tab and wait for the viewEmployeeList URL.
- searchEmployee: type the full name into the Employee Name box and click Search. That box is found with page.locator('input').nth(1).
- selectEmployee: tick the first checkbox in the results.
- clickDelete: click the trash-icon button. The bulk Delete button only appears once a row is selected.
- confirmDelete: click "Yes, Delete" in the confirmation dialog.
- verifyEmployeeDeleted: wait up to 10 seconds for a "Successfully Deleted" toast.

Design notes and weak spots

- Cleanup is part of the test. The employee created in step 3 is removed in step 5, so the shared demo site doesn't fill up. If the test fails between those steps, the employee is left behind.
- The delete step is fragile.
  - The name is always "Lakshmi Test". Leftover records from earlier failed runs would match too.
  - .first() on the checkbox could then tick the wrong row, or the header "select all" box.
  - input.nth(1) depends on DOM order.
  - Safer options: use a unique name per run, as adduser.spec.ts does with generateEmployee(), or add a locator for the row containing the employee ID.
- The 2-second waitForTimeout in clickSave is a fixed sleep. Waiting on the URL or a toast would be faster and more reliable.
- Timing: the run takes about 20 seconds on the slow demo site, well inside the 90-second timeout I set.
