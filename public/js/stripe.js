/* eslint-disable no-undef */
const stripe = Stripe(
  'pk_test_51PUpEAATt04WvYpT57K48PayDHrjrClZ5EZFFbdV5VwK8Z7qQfic0WlSjRYP0WPiLazJaRiFGGlAkbxpEVvPfSGB00XjG0YPd3',
);

exports.bookTour = async (tourId) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });
    await stripe.redirectToCheckout({
      sessionId: res.data.session.id,
    });
  } catch (error) {
    // alertModule.showAlert('error', error.response.data.message);
    // window.setTimeout(alertModule.hideAlert, 5000);
    console.log(error.response);
  }
};
