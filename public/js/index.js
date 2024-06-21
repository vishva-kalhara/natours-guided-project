/* eslint-disable import/newline-after-import */
/* eslint-disable no-undef */

const updateSettingsModule = require('./updateSettings');
const authModule = require('./auth');

const loginForm = document.querySelector('.login-form');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (loginForm) {
  document.querySelector('.login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    authModule.login(email, password);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.querySelector('.btn--save-settings');
    btn.textContent = 'Saving...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    const data = { name, email };

    await updateSettingsModule.updateSettings('data', data);

    btn.textContent = 'Save Settings';
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.querySelector('.btn--save-password');
    btn.textContent = 'Saving...';

    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    const data = { currentPassword, newPassword, confirmPassword };

    await updateSettingsModule.updateSettings('password', data);

    btn.textContent = 'Save Password';
  });
}

document.querySelector('.nav__el--logout').addEventListener('click', () => {
  authModule.logout();
});
