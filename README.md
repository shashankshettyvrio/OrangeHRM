# OrangeHRM Playwright Automation Framework

[![Playwright Tests](https://github.com/shashankshettyvrio/OrangeHRM/actions/workflows/playwright.yml/badge.svg)](https://github.com/shashankshettyvrio/OrangeHRM/actions/workflows/playwright.yml)

UI and API test automation for the **OrangeHRM** demo application, built with **Playwright** and **TypeScript**, using the **Page Object Model**, and running automatically on **GitHub Actions**.

Application under test: https://opensource-demo.orangehrmlive.com (username `Admin`, password `admin123`)

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Tech stack](#2-tech-stack)
3. [Project structure](#3-project-structure)
4. [Purpose of each folder and file](#4-purpose-of-each-folder-and-file)
5. [Test structure and how the tests work](#5-test-structure-and-how-the-tests-work)
6. [Page Object Model and fixtures](#6-page-object-model-and-fixtures)
7. [Locators and why they are used](#7-locators-and-why-they-are-used)
8. [Test data and configuration](#8-test-data-and-configuration)
9. [Playwright configuration](#9-playwright-configuration-playwrightconfigts)
10. [GitHub Actions workflow (CI/CD)](#10-github-actions-workflow-cicd)
11. [How to run the tests locally](#11-how-to-run-the-tests-locally)
12. [Important Playwright commands](#12-important-playwright-commands)
13. [Reports](#13-reports)
14. [How the framework works from start to finish](#14-how-the-framework-works-from-start-to-finish)
15. [Performance tests (k6)](#15-performance-tests-k6)
16. [Interview questions and answers](#16-interview-questions-and-answers)

---

## 1. Project overview

This project automatically tests the main features of OrangeHRM, an open-source HR application:

| Area | What is tested |
|---|---|
| Login | A user can log in with valid credentials |
| Logout | A user can log out, and the dashboard can't be opened afterwards |
| Dashboard | The dashboard loads (smoke test) |
| Admin | The Admin page opens the "Add User" form |
| Admin | A new system user can be created and found by search |
| Employee (PIM) | Full flow: add an employee, edit their job details, delete them |
| API | The dashboard API returns status 200 and valid JSON |
| API | Practice CRUD test (POST, GET, PUT, DELETE) on a public fake API |

The main ideas of the framework:

- **Page Object Model**: locators and page actions live in `pages/`, tests only call those actions.
- **Log in once**: a global setup logs in one time and saves the session, so most tests start already logged in.
- **Test data outside the code**: JSON files in `test-data/` plus random unique values.
- **CI**: every push and pull request to `main` runs the tests on GitHub Actions.

---

## 2. Tech stack

| Tool | Why it is used |
|---|---|
| Playwright Test | Browser automation and test runner (assertions, reports, retries, parallel runs) |
| TypeScript | JavaScript with types, so mistakes are caught while writing code |
| Node.js / npm | Runs Playwright and installs the packages |
| dotenv | Reads settings (URL, username, password) from the `.env` file |
| Allure | Extra, nicer test report |
| GitHub Actions | Runs the tests automatically in the cloud (CI) |
| k6 | Separate performance (load) tests for the OrangeHRM APIs |

---

## 3. Project structure

```text
OrangeHRM
├── .github/workflows/
│   └── playwright.yml          # GitHub Actions CI workflow
├── constants/
│   ├── Messages.ts             # success messages, e.g. "Successfully Saved"
│   └── Routes.ts               # page and API paths, e.g. /web/index.php/dashboard/index
├── fixtures/
│   └── fixtures.ts             # creates page objects and gives them to tests
├── pages/                      # Page Object Model classes
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── LogoutPage.ts
│   ├── PIMPage.ts
│   ├── AddEmployeePage.ts
│   ├── EmployeeDetailsPage.ts
│   ├── AdminPage.ts
│   └── AddUserPage.ts
├── tests/                      # the test files (*.spec.ts)
│   ├── Admin/
│   │   ├── adminpage.spec.ts
│   │   └── adduser.spec.ts
│   ├── API/
│   │   ├── apiCrud.spec.ts
│   │   └── apiValidation.spec.ts
│   ├── Authentication/
│   │   ├── loginpage.spec.ts
│   │   └── logout.spec.ts
│   ├── Employee E2E/
│   │   └── addeditdeleteEmployee.spec.ts
│   └── Smoke/
│       └── dashboard.spec.ts
├── test-data/
│   ├── employee.json
│   ├── users.json
│   ├── login.json              # used by the k6 tests
│   └── profile.jpg             # picture uploaded when adding an employee
├── utils/
│   └── RandomGenerator.ts      # unique usernames / employee ids
├── k6/                         # performance tests (separate from Playwright)
├── global-setup.ts             # logs in once before all tests
├── playwright.config.ts        # Playwright settings
├── package.json                # packages and npm scripts
├── .env.example                # template for your local .env file
└── .gitignore
```

Created automatically when you run tests (not committed to git):

| Folder | What it contains |
|---|---|
| `playwright/.auth/user.json` | the saved login session (cookies) |
| `playwright-report/` | Playwright HTML report |
| `allure-results/` | raw data for the Allure report |
| `test-results/` | screenshots, videos and traces of failed tests |

---

## 4. Purpose of each folder and file

| File / folder | Purpose |
|---|---|
| `tests/` | The test cases. Each file has a `test(...)` that describes **what** is tested in plain steps. |
| `pages/` | Page objects. Each class holds the **locators** of one page and the **actions** on that page (`login()`, `addEmployee()`, ...). |
| `pages/BasePage.ts` | Parent class of all pages. Stores `page` and has two mobile helpers: `openSideMenuIfHidden()` (opens the left menu) and `openSearchFiltersIfHidden()` (unfolds the search filters above a table). |
| `fixtures/fixtures.ts` | Extends Playwright's `test` so each test can ask for page objects by name, e.g. `async ({ loginPage }) => ...`. |
| `constants/Routes.ts` | All URLs in one place. If a URL changes, we change it only here. |
| `constants/Messages.ts` | Toast messages we check, e.g. `Successfully Deleted`. |
| `utils/RandomGenerator.ts` | Makes unique test data (timestamp / random number) so tests never clash with old data. |
| `test-data/*.json` | Fixed test data (employee name, user role, password, picture path). |
| `global-setup.ts` | Runs once before all tests: logs in and saves the session to `playwright/.auth/user.json`. |
| `playwright.config.ts` | Settings: test folder, timeout, browsers, reports, base URL, screenshots/videos. |
| `.env` / `.env.example` | Local settings: base URL, username, password. `.env` is **not committed** (it holds credentials); `.env.example` is the template. |
| `.github/workflows/playwright.yml` | CI pipeline: installs everything and runs the tests on GitHub. |
| `package.json` | Lists the packages and the `npm run ...` shortcut commands. |
| `k6/` | Performance tests for the OrangeHRM APIs (see [section 15](#15-performance-tests-k6)). |

---

## 5. Test structure and how the tests work

Every test file follows the same simple pattern:

```ts
import { test } from '../../fixtures/fixtures';

test('@smoke Verify Dashboard Loads', async ({ dashboardPage }) => {

    await dashboardPage.open();                  // action
    await dashboardPage.verifyDashboardLoaded(); // check (assertion)

});
```

- `test('name', async ({ ... }) => { ... })` defines one test case.
- The names inside `{ }` are **fixtures**: page objects Playwright creates for us.
- Every step uses `await`, because browser actions take time (they return Promises).
- Steps are **actions** (`open`, `click`, `fill`) followed by **verifications** (`verify...` methods that use `expect`).

### Tags

Tags are written in the test title and used to pick a group of tests:

| Tag | Meaning | Tests |
|---|---|---|
| `@smoke` | quick checks that the main features work | login, logout, dashboard, admin navigation |
| `@regression` | longer, full business flows | add user, add/edit/delete employee, API validation |

Run one group with `--grep`: `npx playwright test --grep @smoke`.

### The tests one by one

| Test file | Steps |
|---|---|
| `Smoke/dashboard.spec.ts` | Open dashboard → check the URL is the dashboard. |
| `Authentication/loginpage.spec.ts` | Starts **logged out** → open login page → enter username/password → check dashboard opens. |
| `Authentication/logout.spec.ts` | Starts logged out → log in → log out → check login page → open dashboard URL again → check we are sent back to login. |
| `Admin/adminpage.spec.ts` | Open dashboard → click Admin → click Add → check "Add User" heading. |
| `Admin/adduser.spec.ts` | Create a new employee (PIM) → go to Admin → create a user for that employee → search the user → check it's in the results. |
| `Employee E2E/addeditdeleteEmployee.spec.ts` | Add employee with a random id → open Job tab → pick job title + employment status → save → check "Successfully Updated" → search by employee id → delete → check "Successfully Deleted". |
| `API/apiValidation.spec.ts` | Call the OrangeHRM dashboard API with the logged-in cookies → check status 200 and a non-empty `data` list. |
| `API/apiCrud.spec.ts` | POST, GET, PUT, DELETE on `jsonplaceholder.typicode.com` → check status codes and response fields. |

### Why login/logout tests use an empty session

Most tests start logged in (see [section 14](#14-how-the-framework-works-from-start-to-finish)). The login and logout tests need to start **logged out**, so they use:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

The logout test also needs its own session. Logging out of the shared session would log out every test that runs after it.

---

## 6. Page Object Model and fixtures

### Page Object Model (POM)

A **page object** is a class for one page of the app. It contains:

1. **Locators**: how to find the elements (inputs, buttons).
2. **Methods**: actions on that page (`login()`, `addEmployee()`) and checks (`verifyEmployeeCreated()`).

```ts
export class LoginPage extends BasePage {

    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.getByPlaceholder('Username');
        this.passwordInput = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
    }

    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}
```

**Why POM?**
- **Reusability**: `login()` is written once and used by many tests.
- **Easy maintenance**: if the Login button changes, we fix **one** line in `LoginPage.ts`, not every test.
- **Readable tests**: tests read like steps: `loginPage.login(...)`, `dashboardPage.verifyDashboardLoaded()`.

### Pages in this project

| Page object | Page in OrangeHRM | Main methods |
|---|---|---|
| `BasePage` | (parent of all pages) | `openSideMenuIfHidden()`, `openSearchFiltersIfHidden()` |
| `LoginPage` | Login | `open()`, `login()` |
| `DashboardPage` | Dashboard | `open()`, `verifyDashboardLoaded()` |
| `LogoutPage` | User menu (top right) | `logout()`, `verifyLoggedOut()`, `verifyDashboardNotAccessible()` |
| `PIMPage` | PIM > Employee List | `openPIM()`, `clickAddEmployee()`, `searchByEmployeeId()`, `deleteEmployee()`, `verifyToastMessage()` |
| `AddEmployeePage` | PIM > Add Employee | `addEmployee()`, `verifyEmployeeCreated()` |
| `EmployeeDetailsPage` | Employee profile > Job tab | `openJobTab()`, `selectFirstJobTitle()`, `selectFirstEmploymentStatus()`, `clickSave()`, `verifyJobDetailsUpdated()` |
| `AdminPage` | Admin > System Users | `openAdmin()`, `clickAddUser()`, `searchUser()`, `verifyUserInResults()` |
| `AddUserPage` | Admin > Add User | `addUser()`, `verifyUserSaved()`, `verifyAddUserPageOpened()` |

### Inheritance (BasePage)

Every page `extends BasePage`. `super(page)` passes the Playwright `page` to `BasePage`, which stores it in `this.page`. Shared code, such as opening the hidden mobile menu or the folded search filters, is written once in `BasePage`.

### Fixtures

Without fixtures, every test would start with lines like `const loginPage = new LoginPage(page);`. In `fixtures/fixtures.ts` we tell Playwright how to create each page object once:

```ts
export const test = base.extend<Pages>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    // ...one entry per page object
});
```

Now a test just asks for it: `test('...', async ({ loginPage, dashboardPage }) => { ... })`. Playwright creates only the page objects that the test asks for.

---

## 7. Locators and why they are used

A **locator** tells Playwright how to find an element on the page. Playwright locators **auto-wait**: before clicking or filling, Playwright waits until the element is visible, enabled and stable. That's why there are no `sleep` / `waitForTimeout` calls in this project.

Locators are chosen in this order of preference (Playwright's recommended order):

| Locator | Example in this project | Why |
|---|---|---|
| `getByRole` | `getByRole('button', { name: 'Login' })`, `getByRole('link', { name: 'PIM' })`, `getByRole('option', { name: 'Admin' })` | Finds elements the way a user (or screen reader) sees them. Very stable. **First choice.** |
| `getByPlaceholder` | `getByPlaceholder('Username')`, `getByPlaceholder('First Name')` | Uses the grey hint text inside an input. Easy to read. |
| `getByText` | `resultTable.getByText(username, { exact: true })` | Finds an element by its visible text. |
| CSS + `filter({ hasText })` | `locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input')` | OrangeHRM labels are not linked to their inputs, so `getByLabel` doesn't work. We find the **field group that contains the label text**, then the input inside it. |
| CSS selector | `locator('input[type="file"]')`, `locator('.oxd-toast')` | For elements with no role, text or placeholder (file upload, toast popup). |

Other locator tricks used:
- `.first()`: when there is more than one match and we want the first one (the Save button on the Job page).
- `.nth(1)`: the second match. Dropdown option 0 is "-- Select --", so `nth(1)` is the first real value.
- **Row filtering**: `locator('.oxd-table-card').filter({ hasText: employeeId })` finds the table row of **our** employee, then `.locator('.bi-trash')` clicks the delete icon in that row only.

Avoided on purpose: XPath, long CSS chains, and position-based locators like `input.nth(1)` for the whole page. They break easily when the page layout changes.

### Assertions

Assertions use `expect`, and they **auto-retry** until they pass or time out:

```ts
await expect(page).toHaveURL(/dashboard\/index/);
await expect(toastMessage).toContainText('Successfully Updated');
await expect(heading).toBeVisible();
expect(response.status()).toBe(200);
```

---

## 8. Test data and configuration

### Environment variables (`.env`)

Settings that change between environments, or that are secret, are **not hard-coded**:

```text
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_USERNAME=Admin
ORANGEHRM_PASSWORD=admin123
```

- **Locally**, they come from the `.env` file (copy `.env.example` to `.env`). The `dotenv` package loads it in `playwright.config.ts`.
- **On GitHub Actions**, they come from **GitHub Secrets** (see section 10).
- `.env` is listed in `.gitignore`, so passwords are never pushed to GitHub.
- In code they are read with `process.env.ORANGEHRM_USERNAME`.

### JSON test data (`test-data/`)

| File | Content | Used by |
|---|---|---|
| `employee.json` | first/middle/last name, picture path | Employee E2E, Add User |
| `users.json` | user role `Admin`, status `Enabled`, password | Add User |
| `login.json` | admin username/password | k6 performance tests |
| `profile.jpg` | employee photo | uploaded with `setInputFiles` |

JSON files are imported directly in the test: `import employeeData from '../../test-data/employee.json';`

### Dynamic (random) test data (`utils/RandomGenerator.ts`)

The demo site is shared, and some fields must be unique (Employee Id, Username). So each run creates fresh values:

- `generateEmployeeId()` gives a random 6-digit number, e.g. `483920`
- `generateUsername('user')` gives `user` plus a timestamp, e.g. `user1728370000000`
- `generateEmployee()` gives a unique first name, e.g. `Auto1728370000000 Employee`

### Constants (`constants/`)

`Routes.ts` (URLs) and `Messages.ts` (toast texts) keep fixed strings in one place, so the tests don't repeat them. This avoids "magic strings".

---

## 9. Playwright configuration (`playwright.config.ts`)

| Setting | Value | Meaning |
|---|---|---|
| `testDir` | `./tests` | Playwright only looks for `*.spec.ts` files in this folder |
| `timeout` | `90000` | Max 90 seconds per test (the demo site is slow) |
| `expect.timeout` | `20000` | An `expect()` keeps retrying for up to 20 seconds (default is 5). Saving on the demo site can be slow |
| `workers` | `1` | Run tests one at a time (shared, slow demo site) |
| `retries` | `1` on CI, `0` locally | Retry a failed test once on CI to handle a slow or unstable demo site |
| `reporter` | `list`, `html`, `allure-playwright` | Console output, HTML report, Allure data |
| `globalSetup` | `./global-setup.ts` | Logs in once before all tests |
| `use.baseURL` | from `.env` | Allows `page.goto('/web/index.php/...')` with short paths |
| `use.headless` | `true` on CI, `false` locally | Browser hidden on CI, visible on your machine |
| `use.storageState` | `playwright/.auth/user.json` | Every test starts with the saved, logged-in session |
| `use.screenshot` | `only-on-failure` | Screenshot when a test fails |
| `use.video` | `retain-on-failure` | Keep the video only for failed tests |
| `use.trace` | `retain-on-failure` | Keep the trace (step-by-step recording) only for failed tests |
| `projects` | `chromium`, `firefox`, `mobile-chrome` (Pixel 5), `mobile-safari` (iPhone 13) | The same tests run on desktop and mobile browsers |

`process.env.CI` is set automatically to `true` by GitHub Actions. That's how the config knows it is running on CI.

---

## 10. GitHub Actions workflow (CI/CD)

**CI (Continuous Integration)** means that every code change is tested automatically, so a broken change is noticed at once.

File: `.github/workflows/playwright.yml`

### When it runs

| Trigger | Meaning |
|---|---|
| `push` to `main` | every time code is pushed |
| `pull_request` to `main` | every pull request, before it's merged |
| `workflow_dispatch` | manually, with the **Run workflow** button in the **Actions** tab |

### What it does (steps)

1. **Checkout the code** (`actions/checkout`): downloads the repository onto a fresh Ubuntu machine.
2. **Install Node.js** (`actions/setup-node`): installs Node 22 and caches npm packages for faster runs.
3. **Install dependencies** (`npm ci`): installs the exact versions from `package-lock.json`.
4. **Install the Chromium browser** (`npx playwright install --with-deps chromium`): the browser plus the Linux libraries it needs.
5. **Run tests** (`npx playwright test --project=chromium`): runs all tests on Chromium, headless, with 1 retry.
6. **Upload HTML report** (`actions/upload-artifact`): saves `playwright-report/` as a downloadable artifact, **even if tests failed** (`if: !cancelled()`).

### Secrets

On CI there is no `.env` file. The values come from **GitHub Secrets** (repository **Settings → Secrets and variables → Actions**):

- `ORANGEHRM_BASE_URL`
- `ORANGEHRM_USERNAME`
- `ORANGEHRM_PASSWORD`

The workflow reads them with `${{ secrets.ORANGEHRM_PASSWORD }}`. If a secret isn't set, it falls back to the public demo values, so the workflow also works on a fresh fork.

### How to see the result

GitHub repository → **Actions** tab → click a run. A green tick means all tests passed and a red cross means a test failed. Scroll down to **Artifacts** and download `playwright-report`. Unzip it and run `npx playwright show-report <folder>`.

### Why only Chromium on CI?

It's fast and stable, and it's enough to catch broken changes on every push. The other browsers (Firefox, mobile) can be run locally with `npx playwright test`.

---

## 11. How to run the tests locally

### One-time setup

```bash
# 1. Install the packages from package.json
npm install

# 2. Download the browsers Playwright uses
npx playwright install

# 3. Create your .env file from the template (Windows PowerShell: copy .env.example .env)
cp .env.example .env
```

> Always run commands from the project folder (the one that contains `playwright.config.ts`). Otherwise Playwright can't find the config and you'll see `Project(s) "chromium" not found`.

### Run tests

```bash
npm test                      # all tests, all 4 browsers/devices
npm run test:chromium         # all tests, Chromium only
npm run test:headed           # Chromium, with a visible browser
npm run test:smoke            # only @smoke tests
npm run test:regression       # only @regression tests
```

Run one file or one test:

```bash
npx playwright test tests/Smoke/dashboard.spec.ts --project=chromium
npx playwright test "tests/Employee E2E/addeditdeleteEmployee.spec.ts" --project=chromium
npx playwright test -g "Logout" --project=chromium
```

> If your `.env` contains `CI=1`, tests run headless and retry once, like on GitHub. Remove that line to see the browser locally.

---

## 12. Important Playwright commands

| Command | What it does |
|---|---|
| `npx playwright test` | Run all tests |
| `npx playwright test <file>` | Run one test file |
| `npx playwright test -g "name"` | Run tests whose title contains "name" |
| `npx playwright test --grep @smoke` | Run tests with the `@smoke` tag |
| `npx playwright test --project=chromium` | Run on one browser/project |
| `npx playwright test --headed` | Show the browser while running |
| `npx playwright test --debug` | Step through the test line by line (Playwright Inspector) |
| `npx playwright test --ui` | Interactive UI mode: pick tests, watch them, time-travel through steps |
| `npx playwright test --retries=2` | Retry failed tests |
| `npx playwright test --workers=2` | Run 2 tests in parallel |
| `npx playwright show-report` | Open the last HTML report |
| `npx playwright show-trace <trace.zip>` | Open a trace file of a failed test |
| `npx playwright codegen <url>` | Record your clicks and generate test code and locators |
| `npx playwright install` | Download the browsers |

---

## 13. Reports

### Playwright HTML report

Created automatically after every run in `playwright-report/`.

```bash
npm run report:html          # same as: npx playwright show-report
```

It shows every test, its steps, the time taken and the error. For failed tests it also shows the **screenshot**, **video** and **trace**.

### Trace viewer

A trace is a full recording of a test: every action, a DOM snapshot before and after each step, network calls and console logs. Open it from the HTML report, or with `npx playwright show-trace test-results/<test>/trace.zip`. It's the best tool for debugging a failure, especially one that happened on CI.

### Allure report

The `allure-playwright` reporter writes raw results to `allure-results/`. Turn them into a report with:

```bash
npm run report:allure:generate   # builds allure-report/
npm run report:allure:open       # opens it in the browser
```

(Allure needs Java installed.)

---

## 14. How the framework works from start to finish

When you run `npx playwright test --project=chromium`:

1. **Read the config.** Playwright loads `playwright.config.ts`. `dotenv` loads `.env`, which sets the base URL, username and password.
2. **Global setup (once).** `global-setup.ts` opens Chromium, logs in to OrangeHRM, and saves the cookies to `playwright/.auth/user.json`.
3. **Find the tests.** Playwright collects all `*.spec.ts` files in `tests/` (filtered by `--grep` / file name, if given).
4. **For each test:**
   - Playwright opens a **new, clean browser context** (like a fresh incognito window) with the saved login cookies (`storageState`). The test is already logged in.
   - The **fixtures** create the page objects the test asks for.
   - The test calls page object methods. Those use **locators** to find elements and act on them, and **`expect`** checks the result.
   - If a step fails: the test stops and a screenshot, video and trace are saved. On CI the test is retried once.
5. **Reports.** At the end, the list output shows in the console, the HTML report is written to `playwright-report/`, and Allure data to `allure-results/`.
6. **On CI**, GitHub Actions does the same on a fresh Ubuntu machine and uploads the HTML report as an artifact.

Example: the flow of the **Add User** test:

```text
adduser.spec.ts
 ├─ RandomGenerator           → unique employee name, id, username
 ├─ dashboardPage.open()      → page.goto(Routes.DASHBOARD)   (already logged in)
 ├─ pimPage.openPIM()         → click "PIM" in the left menu
 ├─ pimPage.clickAddEmployee()→ click "+ Add"
 ├─ addEmployeePage.addEmployee(...) → fill names, id, upload photo, Save
 ├─ addEmployeePage.verifyEmployeeCreated() → URL has viewPersonalDetails
 ├─ adminPage.openAdmin()     → click "Admin"
 ├─ adminPage.clickAddUser()  → click "+ Add"
 ├─ addUserPage.addUser(...)  → role, employee, status, username, password, Save
 ├─ addUserPage.verifyUserSaved() → toast "Successfully Saved"
 ├─ adminPage.searchUser(username)
 └─ adminPage.verifyUserInResults(username) → username visible in the table
```

---

## 15. Performance tests (k6)

The `k6/` folder is a separate **API performance test suite** written for [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/). It is not part of the Playwright run or the CI workflow.

- `k6/lib/`: shared code (config, login with CSRF token, API helpers, load scenarios).
- `k6/tests/`: one file per module: auth, dashboard, PIM, admin, directory, leave, time, attendance, recruitment, buzz. All requests are read-only `GET`s, so no data is changed.
- Scenarios (`-e SCENARIO=...`): `smoke` (1 user), `load` (default, 5 users), `stress` (up to 15 users), `spike` (burst to 15 users). Each has thresholds on response time (p95/p99) and error rate.

```bash
npm run k6:dashboard                         # run one k6 test (load scenario)
k6 run -e SCENARIO=smoke k6/tests/dashboard.test.js
```

> The target is the public, shared demo site, so the load is kept small on purpose. Use your own OrangeHRM instance for real capacity tests. `k6/login-load.js` is an older prototype; use `k6/tests/auth-login.test.js` instead.

---

## 16. Interview questions and answers

**Q1. Tell me about your project.**
I built a UI and API test automation framework for OrangeHRM using Playwright and TypeScript. It follows the Page Object Model and uses Playwright fixtures to create the page objects. A global setup logs in once and saves the session, so tests run faster. Test data comes from JSON files and random generators, and settings come from a `.env` file. It covers login, logout, dashboard, admin user creation, a full employee add/edit/delete flow and API tests. A GitHub Actions workflow runs the tests on every push and pull request and uploads the HTML report.

**Q2. Why Playwright and not Selenium?**
Playwright has auto-waiting, so I don't need explicit waits or sleeps. It includes its own test runner, assertions, HTML report, trace viewer and parallel runs out of the box. It supports Chromium, Firefox and WebKit plus mobile emulation with one API. It can also do API testing with the `request` fixture. It's generally faster and less flaky than Selenium.

**Q3. What is the Page Object Model and why do you use it?**
Each page of the application has a class with its locators and actions. Tests only call these methods, for example `loginPage.login(user, pass)`. If the UI changes, I update one page class instead of many tests, so code is reusable and easy to maintain.

**Q4. What are fixtures in Playwright?**
Fixtures are objects Playwright prepares for a test, like `page`, `request` or `browser`. I extended Playwright's `test` with `base.extend()` to add my own fixtures for every page object. A test just lists what it needs, like `async ({ loginPage }) =>`, and Playwright creates it. This removes repeated `new LoginPage(page)` code.

**Q5. How do you handle login for every test?**
With `globalSetup` and `storageState`. `global-setup.ts` logs in once before all tests and saves the cookies to `playwright/.auth/user.json`. The config sets `storageState` to that file, so each test starts already logged in. This saves time and avoids repeating login steps. The login and logout tests override it with an empty `storageState` because they need to start logged out.

**Q6. Which locators do you use and why?**
Mainly `getByRole` and `getByPlaceholder`, because they're based on what the user sees and don't break when CSS classes change. When OrangeHRM labels are not connected to inputs, I use a CSS locator for the field group with `filter({ hasText: 'Employee Id' })`, then the input inside it. I avoid XPath and index-based locators because they break easily.

**Q7. How do you handle waits / synchronization?**
I rely on Playwright's auto-waiting: actions like `click` and `fill` wait for the element to be visible and enabled, and `expect` assertions retry until they pass or time out. There are no hard waits (`waitForTimeout`) in the framework, because fixed sleeps make tests slow and still flaky.

**Q8. How do you manage test data?**
Static data is in JSON files in `test-data/`. Unique values, like employee id and username, are created at runtime by `RandomGenerator`, because the demo site is shared and these fields must be unique. Environment data (URL, credentials) is in `.env` locally and in GitHub Secrets on CI.

**Q9. How do you keep credentials safe?**
They are not hard-coded. Locally they're in `.env`, which is in `.gitignore`. On CI they're stored as GitHub Secrets and passed to the job as environment variables. The saved login session file is also git-ignored.

**Q10. Explain your CI/CD pipeline.**
I use GitHub Actions. On every push or pull request to `main` (or manually), it starts an Ubuntu runner. It checks out the code, installs Node, runs `npm ci`, installs Chromium and runs `npx playwright test --project=chromium`. Then it uploads the HTML report as an artifact, even when tests fail, so I can download it and see screenshots, videos and traces.

**Q11. How do you debug a failing test?**
First I look at the HTML report: the error message, screenshot and video. Then I open the **trace** in the trace viewer to see every step, the DOM before and after, and the network calls. Locally I can rerun with `--headed`, `--debug` or `--ui` to watch it step by step.

**Q12. How do you run only some tests?**
With tags in the test title (`@smoke`, `@regression`) and `--grep`: `npx playwright test --grep @smoke`. I can also run a single file, a folder, or use `-g "test name"`.

**Q13. How do you run tests on different browsers and devices?**
With `projects` in `playwright.config.ts`: `chromium`, `firefox`, and two mobile devices (`Pixel 5`, `iPhone 13`) using Playwright's built-in device profiles. `--project=firefox` picks one. On small screens OrangeHRM hides the side menu and folds the search filters, so `BasePage.openSideMenuIfHidden()` and `openSearchFiltersIfHidden()` open them first. On desktop they do nothing.

**Q14. What is the difference between `storageState`, `globalSetup` and `beforeEach`?**
`globalSetup` runs once before all tests. I use it to log in. `storageState` is the saved cookies and local storage that a new browser context starts with. `beforeEach` runs before every test inside a file. I don't need it here, because login is handled once by global setup.

**Q15. How did you do API testing?**
With Playwright's `request` fixture. `apiValidation.spec.ts` calls the OrangeHRM dashboard API. Because the `request` fixture uses the same `baseURL` and logged-in `storageState`, the call is authenticated without extra code. I check the status code is 200 and the JSON `data` list isn't empty. `apiCrud.spec.ts` shows POST/GET/PUT/DELETE on a public fake API and checks status codes and response fields.

**Q16. How do you handle test data cleanup?**
The employee E2E test deletes the employee it created as its last step. It finds the row by the unique employee id, so it can't delete someone else's record. The Add User test leaves its user on the demo site. That's acceptable on the demo, but in a real project I would delete it in an `afterEach` or through an API.

**Q17. What are retries, and why only on CI?**
A retry runs a failed test again. On CI the shared demo site is sometimes slow, so one retry avoids false failures. Locally I keep retries at 0 so I see real failures immediately. Playwright marks a test that passes on retry as **flaky** in the report, so it isn't hidden.

**Q18. What does `headless` mean?**
Headless means the browser runs without a visible window. It's faster and is the only option on CI servers. Locally I run headed to watch the test.

**Q19. What happens if a test fails?**
The test stops at the failing step and Playwright saves a screenshot, video and trace (`only-on-failure` / `retain-on-failure`). On CI it's retried once. The HTML report shows the error and the attachments, and the GitHub Actions run turns red.

**Q20. What would you improve next?**
- Delete the user created by the Add User test (cleanup in `afterEach` or via API).
- Use API calls to create test data (faster than the UI).
- Run tests in parallel on CI with sharding.
- Run the other browsers on CI on a schedule (nightly).
- Publish the Allure report to GitHub Pages.

---

## Copyright and Usage

This project is created and maintained by **Lekshmi Mahadevan** as part of a personal automation testing portfolio.
You are welcome to refer to this repository for learning and educational purposes. Please do not copy, republish, or claim this project as your own work without proper credit.
If you use any part of this framework as a reference, kindly provide appropriate attribution to the original repository.
