import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function useManagerAlerts() {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(function() {
    const billChannel = supabase
      .channel('bill-requests-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bill_requests' },
        function(payload) {
          addAlert({
            type: 'bill',
            message: 'New bill request received!',
            data: payload.new,
          })
        }
      )
      .subscribe()

    const feedbackChannel = supabase
      .channel('feedback-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback' },
        function(payload) {
          if (payload.new.overall_rating <= 2) {
            addAlert({
              type: 'feedback',
              message: 'Low rating feedback received!',
              data: payload.new,
            })
          }
        }
      )
      .subscribe()

    const ordersChannel = supabase
      .channel('orders-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        function(payload) {
          addAlert({
            type: 'order',
            message: 'New order received!',
            data: payload.new,
          })
        }
      )
      .subscribe()

    return function() {
      supabase.removeChannel(billChannel)
      supabase.removeChannel(feedbackChannel)
      supabase.removeChannel(ordersChannel)
    }
  }, [])

  function addAlert(alert) {
    const newAlert = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      read: false,
      ...alert,
    }
    setAlerts(function(prev) { return [newAlert, ...prev] })
    setUnreadCount(function(prev) { return prev + 1 })
  }

  function markAllRead() {
    setAlerts(function(prev) {
      return prev.map(function(a) { return { ...a, read: true } })
    })
    setUnreadCount(0)
  }

  function clearAlerts() {
    setAlerts([])
    setUnreadCount(0)
  }

  return { alerts, unreadCount, markAllRead, clearAlerts }
}

export default useManagerAlerts