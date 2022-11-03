package com.example.reactnativeyunosdklite

import android.app.Application
import android.content.Context
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.PackageList
import com.example.reactnativeyunosdklite.newarchitecture.MainApplicationReactNativeHost
import com.facebook.react.config.ReactFeatureFlags
import com.facebook.soloader.SoLoader
import com.example.reactnativeyunosdklite.MainApplication
import com.facebook.react.ReactInstanceManager
import com.yuno.payments.core.Yuno
import java.lang.reflect.InvocationTargetException

class MainApplication : Application(), ReactApplication {
    private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean {
            return BuildConfig.DEBUG
        }

        override fun getPackages(): List<ReactPackage> {
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // packages.add(new MyReactNativePackage());
            return PackageList(this).packages
        }

        override fun getJSMainModuleName(): String {
            return "index"
        }
    }
    private val mNewArchitectureNativeHost: ReactNativeHost = MainApplicationReactNativeHost(this)
    override fun getReactNativeHost(): ReactNativeHost {
        return if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            mNewArchitectureNativeHost
        } else {
            mReactNativeHost
        }
    }

    override fun onCreate() {
        super.onCreate()
        // If you opted-in for the New Architecture, we enable the TurboModule system
        Yuno.initialize(this, "API_KEY")
        ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        SoLoader.init(this,  /* native exopackage */false)
        initializeFlipper(this, reactNativeHost.reactInstanceManager)
    }

    companion object {
        /**
         * Loads Flipper in React Native templates. Call this in the onCreate method with something like
         * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
         *
         * @param context
         * @param reactInstanceManager
         */
        private fun initializeFlipper(
                context: Context, reactInstanceManager: ReactInstanceManager) {
            if (BuildConfig.DEBUG) {
                try {
                    /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
                    val aClass = Class.forName("com.example.reactnativeyunosdklite.ReactNativeFlipper")
                    aClass
                            .getMethod("initializeFlipper", Context::class.java, ReactInstanceManager::class.java)
                            .invoke(null, context, reactInstanceManager)
                } catch (e: ClassNotFoundException) {
                    e.printStackTrace()
                } catch (e: NoSuchMethodException) {
                    e.printStackTrace()
                } catch (e: IllegalAccessException) {
                    e.printStackTrace()
                } catch (e: InvocationTargetException) {
                    e.printStackTrace()
                }
            }
        }
    }
}
