import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const CRITICAL_TYPES = ['reservation', 'check_in', 'check_out', 'housekeeping'];

let notificationAudio: HTMLAudioElement | null = null;

function getOrCreateAudio(): HTMLAudioElement {
  if (!notificationAudio) {
    notificationAudio = new Audio('/sounds/notification.wav');
    notificationAudio.volume = 0.6;
  }
  return notificationAudio;
}

function playNotificationSound() {
  try {
    const audio = getOrCreateAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // Audio playback may fail without user gesture
  }
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    reservation: '📅',
    check_in: '🟢',
    check_out: '🟠',
    housekeeping: '🧹',
  };
  return icons[type] || 'ℹ️';
}

export function usePushNotifications() {
  const queryClient = useQueryClient();
  const permissionRef = useRef<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const showNotification = useCallback((title: string, body: string, type: string) => {
    // Always play sound for critical alerts regardless of focus
    playNotificationSound();

    if (permissionRef.current !== 'granted') return;
    if (document.hasFocus()) return; // only push when tab is not focused

    const icon = getNotificationIcon(type);
    try {
      const notif = new Notification(`${icon} ${title}`, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: `hotelpro-${type}-${Date.now()}`,
        requireInteraction: type === 'reservation' || type === 'housekeeping',
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch {
      // Notification constructor may fail in some contexts
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const channel = supabase
      .channel('push-notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const record = payload.new as { type: string; title: string; message: string };
          if (CRITICAL_TYPES.includes(record.type)) {
            showNotification(record.title, record.message, record.type);
          }
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showNotification, queryClient]);

  return { requestPermission, permissionGranted: permissionRef.current === 'granted' };
}
