// Page addresses used by the tests.
// They are relative paths: Playwright adds baseURL (from .env) in front of them.
export const Routes = {
    LOGIN: '/web/index.php/auth/login',
    DASHBOARD: '/web/index.php/dashboard/index',
    ADMIN: '/web/index.php/admin/viewSystemUsers',
    EMPLOYEE_LIST: '/web/index.php/pim/viewEmployeeList',
    ADD_EMPLOYEE: '/web/index.php/pim/addEmployee',

    // API used by the API validation test
    DASHBOARD_ACTION_SUMMARY_API: '/web/index.php/api/v2/dashboard/employees/action-summary'
};
