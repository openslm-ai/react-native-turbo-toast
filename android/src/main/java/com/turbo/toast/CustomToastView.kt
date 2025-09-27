package com.turbo.toast

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ObjectAnimator
import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Button
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.modules.core.DeviceEventManagerModule

class CustomToastView(private val context: Context) {
    private var currentView: View? = null
    private val handler = Handler(Looper.getMainLooper())
    private var dismissRunnable: Runnable? = null
    private var windowManager: WindowManager? = null

    companion object {
        private val TYPE_COLORS = mapOf(
            "success" to "#4caf50",
            "error" to "#f44336",
            "warning" to "#ff9800",
            "info" to "#2196f3",
            "default" to "#333333"
        )

        private val TYPE_ICONS = mapOf(
            "success" to "✓",
            "error" to "✕",
            "warning" to "⚠",
            "info" to "ⓘ"
        )
    }

    fun show(options: ReadableMap, activity: Activity) {
        handler.post {
            // Cancel existing toast
            hide()

            // Extract options
            val message = options.getString("message") ?: ""
            val type = options.getString("type") ?: "default"
            val position = options.getString("position") ?: "bottom"
            val duration = getDuration(options)
            val backgroundColor = options.getString("backgroundColor")
            val textColor = options.getString("textColor") ?: "#FFFFFF"
            val icon = options.getString("icon")
            val toastId = options.getString("id") ?: ""
            val action = if (options.hasKey("action")) options.getMap("action") else null
            val actions = if (options.hasKey("actions")) options.getArray("actions") else null
            val showProgressBar = if (options.hasKey("showProgressBar"))
                options.getBoolean("showProgressBar") else false
            val progress = if (options.hasKey("progress"))
                options.getDouble("progress").toFloat() else 0f
            val progressColor = options.getString("progressColor")

            // Create custom view
            val toastView = createToastView(
                message, type, backgroundColor, textColor, icon,
                action, actions, toastId, activity,
                showProgressBar, progress, progressColor
            )

            // Create container for positioning
            val container = FrameLayout(activity)
            container.layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )

            // Add toast to container with proper positioning
            val params = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )

            when (position) {
                "top" -> {
                    params.gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                    params.topMargin = dpToPx(20)
                }
                "center" -> {
                    params.gravity = Gravity.CENTER
                }
                else -> { // bottom
                    params.gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                    params.bottomMargin = dpToPx(20)
                }
            }

            toastView.layoutParams = params
            container.addView(toastView)

            // Add to activity's content view
            val rootView = activity.findViewById<ViewGroup>(android.R.id.content)
            rootView.addView(container)

            currentView = container

            // Animate in
            animateIn(toastView)

