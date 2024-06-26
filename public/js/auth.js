/* eslint-disable no-undef */
const alertModule = require('./alert');

exports.login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.status === 200) window.location = '/';
  } catch (error) {
    alertModule.showAlert('error', error.response.data.message);
    window.setTimeout(alertModule.hideAlert, 5000);
  }
};

exports.logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.status === 200) window.location = '/';
  } catch (error) {
    // console.log(error.response);
    alertModule.showAlert('error', error.response.data.message);
    window.setTimeout(alertModule.hideAlert, 5000);
  }
};
