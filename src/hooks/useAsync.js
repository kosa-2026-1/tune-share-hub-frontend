import { useCallback, useEffect, useState } from 'react'

export function useAsync(asyncFn, dependencies = [], options = {}) {
  const { immediate = true } = options
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(immediate)

  const execute = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        const result = await asyncFn(...args)
        setData(result)
        return result
      } catch (caughtError) {
        setError(caughtError)
        throw caughtError
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  )

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {})
    }
  }, [execute, immediate])

  return { data, error, loading, execute, setData }
}