            // Schedule dismissal
            dismissRunnable = Runnable {
                hide()
            }
            handler.postDelayed(dismissRunnable!!, duration.toLong())
        }
    }

    fun update(id: String, options: ReadableMap) {
        handler.post {
            currentView?.let { container ->
                val toastView = (container as FrameLayout).getChildAt(0) as? LinearLayout
                toastView?.let { toast ->
                    // Update message
                    if (options.hasKey("message")) {
                        val textView = toast.findViewWithTag<TextView>("message")
                        textView?.text = options.getString("message")
                    }

                    // Update progress
                    if (options.hasKey("progress")) {
                        val progressBar = toast.findViewWithTag<ProgressBar>("progress")
                        progressBar?.let {
                            val progress = (options.getDouble("progress") * 100).toInt()
                            it.progress = progress
                        }
                    }
                }
            }
        }
    }

    fun hide() {
        handler.post {
            dismissRunnable?.let { handler.removeCallbacks(it) }
            dismissRunnable = null

            currentView?.let { container ->
                val toastView = (container as FrameLayout).getChildAt(0)
                animateOut(toastView) {
                    val rootView = container.parent as? ViewGroup
                    rootView?.removeView(container)
                    currentView = null
                }
            }
        }
    }

    private fun createToastView(
        message: String,
        type: String,
        backgroundColor: String?,
        textColor: String,
        icon: String?,
        action: ReadableMap?,
        actions: ReadableArray?,
        toastId: String,
        activity: Activity,
        showProgressBar: Boolean,
        progress: Float,
        progressColor: String?
    ): View {
        val layout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dpToPx(24), dpToPx(12), dpToPx(24), dpToPx(12))

            // Background with rounded corners
            val bgDrawable = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8).toFloat()
                setColor(Color.parseColor(backgroundColor ?: TYPE_COLORS[type]))
            }
            background = bgDrawable

            // Shadow effect
            elevation = dpToPx(4).toFloat()
        }

        // Create horizontal layout for icon and message
        val contentLayout = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        // Add icon
        val iconToUse = icon ?: TYPE_ICONS[type]
        if (!iconToUse.isNullOrEmpty()) {
            val iconView = TextView(context).apply {
                text = iconToUse
                setTextColor(Color.parseColor(textColor))
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
                setPadding(0, 0, dpToPx(8), 0)
            }
            contentLayout.addView(iconView)
        }

        // Add message
        val textView = TextView(context).apply {
            text = message
            setTextColor(Color.parseColor(textColor))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            tag = "message"
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        contentLayout.addView(textView)

        // Add action buttons
        val actionsList = mutableListOf<ReadableMap>()
        if (actions != null) {
            for (i in 0 until actions.size()) {
                actions.getMap(i)?.let { actionsList.add(it) }
            }
        } else if (action != null) {
            actionsList.add(action)
        }

        for (actionItem in actionsList) {
            val actionText = actionItem.getString("text") ?: continue
            val actionStyle = actionItem.getString("style") ?: "default"

            val actionButton = Button(context).apply {
                text = actionText
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
                setPadding(dpToPx(8), dpToPx(4), dpToPx(8), dpToPx(4))

                // Style based on action style
                when (actionStyle) {
                    "destructive" -> {
                        setTextColor(Color.parseColor("#FF4444"))
                        setBackgroundColor(Color.parseColor("#33FF4444"))
                    }
                    "cancel" -> {
                        setTextColor(Color.parseColor("#CCCCCC"))
                        setBackgroundColor(Color.parseColor("#33FFFFFF"))
                    }
                    else -> {
                        setTextColor(Color.parseColor(textColor))
                        setBackgroundColor(Color.TRANSPARENT)
                    }
                }

                setOnClickListener {
                    // Send event to React Native
                    try {
                        val reactContext = activity as? com.facebook.react.ReactActivity
                        reactContext?.reactInstanceManager?.currentReactContext
                            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                            ?.emit("TurboToast:ActionPressed",
                                com.facebook.react.bridge.Arguments.createMap().apply {
                                    putString("toastId", toastId)
                                    putString("style", actionStyle)
                                })
                    } catch (e: Exception) {
                        // Handle error silently
                    }

                    // Hide toast if not cancel action
                    if (actionStyle != "cancel") {
                        hide()
                    }
                }
            }
            contentLayout.addView(actionButton)
        }

        layout.addView(contentLayout)

        // Add progress bar if needed
        if (showProgressBar) {
            val progressBar = ProgressBar(
                context, null, android.R.attr.progressBarStyleHorizontal
            ).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    dpToPx(4)
                ).apply {
                    topMargin = dpToPx(8)
                }
                max = 100
                this.progress = (progress * 100).toInt()
                tag = "progress"

                // Set progress color if provided
                progressColor?.let {
                    progressDrawable?.setColorFilter(
                        Color.parseColor(it),
                        android.graphics.PorterDuff.Mode.SRC_IN
                    )
                }
            }
            layout.addView(progressBar)
        }

        return layout
    }

    private fun animateIn(view: View) {
        view.alpha = 0f
        view.translationY = dpToPx(50).toFloat()

        view.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(300)
            .start()
    }

    private fun animateOut(view: View, onComplete: () -> Unit) {
        view.animate()
            .alpha(0f)
            .translationY(dpToPx(-50).toFloat())
            .setDuration(300)
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    onComplete()
                }
            })
            .start()
    }

    private fun getDuration(options: ReadableMap): Int {
        return when {
            !options.hasKey("duration") -> 2000
            options.getType("duration") == ReadableType.String -> {
                when (options.getString("duration")) {
                    "long" -> 3500
                    else -> 2000
                }
            }
            options.getType("duration") == ReadableType.Number -> {
                options.getDouble("duration").toInt()
            }
            else -> 2000
        }
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            context.resources.displayMetrics
        ).toInt()
    }
}