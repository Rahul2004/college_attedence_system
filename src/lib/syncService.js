// AttendOS Supabase Real-Time Broadcast & Cloud Persistence Service
// Synchronizes Admin Settings, Attendance Threshold, Users, Students, and Leaves across all browsers & devices.

import { supabase, isSupabaseConfigured } from './supabase';

const REALTIME_CHANNEL_NAME = 'attendos_global_sync';

/**
 * Broadcasts a live change to all other connected browsers and tabs across the globe via Supabase Realtime WebSocket.
 * Also broadcasts to local BroadcastChannel for zero-latency local tab sync.
 */
export async function broadcastCloudEvent(eventType, payload) {
  // 1. Zero-latency local broadcast (same browser tabs)
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('attendos_realtime_sync');
      bc.postMessage({ type: eventType, payload });
      bc.close();
    }
  } catch {
    // ignore
  }

  // 2. Global cross-browser/cross-device Supabase Realtime broadcast
  if (supabase && isSupabaseConfigured) {
    try {
      const channel = supabase.channel(REALTIME_CHANNEL_NAME);
      await channel.send({
        type: 'broadcast',
        event: eventType,
        payload
      });
    } catch (err) {
      console.warn('Realtime cloud broadcast error:', err);
    }
  }
}

/**
 * Subscribes to real-time events from Supabase Cloud.
 * Triggers the callback whenever another browser or device makes a change.
 */
export function subscribeToCloudEvents(onEventReceived) {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const channel = supabase.channel(REALTIME_CHANNEL_NAME, {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: '*' }, (eventData) => {
        const { event, payload } = eventData;
        if (event && payload !== undefined && typeof onEventReceived === 'function') {
          onEventReceived(event, payload);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connected to real-time cloud
        }
      });

    return channel;
  } catch (err) {
    console.warn('Failed to subscribe to cloud events:', err);
    return null;
  }
}

/**
 * Fetches institutional system settings (attendance threshold, term, etc.) from Supabase.
 */
export async function fetchSystemSettings() {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'attendance_threshold')
      .maybeSingle();

    if (!error && data?.value) {
      const val = typeof data.value === 'object' && data.value?.threshold !== undefined 
        ? data.value.threshold 
        : data.value;
      return Number(val);
    }
  } catch (err) {
    console.warn('Fetch system settings notice:', err);
  }
  return null;
}

/**
 * Saves institutional system settings (attendance threshold) to Supabase Cloud & broadcasts.
 */
export async function saveSystemSettingToCloud(key, value) {
  // Always broadcast immediately for real-time multi-browser sync
  await broadcastCloudEvent('THRESHOLD_UPDATE', Number(value));

  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase
      .from('system_settings')
      .upsert({
        key,
        value: typeof value === 'object' ? value : { threshold: Number(value) },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
  } catch (err) {
    console.warn('Save system setting to cloud error:', err);
  }
}

/**
 * Fetches users directory from Supabase Cloud.
 */
export async function fetchCloudUsers() {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Fetch users notice:', err);
  }
  return null;
}

/**
 * Saves users list to Supabase Cloud & broadcasts to all browsers.
 */
export async function saveUsersToCloud(users) {
  await broadcastCloudEvent('USERS_UPDATE', users);

  if (!supabase || !isSupabaseConfigured) return;
  try {
    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status || 'active',
      department: u.dept || u.department || 'General',
      updated_at: new Date().toISOString()
    }));
    await supabase.from('app_users').upsert(formatted, { onConflict: 'id' });
  } catch (err) {
    console.warn('Save users to cloud error:', err);
  }
}

/**
 * Fetches curriculum programs from Supabase Cloud.
 */
export async function fetchCloudPrograms() {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('academic_programs')
      .select('*');

    if (!error && data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        ...(item.degrees || item)
      }));
    }
  } catch (err) {
    console.warn('Fetch programs notice:', err);
  }
  return null;
}

/**
 * Saves academic curriculum programs to Supabase Cloud & broadcasts.
 */
export async function saveProgramsToCloud(programs) {
  await broadcastCloudEvent('PROGRAMS_UPDATE', programs);

  if (!supabase || !isSupabaseConfigured) return;
  try {
    const payload = programs.map(p => ({
      id: p.id,
      name: p.name || `${p.degree} - ${p.branch}`,
      degrees: p,
      updated_at: new Date().toISOString()
    }));
    await supabase.from('academic_programs').upsert(payload, { onConflict: 'id' });
  } catch (err) {
    console.warn('Save programs to cloud error:', err);
  }
}

