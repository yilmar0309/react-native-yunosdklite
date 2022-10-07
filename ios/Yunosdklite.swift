import YunoSDK

class PaymentMethodSelectedZulu: PaymentMethodSelected {
  
  var vaultedToken: String?
  var paymentMethodType: String
  
  init(vaultedToken: String?, paymentMethodType: String) {
    self.vaultedToken = vaultedToken
    self.paymentMethodType = paymentMethodType
  }
}

@objc(Yunosdklite)
class Yunosdklite: NSObject, YunoPaymentDelegate {

    private var resolver: RCTPromiseResolveBlock? = nil;
    private var rejecter: RCTPromiseRejectBlock? = nil;
    var paymentSelected: PaymentMethodSelectedZulu = PaymentMethodSelectedZulu(vaultedToken: nil, paymentMethodType: "")
    var checkoutSession: String = ""
    var countryCode: String = ""
    var language: String = "es"
    var customerSession: String = ""
    var tokenResult: String = ""
    var navigationController: UINavigationController?
    
    override init() {
        self.navigationController = UIApplication.shared.keyWindow?.rootViewController as? UINavigationController;
    }
  
    required init?(coder aDecoder: NSCoder) {
        fatalError("type: init(coder:) has not been implemented")
    }
    
    @objc
    func initSdkYuno(
      _ apiKey: NSString,
      resolve: RCTPromiseResolveBlock,
      rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
      DispatchQueue.main.async {
          Yuno.initialize(apiKey: apiKey as String)
      };
      resolve(true)
    }
    
    @objc
    func startCheckout(
      _ session: NSString,
      countryCode: NSString,
      resolve: RCTPromiseResolveBlock,
      rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
      self.checkoutSession = session as String
      self.countryCode = countryCode as String
      DispatchQueue.main.async {
          Yuno.startCheckout(with: self)
      };
      
      resolve(true)
    }
    
    @objc
    func startPaymentLite(
       _ type: NSString,
       resolve: @escaping RCTPromiseResolveBlock,
       rejecter reject:  @escaping RCTPromiseRejectBlock
     ) -> Void {
       DispatchQueue.main.async {
         self.resolver = resolve;
         self.rejecter = reject;
         self.paymentSelected.paymentMethodType = type as String
         Yuno.startPaymentLite(paymentSelected: self.paymentSelected)
       };
    }
     
    @objc
    func continuePayment(
       _ resolve: @escaping RCTPromiseResolveBlock,
       rejecter reject: @escaping RCTPromiseRejectBlock
     ) -> Void {
       DispatchQueue.main.async {
         Yuno.continuePayment()
       }
    }
     
    func yunoCreatePayment(with token: String) {
       debugPrint("type: yunoCreatePayment \(token)")
       self.tokenResult = token
       self.resolver?(token);
    }
    
    func yunoPaymentResult(_ result: Yuno.Result) {
      debugPrint("type: yunoPaymentResult \(result)")
    }
    
    func yunoDidSelect(paymentMethod: PaymentMethodSelected) {
      debugPrint("type: yunoDidSelect(paymentMethod \(paymentMethod)")
    }
    
    func yunoDidSelect(enrollmentMethod: EnrollmentMethodSelected) {
      debugPrint("type: yunoDidSelect(paymentMethod \(enrollmentMethod)")
    }
}
