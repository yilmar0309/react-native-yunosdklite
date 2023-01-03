import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-yunosdklite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const Yunosdklite = NativeModules.Yunosdklite
  ? NativeModules.Yunosdklite
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function initSdkYuno(apiKey: string): Promise<boolean> {
  return Yunosdklite.initSdkYuno(apiKey);
}

export function initEnrollment(): Promise<boolean> {
  return Yunosdklite.initEnrollment();
}

export function startEnrollment(
  customer_session: string,
  country_iso: string
): Promise<boolean> {
  return Yunosdklite.startEnrollment(customer_session, country_iso);
}

export function startCheckout(
  checkout_session: string,
  country_iso: string
): Promise<boolean> {
  return Yunosdklite.startCheckout(checkout_session, country_iso);
}

export function startPaymentLite(type: string): Promise<string> {
  return Yunosdklite.startPaymentLite(type);
}

export function continuePayment(): Promise<boolean> {
  return Yunosdklite.continuePayment();
}
