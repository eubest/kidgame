package expo.modules.kidgamenativecore

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.Display
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.ConcurrentHashMap

class KidgameNativeCoreModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React application context is not available")

  private var soundPool: SoundPool? = null
  private val loadedSoundIds = ConcurrentHashMap<String, Int>()

  override fun definition() = ModuleDefinition {
    Name("KidgameNativeCore")

    OnCreate {
      initSoundPool()
    }

    OnDestroy {
      releaseSoundPool()
    }

    // ==========================================
    // HARDWARE VIBRATOR & TACTILE ENGINE
    // ==========================================
    Function("vibratePredefined") { effectType: String ->
      val vibrator = getVibrator() ?: return@Function false
      if (!vibrator.hasVibrator()) return@Function false

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val effectId = when (effectType.lowercase()) {
          "click" -> VibrationEffect.EFFECT_CLICK
          "heavy_click" -> VibrationEffect.EFFECT_HEAVY_CLICK
          "tick" -> VibrationEffect.EFFECT_TICK
          "double_click" -> VibrationEffect.EFFECT_DOUBLE_CLICK
          else -> VibrationEffect.EFFECT_CLICK
        }
        val effect = VibrationEffect.createPredefined(effectId)
        vibrator.vibrate(effect)
        return@Function true
      } else {
        @Suppress("DEPRECATION")
        val duration = when (effectType.lowercase()) {
          "click" -> 20L
          "heavy_click" -> 45L
          "tick" -> 10L
          "double_click" -> 35L
          else -> 20L
        }
        vibrator.vibrate(duration)
        return@Function true
      }
    }

    Function("vibratePattern") { pattern: List<Long>, repeatIndex: Int ->
      val vibrator = getVibrator() ?: return@Function false
      val timings = pattern.toLongArray()

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val effect = VibrationEffect.createWaveform(timings, repeatIndex)
        vibrator.vibrate(effect)
      } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(timings, repeatIndex)
      }
      return@Function true
    }

    Function("cancelVibration") {
      getVibrator()?.cancel()
    }

    // ==========================================
    // SOUNDPOOL ULTRA-LOW LATENCY AUDIO
    // ==========================================
    Function("loadSound") { assetPath: String ->
      val sp = soundPool ?: return@Function -1
      try {
        val afd = context.assets.openFd(assetPath)
        val soundId = sp.load(afd, 1)
        loadedSoundIds[assetPath] = soundId
        return@Function soundId
      } catch (e: Exception) {
        return@Function -1
      }
    }

    Function("playSound") { soundId: Int, volume: Float, rate: Float ->
      val sp = soundPool ?: return@Function -1
      val clampedVol = volume.coerceIn(0.0f, 1.0f)
      val clampedRate = rate.coerceIn(0.5f, 2.0f)
      return@Function sp.play(soundId, clampedVol, clampedVol, 1, 0, clampedRate)
    }

    Function("stopSound") { streamId: Int ->
      soundPool?.stop(streamId)
    }

    // ==========================================
    // DISPLAY & HARDWARE PERFORMANCE METRICS
    // ==========================================
    Function("getDisplayRefreshRate") {
      try {
        val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        @Suppress("DEPRECATION")
        val display = wm.defaultDisplay
        return@Function display.refreshRate.toDouble()
      } catch (e: Exception) {
        return@Function 60.0
      }
    }

    Function("getMemoryMetrics") {
      val runtime = Runtime.getRuntime()
      val usedMem = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024)
      val maxMem = runtime.maxMemory() / (1024 * 1024)
      val freeMem = runtime.freeMemory() / (1024 * 1024)

      return@Function mapOf(
        "usedMemoryMb" to usedMem,
        "freeMemoryMb" to freeMem,
        "maxMemoryMb" to maxMem,
        "lowMemoryThresholdMb" to (maxMem * 0.15).toLong()
      )
    }
  }

  private fun initSoundPool() {
    if (soundPool != null) return
    val audioAttributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_GAME)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

    soundPool = SoundPool.Builder()
      .setMaxStreams(10)
      .setAudioAttributes(audioAttributes)
      .build()
  }

  private fun releaseSoundPool() {
    soundPool?.release()
    soundPool = null
    loadedSoundIds.clear()
  }

  private fun getVibrator(): Vibrator? {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        vibratorManager.defaultVibrator
      } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
      }
    } catch (e: Exception) {
      null
    }
  }
}
