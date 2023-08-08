((
  { isDebugEnabled } = pipy.solve('config.js'),
  {
    metricsCache,
  } = pipy.solve('lib/metrics.js'),
) => (

pipy({
  _metrics: null,
})

.export('connect-tcp', {
  __target: null,
  __metricLabel: null,
  __upstream: {},
})

.pipeline()
.onStart(
  () => void (
    _metrics = metricsCache.get(__metricLabel),
    _metrics.activeConnectionGauge.increase()
  )
)
.onEnd(
  () => void (
    _metrics.activeConnectionGauge.decrease()
  )
)
.branch(
  isDebugEnabled, (
    $=>$
    .handleStreamStart(
      () => (
        console.log('[connect-tcp] metrics, target :', __metricLabel, __target)
      )
    )
  )
)
.handleData(
  data => (
    _metrics.sendBytesTotalCounter.increase(data.size)
  )
)
.connect(() => __target)
.handleStreamEnd(
  e => e.error && (__upstream.error = e.error)
)
.handleData(
  data => (
    _metrics.receiveBytesTotalCounter.increase(data.size)
  )
)

))()