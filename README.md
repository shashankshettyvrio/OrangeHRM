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
