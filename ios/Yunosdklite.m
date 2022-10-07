#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_REMAP_MODULE(Yunosdklite, Yunosdklite, NSObject)

    RCT_EXTERN_METHOD(
       initSdkYuno: (NSString *)apiKey
       resolve: (RCTPromiseResolveBlock)resolve
       rejecter: (RCTPromiseRejectBlock)reject
    )
    
    RCT_EXTERN_METHOD(
       startCheckout: (NSString *)session countryCode:(NSString *)countryCode
       resolve: (RCTPromiseResolveBlock)resolve
       rejecter: (RCTPromiseRejectBlock)reject
    )

    RCT_EXTERN_METHOD(
       startPaymentLite: (NSString *)type
       resolve: (RCTPromiseResolveBlock)resolve
       rejecter: (RCTPromiseRejectBlock)reject
    )

    RCT_EXTERN_METHOD(
       continuePayment: (RCTPromiseResolveBlock)resolve
       rejecter: (RCTPromiseRejectBlock)reject
    )

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
