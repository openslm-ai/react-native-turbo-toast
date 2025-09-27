package com.turbo.toast

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

abstract class TurboToastSpec(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    abstract fun show(options: ReadableMap, promise: Promise)
    abstract fun hide()
    abstract fun hideAll()
}