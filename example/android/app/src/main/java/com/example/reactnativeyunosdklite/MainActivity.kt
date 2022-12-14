package com.example.reactnativeyunosdklite

import android.os.Bundle
import android.os.PersistableBundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.example.reactnativeyunosdklite.MainActivity.MainActivityDelegate
import com.facebook.react.ReactRootView
import com.yuno.payments.features.payment.startCheckout

class MainActivity : ReactActivity() {

    private fun onTokenUpdated(token: String?) {
      token?.let {
      }
    }

    private fun onPaymentStateChange(paymentState: String?) {
      paymentState?.let {
      }
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

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String? {
        return "main"
    }

    /**
     * Returns the instance of the [ReactActivityDelegate]. There the RootView is created and
     * you can specify the rendered you wish to use (Fabric or the older renderer).
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return MainActivityDelegate(this, mainComponentName)
    }

    class MainActivityDelegate(activity: ReactActivity?, mainComponentName: String?) : ReactActivityDelegate(activity, mainComponentName) {
        override fun createRootView(): ReactRootView {
            val reactRootView = ReactRootView(context)
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED)
            return reactRootView
        }
    }
}
