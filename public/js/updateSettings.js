/* eslint-disable no-undef */
const alertModule = require('./alert');

exports.updateSettings = async (type, data) => {
  // console.log('touched');
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${type === 'data' ? 'updateMe' : 'updateMyPassword'}`,
      data,
    });
    if (res.status === 200) window.location.reload();
  } catch (error) {
    alertModule.showAlert('error', error.response.data.message);
    window.setTimeout(alertModule.hideAlert, 5000);
  }
};
