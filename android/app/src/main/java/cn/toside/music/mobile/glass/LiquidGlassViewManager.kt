package cn.toside.music.mobile.glass

import android.view.ViewGroup
import com.example.liquidglass.GlassMaterial
import com.example.liquidglass.LiquidGlassView
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * 把 QWEA0/Liquid-Glass-Android 的 LiquidGlassView 暴露成 RN 组件 `RCTLiquidGlass`。
 *
 * 该 View 会采样"绘制在它背后"的内容（真实 SDF 折射 + 背景模糊 + 色散），
 * 所以 backdropSource 指向 Activity 的 content 根容器，保证能采到滚动中的列表。
 */
class LiquidGlassViewManager : ViewGroupManager<LiquidGlassView>() {

  override fun getName(): String = VIEW_NAME

  override fun createViewInstance(reactContext: ThemedReactContext): LiquidGlassView {
    val view = LiquidGlassView(reactContext)
    // 背景会随滚动变化，必须开启动态采样
    view.enableDynamicBackground = true
    view.enableBackdropBlur = true
    view.enableEdgeHighlight = true
    view.enableChromaticAberration = true
    view.enablePressEffect = false
    view.enableShadow = false
    view.collectFrameStats = false
    view.clipChildren = false
    view.clipToPadding = false
    attachBackdrop(view)
    return view
  }

  override fun onAfterUpdateTransaction(view: LiquidGlassView) {
    super.onAfterUpdateTransaction(view)
    attachBackdrop(view)
  }

  private fun attachBackdrop(view: LiquidGlassView) {
    if (view.backdropSource != null) return
    val activity = (view.context as? ThemedReactContext)?.currentActivity ?: return
    val content = activity.findViewById<ViewGroup>(android.R.id.content) ?: return
    view.backdropSource = content
  }

  private fun dp(view: LiquidGlassView, value: Float): Float =
    value * view.resources.displayMetrics.density

  @ReactProp(name = "cornerRadius", defaultFloat = 24f)
  fun setCornerRadius(view: LiquidGlassView, radiusDp: Float) {
    view.cornerRadius = dp(view, radiusDp)
  }

  @ReactProp(name = "tint")
  fun setTint(view: LiquidGlassView, color: Int) {
    // 注意：setGlassTint(int, float) 的第二参数是染色强度，1f 会变成不透明白块
    view.setGlassTint(color, TINT_STRENGTH)
  }

  @ReactProp(name = "tintStrength", defaultFloat = TINT_STRENGTH)
  fun setTintStrength(view: LiquidGlassView, strength: Float) {
    view.setGlassTint(view.glassTint, strength)
  }

  @ReactProp(name = "blurAmount", defaultFloat = 0.06f)
  fun setBlurAmount(view: LiquidGlassView, value: Float) {
    view.blurAmount = value
  }

  @ReactProp(name = "saturation", defaultFloat = 140f)
  fun setSaturation(view: LiquidGlassView, value: Float) {
    view.saturation = value
  }

  @ReactProp(name = "bevelWidth", defaultFloat = 16f)
  fun setBevelWidth(view: LiquidGlassView, value: Float) {
    view.bevelWidth = dp(view, value)
  }

  @ReactProp(name = "refractionHeight", defaultFloat = 40f)
  fun setRefractionHeight(view: LiquidGlassView, value: Float) {
    view.refractionHeight = dp(view, value)
  }

  @ReactProp(name = "dispersion", defaultFloat = 0.08f)
  fun setDispersion(view: LiquidGlassView, value: Float) {
    view.dispersionStrength = value
  }

  @ReactProp(name = "material")
  fun setMaterial(view: LiquidGlassView, material: String?) {
    view.material = when (material) {
      "clear" -> GlassMaterial.CLEAR
      else -> GlassMaterial.REGULAR
    }
  }

  @ReactProp(name = "dynamic")
  fun setDynamic(view: LiquidGlassView, value: Boolean) {
    view.enableDynamicBackground = value
  }

  @ReactProp(name = "shaderPipeline", defaultBoolean = true)
  fun setShaderPipeline(view: LiquidGlassView, value: Boolean) {
    view.useShaderPipeline = value
  }

  companion object {
    const val VIEW_NAME = "RCTLiquidGlass"
    const val TINT_STRENGTH = 0.14f
  }
}
