import { google } from 'googleapis';

import { PACKAGE_NAME, SERVICE_KEY } from '../config/env.js';

const ServiceAccountKey = JSON.parse(Buffer.from(SERVICE_KEY, 'base64').toString('utf8'));

const playDeveloperApiClient = google.androidpublisher({
  version: 'v3',
  auth: new google.auth.GoogleAuth({
    credentials: ServiceAccountKey,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  }),
});

// export const saveSubscription = async (req, res) => {
//   const { purchaseToken, startTimeMillis, expiryTimeMillis } = req.body;

//   try {
//     const newSubscription = new Subscription({
//       userId: req.user.id, // Replace with actual user ID
//       purchaseToken,
//       startTimeMillis,
//       expiryTimeMillis,
//     });
//     await newSubscription.save();
//     return res.status(201).json(newSubscription);
//   } catch (error) {
//     console.error('Error saving subscription:', error);
//     return res.status(500);
//   }
// };

const validateSubscription = async (req, res) => {
  const { purchaseToken, subscriptionId } = req.body;

  if (!purchaseToken) {
    return res.status(400).json({ success: false, message: 'Purchase token is required.' });
  }

  try {
    // Use the Google Play API to validate the token
    const result = await playDeveloperApiClient.purchases.subscriptions.get({
      packageName: PACKAGE_NAME,
      subscriptionId, // Subscription ID in Play Console
      token: purchaseToken,
    });

    // Parse the result
    const subscription = result.data;

    if (subscription.paymentState === 1) { // 1 means payment received
      // Send success response
      return res.status(200).json({ success: true, subscription });
    }
    if (subscription.paymentState === 2) { // 2 means free trial
      // Send success response
      return res.status(200).json({ success: true, subscription });
    }
    console.log('Subscription not valid:', subscription);
    return res.status(400).json({ success: false, message: 'Invalid subscription.' });
  } catch (error) {
    console.error('Error validating subscription:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export default validateSubscription;
