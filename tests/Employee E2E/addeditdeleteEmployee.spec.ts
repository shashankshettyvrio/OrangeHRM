import { test } from '../../fixtures/fixtures';
import employeeData from '../../test-data/employee.json';
import { RandomGenerator } from '../../utils/RandomGenerator';
import { Messages } from '../../constants/Messages';

// End-to-end (E2E) flow: Add an employee -> Edit their job details -> Delete them
test('@regression Add Employee, Edit Employee, Delete Employee', async ({ dashboardPage, pimPage, addEmployeePage, employeeDetailsPage }) => {

    // A unique id lets us find exactly this employee again when deleting
    const employeeId = RandomGenerator.generateEmployeeId();
    const employee = employeeData.employee;

    // Step 1: ADD the employee
    await dashboardPage.open();
    await pimPage.openPIM();
    await pimPage.clickAddEmployee();
    await addEmployeePage.addEmployee(employee.firstName, employee.middleName, employee.lastName, employeeId, employee.profilePicture);
    await addEmployeePage.verifyEmployeeCreated();

    // Step 2: EDIT the employee's job details
    await employeeDetailsPage.openJobTab();
    await employeeDetailsPage.selectFirstJobTitle();
    await employeeDetailsPage.selectFirstEmploymentStatus();
    await employeeDetailsPage.clickSave();
    await employeeDetailsPage.verifyJobDetailsUpdated();

    // Step 3: DELETE the employee (also cleans up our test data)
    await pimPage.openPIM();
    await pimPage.searchByEmployeeId(employeeId);
    await pimPage.deleteEmployee(employeeId);
    await pimPage.verifyToastMessage(Messages.SUCCESSFULLY_DELETED);

});
