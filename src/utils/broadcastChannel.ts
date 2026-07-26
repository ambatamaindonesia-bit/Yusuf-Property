// BroadcastChannel Cross-Tab and Multi-User Realtime Sync Utility
// Allows instantly broadcasting state updates between active tabs and windows

const CHANNEL_NAME = 'yp_erp_sync_channel';

export interface BroadcastMessage {
  type: 'SYNC_KEY' | 'SYNC_ALL' | 'USER_ACTION_NOTIFICATION';
  key?: string;
  payload?: any;
  senderUser?: string;
  timestamp?: string;
}

let syncChannel: BroadcastChannel | null = null;

export function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null;
  }
  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }
  return syncChannel;
}

export function broadcastDataUpdate(key: string, data: any, userLogin?: string) {
  const channel = getSyncChannel();
  if (channel) {
    const msg: BroadcastMessage = {
      type: 'SYNC_KEY',
      key,
      payload: data,
      senderUser: userLogin || 'User ERP',
      timestamp: new Date().toLocaleTimeString('id-ID'),
    };
    channel.postMessage(msg);
  }
}

export function broadcastFullSync(allData: Record<string, any>, userLogin?: string) {
  const channel = getSyncChannel();
  if (channel) {
    const msg: BroadcastMessage = {
      type: 'SYNC_ALL',
      payload: allData,
      senderUser: userLogin || 'User ERP',
      timestamp: new Date().toLocaleTimeString('id-ID'),
    };
    channel.postMessage(msg);
  }
}
