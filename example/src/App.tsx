/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Platform, SafeAreaView, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  initSdkYuno,
  startCheckout,
  startPaymentLite,
  continuePayment,
} from 'react-native-yunosdklite';

const publicKey = 'PUBLIC_KEY';
const privateKey = 'PRIVATE_KEY';
const account_id = 'ACCOUNT_ID';

const headers = {
  'accept': 'application/json',
  'public-api-key': publicKey,
  'private-secret-key': privateKey,
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [user, setUser]: any = useState(null);
  const [session, setSession]: any = useState(null);
  const [paymentMethods, setPaymentMethods]: any = useState(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    initSDK();
  }, []);

  async function initSDK() {
    if (Platform.OS === 'ios') {
      try {
        const result = await initSdkYuno('PUBLIC_KEY');
        console.log('result', result);
      } catch (error) {
        console.log('ERROR -> ', error);
      }
    }
  }

  const createCustomer = async () => {
    try {
      const data = {
        merchant_customer_id: 'YOUR_ID_FROM_YOUR_DB',
        first_name: 'test_name',
        last_name: 'test_lastname',
        gender: 'M',
        email: 'test_email',
        country: 'CO',
      };
      const result = await axios.post(
        'https://api-sandbox.y.uno/v1/customers',
        data,
        {
          headers: {
            ...headers,
            'content-type': 'application/json',
          },
        }
      );
      setUser(result.data);
    } catch (error: any) {
      console.log('ERROR', error.request.response);
    }
  };

  const createSession = async () => {
    try {
      const data = {
        amount: { currency: 'COP', value: 15000 },
        customer_id: user?.customer_id,
        merchant_order_id: 'YOUR_ID_FROM_YOUR_DB',
        payment_description: 'test_description',
        callback_url: 'http://localhost:3000',
        country: 'CO',
        account_id,
      };
      const result = await axios.post(
        'https://api-sandbox.y.uno/v1/checkout/sessions',
        data,
        {
          headers: {
            ...headers,
            'content-type': 'application/json',
          },
        }
      );
      setSession(result.data);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const handleGetPayments = async () => {
    try {
      const result = await axios.get(
        `https://api-sandbox.y.uno/v1/checkout/sessions/${session?.checkout_session}/payment-methods`,
        {
          headers,
        }
      );
      setPaymentMethods(result.data[0]);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const handleStartCheckout = async () => {
    try {
      await startCheckout(session?.checkout_session, session?.country);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const handleStartPaymentLite = async () => {
    try {
      const result = await startPaymentLite(paymentMethods?.type);
      const body = {
        amount: { currency: 'COP', value: '18000' },
        checkout: { session: session?.checkout_session },
        payment_method: { token: result },
        customer_payer: user,
        account_id,
        merchant_order_id: 'YOUR_ID_FROM_YOUR_DB',
        description: 'test_description_payment',
        country: 'CO',
      };
      await axios.post('https://api-sandbox.y.uno/v1/payments', body, {
        headers: {
          ...headers,
          'X-idempotency-key': (Math.random() + 1).toString(36).substring(7),
        },
      });
      await continuePayment();
    } catch (error: any) {
      console.log('ERROR', error);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <Button title="Create customer" onPress={createCustomer} />
      <Button title="Create session" onPress={createSession} />
      <Button title="handle Get Payments" onPress={handleGetPayments} />
      <Button title="handle Start Checkout" onPress={handleStartCheckout} />
      <Button
        title="handle Start Payment Lite"
        onPress={handleStartPaymentLite}
      />
    </SafeAreaView>
  );
};

export default App;
