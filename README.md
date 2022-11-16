# react-native-yunosdklite
YunoSDK to React-Native Android and IOS
React Native library that implements Yuno [CheckoutLite](https://docs.y.uno/docs/the-ultimate-checkout-lite) flow using purely native code.

## Getting started

## Installation

```sh
npm install react-native-yunosdklite
```
or 
```sh
yarn add react-native-yunosdklite
```

### Mostly automatic installation

1. `$ react-native link react-native-yunosdklite`. Check the result, if iOS and/or Android project files are unchanged, do the steps described in Manual installation. 
1. [Android] Add `classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:${project.ext.kotlinVersion}"` and `kotlinVersion = "1.6.10"` in `android/build.gradle`.
1. [Android] Add ` maven { url "https://yunopayments.jfrog.io/artifactory/snapshots-libs-release" }` in `android/build.gradle`.
1. [Android] Add `apply plugin: 'kotlin-android'` and `implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.6.10"` and `implementation 'com.yuno.payments:android-sdk:1.0.9'` in `android/app/build.gradle`.
1. [Android] Convert files Java to Kotlin `Click right in option File -> Convert to File Kotlin`.
1. [Android] Add `import com.yuno.payments.core.Yuno` and `Yuno.initialize(this, "YOUR_API_KEY") under super.onCreate()` in `MainApplication.kt`.
1. [Android] Add `implementation 'androidx.core:core-ktx:1.7.0` and `implementation 'androidx.appcompat:appcompat:1.4.1` in `android/app/build.gradle`.
1. [Android] Add `import com.yuno.payments.features.payment.startCheckout` in `MainApplication.kt`.
1. [Android] Add in `MainActivity.kt`.
```javascript

  private fun onTokenUpdated(token: String?) {
    token?.let {}
  }

  private fun onPaymentStateChange(paymentState: String?) {
    paymentState?.let {}
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    startCheckout(
      checkoutSession = "",
      countryCode = "",
      callbackOTT = this::onTokenUpdated,
      callbackPaymentState = this::onPaymentStateChange,
    )
  }

```

1. [iOS] Change `platform :ios, '13.0'` to your Podfile.
1. [iOS] Edit your `AppDelegate.m` as follows:
    ```objc
    UINavigationController *rootViewController = [UINavigationController new];
    ```

At this point you should be able to build both Android and iOS.

## Usage

if you are in IOS must be init SDK
```javascript
 import { initSdkYuno } from 'react-native-yunosdklite';
 
 useEffect(() => {
     initSDK();
   }, []);
 
   async function initSDK() {
     if (Platform.OS == 'ios') {
       try {
         const result = await initSdkYuno(
           'API_KEY'
         );
         console.log('result', result);
       } catch (error) {
         console.log('ERROR -> ', error);
       }
     }
   }
```

First Create a Customer with [POST/customers](https://docs.y.uno/reference/create-a-customer).
```js
const [user, setUser]: any = useState(null);

const createCustomer = async () => {
     try {
       const data = {
         merchant_customer_id: '',
         first_name: '',
         last_name: '',
         email: '',
         country: '',
       };
       const result = await axios.post(
         'https://api-sandbox.y.uno/v1/customers',
         data,
         {
           headers: {
            'accept': 'application/json',
           'public-api-key': publicKey,
           'private-secret-key': privateKey,
            'content-type': 'application/json',
           },
         }
       );
       setUser(result.data);
     } catch (error: any) {
       console.log('ERROR', error.request.response);
     }
   };
```

Generate a checkout_session on your backend by creating a Checkout Session with [POST/checkouts/sessions](https://docs.y.uno/reference/create-checkout-session).
```js
const [session, setSession]: any = useState(null);

 const createSession = async () => {
     try {
       const data = {
         amount: { currency: 'COP', value: 15000 },
         customer_id: user?.customer_id,
         merchant_order_id: user?.merchant_customer_id,
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
```

Get the available payment methods you have enabled via the Yuno integration [GET/checkout/sessions/{{checkout_session}}/payment-methods](https://docs.y.uno/reference/retrieve-payment-methods-for-checkout).
```js
  const [paymentMethods, setPaymentMethods]: any = useState(null);
  
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
```

Display in your checkout frontend the payment methods. Here the user will select the payment method he wants to pay within your platform.

You have to start checkout.
```js
 import { startCheckout } from 'react-native-yunosdklite';
 
 const handleStartCheckout = async () => {
     try {
       await startCheckout(session?.checkout_session, session?.country);
     } catch (error) {
       console.log('ERROR', error);
     }
   };
```

The YUNO SDK will generate a payment_method_token when the customer submits their payment data.

Create a payment using the payment_method_token via the Payments API [POST/payments](https://docs.y.uno/reference/create-a-new-payment).

If the response indicates a [require_sdk_action](https://docs.y.uno/docs/android-sdk), you'll need to invoke the SDK to render the next steps.

```js
 import { startPaymentLite, continuePayment } from 'react-native-yunosdklite';
 
 const handleStartPaymentLite = async () => {
     try {
       const resultToken = await startPaymentLite(paymentMethods?.type);
       const body = {
         amount: { currency: 'COP', value: '18000' },
         checkout: { session: session?.checkout_session },
         payment_method: { token: resultToken },
         customer_payer: user,
         account_id,
         merchant_order_id: account_id,
         description: 'test_description_payment',
         country: 'CO',
       };
       const result = await axios.post('https://api-sandbox.y.uno/v1/payments', body, {
         headers: {
           ...headers,
           'X-idempotency-key': (Math.random() + 1).toString(36).substring(7),
         },
       });
       if (result.data.checkout?.sdk_action_required) {
           await continuePayment();
       }
     } catch (error: any) {
       console.log('ERROR', error);
     }
   };
```

## Troubleshooting
1. [iOS] Error `Undefined symbols ___llvm_profile_runtime`, You can implement: `I was also troubled by the problem. To solve this problem, you may want to add -fprofile-instr-generate to Build Settings > Linking > Other Linker Flags.`

2. [iOS] Error `Dark Mode`, You can implement: [Mode Light](https://sarunw.com/posts/how-to-disable-dark-mode-in-ios/).

```js
	<key>UIUserInterfaceStyle</key>
	<string>Light</string>

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
