package com.reactnativeyunosdklite
import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.yuno.payments.features.payment.PAYMENT_RESULT_DATA_TOKEN
import com.yuno.payments.features.payment.continuePayment
import com.yuno.payments.features.payment.startCheckout
import com.yuno.payments.features.payment.startPaymentLite
import com.yuno.payments.features.payment.ui.views.PaymentSelected

class YunosdkliteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var pickerPromise: Promise? = null

    private val activityEventListener =
      object : BaseActivityEventListener() {
        override fun onActivityResult(
          activity: Activity?,
          requestCode: Int,
          resultCode: Int,
          intent: Intent?
        ) {
          if (requestCode == PAYMENT_REQUEST) {
            pickerPromise?.let { promise ->
              when (resultCode) {
                Activity.RESULT_CANCELED ->
                  promise.reject(E_PAYMENT_CANCELLED, "Payment was cancelled")
                Activity.RESULT_OK -> {
                  val token = intent?.getStringExtra(PAYMENT_RESULT_DATA_TOKEN)

                  token?.let { promise.resolve(token.toString()) }
                    ?: promise.reject(E_NO_PAYMENT_DATA_FOUND, "No payment data found")
                }
              }

              pickerPromise = null
            }
          }
        }
      }

    init {
      reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String {
        return "Yunosdklite"
    }

   /**
     * @author Alexis Noriega
     * @param session this session from API https://docs.y.uno/reference/create-checkout-session
     * @param countryCode
     * @return boolean
     */
    @ReactMethod
    fun startCheckout(session: String, countryCode: String, promise: Promise) {
        try {
            this.currentActivity?.startCheckout(checkoutSession = session, countryCode = countryCode)
            promise.resolve(true)
        } catch (e: Throwable) {
            promise.reject("startCheckout Error", e)
        }
    }

    /**
     * @author Alexis Noriega
     * @param type this session from API https://docs.y.uno/reference/retrieve-payment-methods-for-checkout
     * The YUNO SDK will generate a payment_method_token when the customer submits their payment data.
     * @return payment_method_token String
     */
    @ReactMethod
    fun startPaymentLite(type: String, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity doesn't exist")
            return
        }
        pickerPromise = promise
        try {
            activity?.startPaymentLite(requestCode = PAYMENT_REQUEST, PaymentSelected(paymentMethodType = type, vaultedToken = null))
        } catch (e: Throwable) {
            promise.reject("startPaymentLite Error", e)
        }
    }

    /**
     * @author Alexis Noriega
     * @return boolean
     * If the response indicates a require_sdk_action when you create payment, you'll need to invoke the SDK to render the next steps.
     */
    @ReactMethod
    fun continuePayment(promise: Promise) {
        try {
            this.currentActivity?.continuePayment(requestCode = PAYMENT_REQUEST, showPaymentStatus = true)
            promise.resolve(true)
        } catch (e: Throwable) {
            promise.reject("continuePayment Error", e)
        }
    }

    companion object {
        const val PAYMENT_REQUEST = 1
        const val E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST"
        const val E_PAYMENT_CANCELLED = "E_PICKER_CANCELLED"
        const val E_NO_PAYMENT_DATA_FOUND = "E_NO_IMAGE_DATA_FOUND"
    }

}
