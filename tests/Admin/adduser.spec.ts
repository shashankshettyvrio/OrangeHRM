import { test } from '../../fixtures/fixtures';
import userData from '../../test-data/users.json';
import employeeData from '../../test-data/employee.json';
import { RandomGenerator } from '../../utils/RandomGenerator';

// A system user must be linked to an employee, so this test:
// 1. creates a new employee   2. creates a user for that employee   3. searches for the user
test('@regression Add User', async ({ dashboardPage, pimPage, addEmployeePage, adminPage, addUserPage }) => {

    // Unique data for this run
    const employee = RandomGenerator.generateEmployee();
    const employeeId = RandomGenerator.generateEmployeeId();
    const username = RandomGenerator.generateUsername('user');

    // Step 1: create an employee
    await dashboardPage.open();
    await pimPage.openPIM();
    await pimPage.clickAddEmployee();
    await addEmployeePage.addEmployee(employee.firstName, '', employee.lastName, employeeId, employeeData.employee.profilePicture);
    await addEmployeePage.verifyEmployeeCreated();

    // Step 2: create a user for that employee
    await adminPage.openAdmin();
    await adminPage.clickAddUser();
    await addUserPage.addUser(userData.adminUser.role, employee.fullName, userData.adminUser.status, username, userData.adminUser.password);
    await addUserPage.verifyUserSaved();

    // Step 3: the new user must appear in the search results
    await adminPage.searchUser(username);
    await adminPage.verifyUserInResults(username);

});
