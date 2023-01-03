package com.reactnativeyunosdklite
import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.*
import com.yuno.payments.features.enrollment.initEnrollment
import com.yuno.payments.features.enrollment.startEnrollment
import com.yuno.payments.features.payment.*
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
        pickerPromise?.let { promise ->
          when (resultCode) {
            Activity.RESULT_CANCELED ->
              promise.reject(E_PAYMENT_CANCELLED, "Payment was cancelled")
            Activity.RESULT_OK -> {
            }
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

  private fun onTokenUpdated(token: String?) {
    token?.let {
      pickerPromise?.resolve(token)
    }
  }

  private fun onPaymentStateChange(paymentState: String?) {
    paymentState?.let {
    }
  }

  private fun onEnrollmentStateChange(enrollmentState: String?) {
    enrollmentState?.let {
      Log.d("YunosdkliteModule State", it)
    }
  }

  /**
   * @author Alexis Noriega
   * @return boolean
   */
  @ReactMethod
  fun initEnrollment(promise: Promise) {
    try {
      val currentActivity = currentActivity as AppCompatActivity
      currentActivity?.initEnrollment(
        this::onEnrollmentStateChange
      )
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.resolve(true)
      // promise.reject("startCheckout Error", e)
    }
  }

  @ReactMethod
  fun startEnrollment(
    customerSession: String,
    countryCode: String,
    promise: Promise
  ) {
    try {
      val activity = currentActivity
      if (activity == null) {
        promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity doesn't exist")
        return
      }
      activity.startEnrollment(
        customerSession = customerSession,
        countryCode = countryCode
      )
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("startEnrollment Error", e)
    }

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
          val currentActivity = currentActivity as AppCompatActivity
          currentActivity?.startCheckout(
            checkoutSession = session,
            countryCode = countryCode,
            callbackOTT = this::onTokenUpdated,
            callbackPaymentState = this::onPaymentStateChange,
          )
          promise.resolve(true)
        } catch (e: Throwable) {
          promise.resolve(true)
            // promise.reject("startCheckout Error", e)
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
            activity?.startPaymentLite(PaymentSelected(paymentMethodType = type, vaultedToken = null))
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
            this.currentActivity?.continuePayment(showPaymentStatus = true)
            promise.resolve(true)
        } catch (e: Throwable) {
            promise.reject("continuePayment Error", e)
        }
    }

  companion object {
    const val E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST"
    const val E_PAYMENT_CANCELLED = "E_PICKER_CANCELLED"
  }

}
