
Feature('Guest Login');

Scenario('test guest login', (I) => {
	I.amOnPage('/');
	I.see('Continue as Guest');
	I.click('Continue as Guest');
	I.see('GUEST');
	I.see('SEARCH');
	I.see('REGISTER');
	I.see('LOG IN');
});
