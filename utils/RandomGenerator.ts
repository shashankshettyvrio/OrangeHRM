// Creates unique test data, so running the tests again never clashes
// with data that already exists on the shared demo site.
export class RandomGenerator {

    // Example: "user1728370000000"
    static generateUsername(prefix: string): string {
        return prefix + Date.now();
    }

    // Example: "483920" (a random 6-digit number)
    static generateEmployeeId(): string {
        const number = Math.floor(100000 + Math.random() * 900000);
        return number.toString();
    }

    // Example: { firstName: "Auto1728370000000", lastName: "Employee", fullName: "Auto1728370000000 Employee" }
    static generateEmployee() {
        const firstName = 'Auto' + Date.now();
        const lastName = 'Employee';
        return {
            firstName: firstName,
            lastName: lastName,
            fullName: firstName + ' ' + lastName
        };
    }
}
