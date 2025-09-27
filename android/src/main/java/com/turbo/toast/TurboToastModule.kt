package com.turbo.toast

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.os.Vibrator
import android.content.Context
import android.view.Gravity
import android.widget.Toast
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = TurboToastModule.NAME)
class TurboToastModule(reactContext: ReactApplicationContext) :
    TurboToastSpec(reactContext) {

    private var currentToast: Toast? = null
    private val handler = Handler(Looper.getMainLooper())
    private var customToastView: CustomToastView? = null
    private var useCustomView = true // Flag to enable/disable custom implementation

    companion object {
        const val NAME = "TurboToast"
    }

    override fun getName() = NAME

    @ReactMethod
    override fun show(options: ReadableMap, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No activity available")
            return
        }

        // Check if we should use custom view for styling features
        val needsCustomView = options.hasKey("backgroundColor") ||
                options.hasKey("textColor") ||
                options.hasKey("showProgressBar") ||
                options.hasKey("progress") ||
                options.hasKey("action")

        if (useCustomView && needsCustomView) {
            // Use custom implementation for better styling
            showCustomToast(options, activity, promise)
        } else {
            // Fall back to native Toast for simple cases
            showNativeToast(options, activity, promise)
        }

        // Handle haptic feedback
        handleHapticFeedback(options)
    }

    private fun showCustomToast(options: ReadableMap, activity: Activity, promise: Promise) {
        handler.post {
            try {
                if (customToastView == null) {
                    customToastView = CustomToastView(activity)
                }
                customToastView?.show(options, activity)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("TOAST_ERROR", e.message, e)
            }
        }
    }

    private fun showNativeToast(options: ReadableMap, activity: Activity, promise: Promise) {
        handler.post {
            try {
                // Cancel any existing toast
                currentToast?.cancel()

                val message = options.getString("message") ?: ""
                val duration = getDuration(options)
                val position = getPosition(options)
                val type = options.getString("type") ?: "default"

                // Create toast
                currentToast = Toast.makeText(activity, message, duration)

                // Set position
                when (position) {
                    "top" -> currentToast?.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 100)
                    "center" -> currentToast?.setGravity(Gravity.CENTER, 0, 0)
                    "bottom" -> currentToast?.setGravity(Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL, 0, 100)
                }

                // Add custom icon or type-based icon
                val icon = options.getString("icon") ?: when (type) {
                    "success" -> "✓"
                    "error" -> "✕"
                    "warning" -> "⚠"
                    "info" -> "ⓘ"
                    else -> ""
                }

                val iconMessage = if (icon.isNotEmpty()) "$icon $message" else message
                currentToast?.setText(iconMessage)

                // Show toast
                currentToast?.show()

                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("TOAST_ERROR", e.message, e)
            }
        }
    }

    private fun handleHapticFeedback(options: ReadableMap) {
        if (options.hasKey("hapticFeedback")) {
            val hapticType = options.getString("hapticFeedback")
            val vibrator = reactApplicationContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator

            vibrator?.let {
                val pattern = when (hapticType) {
                    "success" -> longArrayOf(0, 50, 100, 50)
                    "warning" -> longArrayOf(0, 100, 100, 100)
                    "error" -> longArrayOf(0, 200)
                    "light" -> longArrayOf(0, 20)
                    "medium" -> longArrayOf(0, 40)
                    "heavy" -> longArrayOf(0, 60)
                    "selection" -> longArrayOf(0, 10)
                    else -> null
                }

                pattern?.let {
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        vibrator.vibrate(android.os.VibrationEffect.createWaveform(it, -1))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(it, -1)
                    }
                }
            }
        }
    }

    @ReactMethod
    override fun hide() {
        handler.post {
            currentToast?.cancel()
            currentToast = null
            customToastView?.hide()
        }
    }

    @ReactMethod
    override fun hideAll() {
        handler.post {
            currentToast?.cancel()
            currentToast = null
            customToastView?.hide()
        }
    }

    private fun getDuration(options: ReadableMap): Int {
        return when {
            !options.hasKey("duration") -> Toast.LENGTH_SHORT
            options.getType("duration") == ReadableType.String -> {
                when (options.getString("duration")) {
                    "long" -> Toast.LENGTH_LONG
                    else -> Toast.LENGTH_SHORT
                }
            }
            options.getType("duration") == ReadableType.Number -> {
                val ms = options.getDouble("duration").toInt()
                if (ms > 2500) Toast.LENGTH_LONG else Toast.LENGTH_SHORT
            }
            else -> Toast.LENGTH_SHORT
        }
    }

    private fun getPosition(options: ReadableMap): String {
        return options.getString("position") ?: "bottom"
    }
}