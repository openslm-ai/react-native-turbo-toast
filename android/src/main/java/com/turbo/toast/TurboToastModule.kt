package com.turbo.toast

import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.widget.Toast
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = TurboToastModule.NAME)
class TurboToastModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var currentToast: Toast? = null
    private val handler = Handler(Looper.getMainLooper())

    companion object {
        const val NAME = "TurboToast"
    }

    override fun getName() = NAME

    @ReactMethod
    fun show(options: ReadableMap, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No activity available")
            return
        }

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

                // Add icon based on type
                val iconMessage = when (type) {
                    "success" -> "✓ $message"
                    "error" -> "✕ $message"
                    "warning" -> "⚠ $message"
                    "info" -> "ⓘ $message"
                    else -> message
                }
                currentToast?.setText(iconMessage)

                // Show toast
                currentToast?.show()

                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("TOAST_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun hide() {
        handler.post {
            currentToast?.cancel()
            currentToast = null
        }
    }

    @ReactMethod
    fun hideAll() {
        handler.post {
            currentToast?.cancel()
            currentToast = null
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