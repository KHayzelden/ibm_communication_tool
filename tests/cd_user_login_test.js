
Feature('Cd user login');

Scenario('test something', (I) => {
	I.amOnPage('/');
	I.see('Sign In');
	I.click('Sign In');
	I.fillField('email', 'fakeuser@yahoo.com');
	I.fillField('password', 'Olukayode97');
	I.click('Login');
	I.see('SEARCH');
	I.see('HISTORY');
	I.see('BOOKMARKS');
	I.see('ACCOUNT');
	I.see('LOG OUT');
	I.see('SETTINGS');
});
