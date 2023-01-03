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
import { Button, Platform, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  initSdkYuno,
  startCheckout,
  startPaymentLite,
  continuePayment,
  initEnrollment,
  startEnrollment
} from 'react-native-yunosdklite';

const publicKey = '';
const privateKey = '';
const account_id = '';
const country = 'CO'
const customer_id = ''
const YOUR_ID_FROM_YOUR_DB = (Math.random() + 1).toString(36).substring(7)

const headers = {
  'accept': 'application/json',
  'public-api-key': publicKey,
  'private-secret-key': privateKey,
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [user, setUser]: any = useState(null);
  const [session, setSession]: any = useState(null);
  const [customerSession, setCustomerSession]: any = useState(null);
  const [paymentMethods, setPaymentMethods]: any = useState(null);
  const [paymentMethodsEnrollment, setPaymentMethodsEnrollment]: any = useState(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    initSDK();
  }, []);

  async function initSDK() {
    if (Platform.OS === 'ios') {
      try {
        const result = await initSdkYuno(publicKey);
        console.log('result', result);
      } catch (error) {
        console.log('ERROR -> ', error);
      }
    }
  }

  const createCustomer = async () => {
    try {
      const data = {
        merchant_customer_id: YOUR_ID_FROM_YOUR_DB,
        first_name: 'test_name',
        last_name: 'test_lastname',
        gender: 'M',
        email: 'test_email',
        country,
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

  const customerSessions = async () => {
    try {
      const data = {
        account_id,
        country,
        customer_id,
        callback_url: ''
      };
      const result = await axios.post(
        'https://api-sandbox.y.uno/v1/customers/sessions',
        data,
        {
          headers: {
            ...headers,
            'content-type': 'application/json',
          },
        },
      );
      setCustomerSession(result.data)
    } catch (error: any) {
      console.log('ERROR', error.request.response);
    }
  };

  const createSession = async () => {
    try {
      const data = {
        amount: { currency: 'COP', value: 15000 },
        // customer_id: user?.customer_id,
        customer_id,
        merchant_order_id: YOUR_ID_FROM_YOUR_DB,
        payment_description: 'test_description',
        callback_url: 'http://localhost:3000',
        country,
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

  const handleGetPaymentsMethodsEnrollments = async () => {
    try {
      const result = await axios.get(
        `https://api-sandbox.y.uno/v1/checkout/customers/sessions/${customerSession.customer_session}/payment-methods`,
        {
          headers: {
            ...headers,
            'content-type': 'application/json',
          },
        },
      );
      setPaymentMethodsEnrollment(result.data.payment_methods[0]);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const handleEnrollmentPyament = async () => {
    try {
      const data = {
        account_id, 
        payment_method_type: paymentMethodsEnrollment.type, 
        country: customerSession.country
      };
      const result = await axios.post(
        `https://api-sandbox.y.uno/v1/customers/sessions/${customerSession.customer_session}/payment-methods`,
        data,
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'public-api-key': publicKey,
            'private-secret-key': privateKey,
            'X-idempotency-key': (Math.random() + 1).toString(36).substring(7),
          },
        },
      );
      console.log('handleEnrollmentPyament', result);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const handleStartEnrollment = async () => {
    try {
      await initEnrollment()
      const result = await startEnrollment(
        customerSession?.customer_session,
        customerSession?.country,
      );
      console.log('handleStartEnrollment', result);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const handleStartEnrollmentIO = async () => {
    try {
      // await initEnrollment()
      console.log('customerSession', customerSession)
      const result = await startEnrollment(
        customerSession?.customer_session,
        customerSession?.country,
      );
      console.log('handleStartEnrollment', result);
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
        merchant_order_id: YOUR_ID_FROM_YOUR_DB,
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
      <StatusBar 
        animated
        barStyle='default'
      />
     <Button title="Create customer" onPress={createCustomer} />
      <Button title="Create customer sessions" onPress={customerSessions} />
      <Button title="handle Get Payments Enrollment" onPress={handleGetPaymentsMethodsEnrollments} />
      <Button title="handle Enrollment Pyament Methods" onPress={handleEnrollmentPyament} />
      <Button title="handle Start Enrollment" onPress={handleStartEnrollment} />
      <Button title="Create session" onPress={createSession} />
      <Button title="handle Get Payments" onPress={handleGetPayments} />
      <Button title="handle Start Checkout" onPress={handleStartCheckout} />
      <Button title="handle Start Enrollment IOS" onPress={handleStartEnrollmentIO} />
      <Button
        title="handle Start Payment Lite"
        onPress={handleStartPaymentLite}
      />
    </SafeAreaView>
  );
};

export default App;
