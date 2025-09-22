package com.turbo.toast

import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter

class TurboToastViewManager : SimpleViewManager<TurboToastView>() {

    override fun getName() = "TurboToastView"

    override fun createViewInstance(reactContext: ThemedReactContext): TurboToastView {
        return TurboToastView(reactContext)
    }

    @ReactProp(name = "message")
    fun setMessage(view: TurboToastView, message: String?) {
        view.setMessage(message ?: "")
    }

    @ReactProp(name = "duration")
    fun setDuration(view: TurboToastView, duration: Double) {
        view.setDuration(duration)
    }

    @ReactProp(name = "position")
    fun setPosition(view: TurboToastView, position: String?) {
        view.setPosition(position ?: "bottom")
    }

    @ReactProp(name = "type")
    fun setType(view: TurboToastView, type: String?) {
        view.setType(type ?: "default")
    }

    @ReactProp(name = "backgroundColor")
    fun setBackgroundColor(view: TurboToastView, backgroundColor: String?) {
        view.setBackgroundColorProp(backgroundColor)
    }

    @ReactProp(name = "textColor")
    fun setTextColor(view: TurboToastView, textColor: String?) {
        view.setTextColorProp(textColor)
    }

    @ReactProp(name = "visible")
    fun setVisible(view: TurboToastView, visible: Boolean) {
        view.setVisible(visible)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return mapOf(
            "onShow" to mapOf("registrationName" to "onShow"),
            "onHide" to mapOf("registrationName" to "onHide"),
            "onPress" to mapOf("registrationName" to "onPress")
        )
    }
}

class TurboToastView(private val reactContext: ThemedReactContext) : LinearLayout(reactContext) {

    private var textView: TextView = TextView(context)
    private var message: String = ""
    private var toastType: String = "default"
    private var backgroundColorProp: String? = null
    private var textColorProp: String? = null
    private var toastPosition: String = "bottom"
    private val handler = Handler(Looper.getMainLooper())

    init {
        orientation = HORIZONTAL
        gravity = Gravity.CENTER

        // Setup text view
        textView.setPadding(dpToPx(24), dpToPx(12), dpToPx(24), dpToPx(12))
        textView.textSize = 14f
        textView.setTextColor(Color.WHITE)

        // Setup container
        val background = GradientDrawable()
        background.cornerRadius = dpToPx(8).toFloat()
        background.setColor(getDefaultBackgroundColor("default"))
        setBackground(background)

        // Add shadow effect
        elevation = dpToPx(4).toFloat()

        addView(textView)

        // Initial state
        visibility = View.GONE
        alpha = 0f

        // Click listener
        setOnClickListener {
            sendEvent("onPress")
        }
    }

    fun setMessage(msg: String) {
        message = msg
        updateContent()
    }

    fun setDuration(duration: Double) {
        // Duration is handled by the manager
    }

    fun setPosition(position: String) {
        toastPosition = position
    }

    fun setType(type: String) {
        toastType = type
        updateAppearance()
        updateContent()
    }

    fun setBackgroundColorProp(color: String?) {
        backgroundColorProp = color
        updateAppearance()
    }

    fun setTextColorProp(color: String?) {
        textColorProp = color
        textView.setTextColor(parseColor(color) ?: Color.WHITE)
    }

    fun setVisible(visible: Boolean) {
        if (visible) {
            show()
        } else {
            hide()
        }
    }

    private fun show() {
        handler.post {
            visibility = View.VISIBLE
            animate()
                .alpha(1f)
                .setDuration(300)
                .withEndAction {
                    sendEvent("onShow")
                }
                .start()
        }
    }

    private fun hide() {
        handler.post {
            animate()
                .alpha(0f)
                .setDuration(300)
                .withEndAction {
                    visibility = View.GONE
                    sendEvent("onHide")
                }
                .start()
        }
    }

    private fun updateContent() {
        val icon = when (toastType) {
            "success" -> "✓ "
            "error" -> "✕ "
            "warning" -> "⚠ "
            "info" -> "ⓘ "
            else -> ""
        }
        textView.text = "$icon$message"
    }

    private fun updateAppearance() {
        val background = background as? GradientDrawable ?: return

        val backgroundColor = if (backgroundColorProp != null) {
            parseColor(backgroundColorProp) ?: getDefaultBackgroundColor(toastType)
        } else {
            getDefaultBackgroundColor(toastType)
        }

        background.setColor(backgroundColor)
    }

    private fun getDefaultBackgroundColor(type: String): Int {
        return when (type) {
            "success" -> Color.parseColor("#4CAF50")
            "error" -> Color.parseColor("#F44336")
            "warning" -> Color.parseColor("#FF9800")
            "info" -> Color.parseColor("#2196F3")
            else -> Color.parseColor("#333333")
        }
    }

    private fun parseColor(colorString: String?): Int? {
        return try {
            colorString?.let { Color.parseColor(it) }
        } catch (e: Exception) {
            null
        }
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            context.resources.displayMetrics
        ).toInt()
    }

    private fun sendEvent(eventName: String) {
        val event = Arguments.createMap()
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(
            id,
            eventName,
            event
        )
    }
}