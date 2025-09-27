package com.turbo.toast

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.GestureDetector
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.ViewCompat
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import kotlin.math.abs

class TurboToastView(
    private val context: Context,
    private val options: ReadableMap,
    private val onDismiss: () -> Unit = {}
) : FrameLayout(context) {

    private val handler = Handler(Looper.getMainLooper())
    private var dismissRunnable: Runnable? = null
    private val gestureDetector: GestureDetector
    private var initialX = 0f
    private var isDragging = false

    init {
        setupView()
        gestureDetector = GestureDetector(context, GestureListener())
    }

    private fun setupView() {
        val container = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dpToPx(24), dpToPx(12), dpToPx(24), dpToPx(12))
        }

        // Background
        val backgroundDrawable = GradientDrawable().apply {
            cornerRadius = dpToPx(8).toFloat()
            setColor(getBackgroundColor())
        }
        container.background = backgroundDrawable

        // Add shadow
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            elevation = dpToPx(4).toFloat()
        }

        // Icon and message
        val message = options.getString("message") ?: ""
        val icon = getIcon()
        val textColor = getTextColor()

        val textView = TextView(context).apply {
            text = if (icon.isNotEmpty()) "$icon $message" else message
            setTextColor(Color.parseColor(textColor))
            textSize = 14f
            layoutParams = LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f)
        }
        container.addView(textView)

        // Action button
        if (options.hasKey("action")) {
            val action = options.getMap("action")
            if (action != null && action.hasKey("text")) {
                val actionButton = Button(context, null, android.R.attr.borderlessButtonStyle).apply {
                    text = action.getString("text")
                    setTextColor(Color.parseColor(textColor))
                    textSize = 14f
                    setTypeface(typeface, android.graphics.Typeface.BOLD)
                    minWidth = 0
                    minimumWidth = 0
                    setPadding(dpToPx(12), dpToPx(8), dpToPx(12), dpToPx(8))

                    setOnClickListener {
                        // Execute callback if provided
                        if (action.hasKey("onPress")) {
                            // Note: Callbacks need to be handled through the bridge
                            // This is a simplified version
                        }
                        dismiss()
                    }
                }
                container.addView(actionButton)
            }
        }

        addView(container)

        // Accessibility
        ViewCompat.setImportantForAccessibility(this, ViewCompat.IMPORTANT_FOR_ACCESSIBILITY_YES)
        contentDescription = message
        announceForAccessibility(message)

        // Handle dismiss on press
        if (!options.hasKey("dismissOnPress") || options.getBoolean("dismissOnPress")) {
            setOnClickListener { dismiss() }
        }

        // Handle swipe to dismiss
        if (!options.hasKey("swipeToDismiss") || options.getBoolean("swipeToDismiss")) {
            setOnTouchListener { _, event ->
                gestureDetector.onTouchEvent(event)
                handleSwipe(event)
            }
        }
    }

    private fun handleSwipe(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                initialX = x
                isDragging = false
                cancelDismissTimer()
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                val deltaX = event.rawX - event.x
                val distance = abs(deltaX - initialX)
                if (distance > dpToPx(10)) {
                    isDragging = true
                    x = deltaX
                    alpha = 1f - (distance / width.toFloat()).coerceIn(0f, 1f)
                }
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (isDragging) {
                    val distance = abs(x - initialX)
                    if (distance > width / 3) {
                        animateDismiss()
                    } else {
                        animateReset()
                    }
                    isDragging = false
                    return true
                } else {
                    startDismissTimer()
                }
            }
        }
        return false
    }

    fun show() {
        alpha = 0f
        translationY = dpToPx(100).toFloat()

        animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(getAnimationDuration())
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    startDismissTimer()
                }
            })
            .start()
    }

    private fun startDismissTimer() {
        cancelDismissTimer()
        val duration = getDuration()
        dismissRunnable = Runnable { dismiss() }
        handler.postDelayed(dismissRunnable!!, duration)
    }

    private fun cancelDismissTimer() {
        dismissRunnable?.let {
            handler.removeCallbacks(it)
            dismissRunnable = null
        }
    }

    fun dismiss() {
        cancelDismissTimer()
        animate()
            .alpha(0f)
            .translationY(dpToPx(100).toFloat())
            .setDuration(getAnimationDuration())
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    onDismiss()
                }
            })
            .start()
    }

    private fun animateDismiss() {
        val targetX = if (x > initialX) width.toFloat() else -width.toFloat()
        animate()
            .x(targetX)
            .alpha(0f)
            .setDuration(200)
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    onDismiss()
                }
            })
            .start()
    }

    private fun animateReset() {
        animate()
            .x(initialX)
            .alpha(1f)
            .setDuration(200)
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    startDismissTimer()
                }
            })
            .start()
    }

    private fun getBackgroundColor(): Int {
        if (options.hasKey("backgroundColor")) {
            return try {
                Color.parseColor(options.getString("backgroundColor"))
            } catch (e: Exception) {
                getDefaultBackgroundColor()
            }
        }
        return getDefaultBackgroundColor()
    }

    private fun getDefaultBackgroundColor(): Int {
        val type = options.getString("type") ?: "default"
        return when (type) {
            "success" -> Color.parseColor("#4CAF50")
            "error" -> Color.parseColor("#F44336")
            "warning" -> Color.parseColor("#FF9800")
            "info" -> Color.parseColor("#2196F3")
            else -> Color.parseColor("#333333")
        }
    }

    private fun getTextColor(): String {
        return options.getString("textColor") ?: "#FFFFFF"
    }

    private fun getIcon(): String {
        if (options.hasKey("icon")) {
            return options.getString("icon") ?: ""
        }
        val type = options.getString("type") ?: "default"
        return when (type) {
            "success" -> "✓"
            "error" -> "✕"
            "warning" -> "⚠"
            "info" -> "ⓘ"
            else -> ""
        }
    }

    private fun getDuration(): Long {
        return when {
            !options.hasKey("duration") -> 2000L
            options.getType("duration") == ReadableType.String -> {
                when (options.getString("duration")) {
                    "long" -> 3500L
                    else -> 2000L
                }
            }
            options.getType("duration") == ReadableType.Number -> {
                options.getDouble("duration").toLong()
            }
            else -> 2000L
        }
    }

    private fun getAnimationDuration(): Long {
        return if (options.hasKey("animationDuration")) {
            options.getDouble("animationDuration").toLong()
        } else {
            300L
        }
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            context.resources.displayMetrics
        ).toInt()
    }

    private inner class GestureListener : GestureDetector.SimpleOnGestureListener() {
        override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
            if (!options.hasKey("dismissOnPress") || options.getBoolean("dismissOnPress")) {
                dismiss()
                return true
            }
            return false
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        cancelDismissTimer()
    }
}