/**
 * Fetches attendance roster for a specific course/subject from Supabase Cloud.
 */
export async function fetchCloudAttendance(classKey) {
  if (!supabase || !isSupabaseConfigured || !classKey) return null;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', `attendance_${classKey}`)
      .maybeSingle();

    if (!error && data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
  } catch (err) {
    console.warn('Fetch cloud attendance notice:', err);
  }
  return null;
}

/**
 * Saves attendance records to Supabase Cloud and broadcasts to all connected students and admins.
 */
export async function saveAttendanceToCloud(classKey, studentsList) {
  // Broadcast real-time event to all connected devices immediately
  await broadcastCloudEvent('STUDENTS_UPDATE', { classKey, students: studentsList });

  if (!supabase || !isSupabaseConfigured || !classKey) return;
  try {
    await supabase
      .from('system_settings')
      .upsert({
        key: `attendance_${classKey}`,
        value: studentsList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
  } catch (err) {
    console.warn('Save attendance to cloud error:', err);
  }
}

/**
 * Fetches institutional leaves applications from Supabase Cloud.
 */
export async function fetchCloudLeaves() {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'college_leaves_directory')
      .maybeSingle();

    if (!error && data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
  } catch (err) {
    console.warn('Fetch cloud leaves notice:', err);
  }
  return null;
}

/**
 * Saves leaves applications to Supabase Cloud and broadcasts status updates.
 */
export async function saveLeavesToCloud(leavesList) {
  await broadcastCloudEvent('LEAVES_UPDATE', leavesList);

  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase
      .from('system_settings')
      .upsert({
        key: 'college_leaves_directory',
        value: leavesList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
  } catch (err) {
    console.warn('Save leaves to cloud error:', err);
  }
}

/**
 * Fetches attendance disputes from Supabase Cloud.
 */
export async function fetchCloudDisputes() {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'college_attendance_disputes')
      .maybeSingle();

    if (!error && data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
  } catch (err) {
    console.warn('Fetch cloud disputes notice:', err);
  }
  return null;
}

/**
 * Saves attendance disputes to Supabase Cloud and broadcasts to all clients.
 */
export async function saveDisputesToCloud(disputesList) {
  await broadcastCloudEvent('DISPUTES_UPDATE', disputesList);

  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase
      .from('system_settings')
      .upsert({
        key: 'college_attendance_disputes',
        value: disputesList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
  } catch (err) {
    console.warn('Save disputes to cloud error:', err);
  }
}

/**
 * Fetches campus announcements from Supabase Cloud.
 */
export async function fetchCloudAnnouncements() {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'college_campus_announcements')
      .maybeSingle();

    if (!error && data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
  } catch (err) {
    console.warn('Fetch cloud announcements notice:', err);
  }
  return null;
}

/**
 * Saves campus announcements to Supabase Cloud and broadcasts.
 */
export async function saveAnnouncementsToCloud(announcementsList) {
  await broadcastCloudEvent('ANNOUNCEMENTS_UPDATE', announcementsList);

  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase
      .from('system_settings')
      .upsert({
        key: 'college_campus_announcements',
        value: announcementsList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
  } catch (err) {
    console.warn('Save announcements to cloud error:', err);
  }
}

/**
 * Fetches administrative audit log from Supabase Cloud.
 */
export async function fetchCloudAuditLogs() {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'college_system_audit_logs')
      .maybeSingle();

    if (!error && data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
  } catch (err) {
    console.warn('Fetch cloud audit logs notice:', err);
  }
  return null;
}

/**
 * Appends an audit log entry to Supabase Cloud.
 */
export async function recordAuditLog(actorEmail, role, action, details) {
  const newEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorEmail: actorEmail || 'system@college.edu.in',
    role: role || 'admin',
    action,
    details: typeof details === 'object' ? JSON.stringify(details) : details,
    timestamp: new Date().toISOString()
  };

  try {
    const existing = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('college_system_audit_logs') || '[]') : [];
    const updated = [newEntry, ...existing.slice(0, 99)]; // keep latest 100 logs
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_system_audit_logs', JSON.stringify(updated));
    }

    await broadcastCloudEvent('AUDIT_LOG_UPDATE', updated);

    if (supabase && isSupabaseConfigured) {
      await supabase
        .from('system_settings')
        .upsert({
          key: 'college_system_audit_logs',
          value: updated,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    }
  } catch (err) {
    console.warn('Record audit log notice:', err);
  }
}


