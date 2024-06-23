/* eslint-disable import/newline-after-import */
/* eslint-disable no-undef */

const updateSettingsModule = require('./updateSettings');
const authModule = require('./auth');
const { bookTour } = require('./stripe');

const loginForm = document.querySelector('.login-form');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const btnBookTour = document.querySelector('#btn-book-tour');

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

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);
    await updateSettingsModule.updateSettings('data', form);

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

if (btnBookTour)
  btnBookTour.addEventListener('click', async () => {
    btnBookTour.textContent = 'Processing...';
    const { tourId } = btnBookTour.dataset;
    await bookTour(tourId);
  });

document.querySelector('.nav__el--logout').addEventListener('click', () => {
  authModule.logout();
});
