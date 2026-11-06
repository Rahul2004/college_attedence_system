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
    // 1. Primary: Load app_users table
    const { data: appUsers, error: appErr } = await supabase
      .from('app_users')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!appErr && appUsers && appUsers.length > 0) {
      return appUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        dept: u.department || 'General',
        lastActive: u.updated_at ? new Date(u.updated_at).toLocaleDateString() : 'Active'
      }));
    }

    // 2. Secondary: Load from system_settings backup key
    const { data: setUsers } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'college_app_users')
      .maybeSingle();

    if (setUsers?.value && Array.isArray(setUsers.value) && setUsers.value.length > 0) {
      return setUsers.value;
    }

    // 3. Tertiary fallback: Load from registered auth profiles
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profErr && profiles && profiles.length > 0) {
      return profiles.map(p => ({
        id: p.id,
        name: p.full_name || p.email?.split('@')[0],
        email: p.email,
        role: p.role || 'student',
        status: p.status || 'pending_approval',
        dept: p.department || p.program_name || 'General',
        program_id: p.program_id,
        program_name: p.program_name,
        semester: p.semester,
        section: p.section,
        rollNo: p.roll_no,
        review_notes: p.review_notes,
        lastActive: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Recent'
      }));
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
    // 1. Save directly into system_settings as authoritative fallback for instant multi-device hydration
    await supabase
      .from('system_settings')
      .upsert({
        key: 'college_app_users',
        value: users,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    // 2. Also save to app_users table
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
 * Phase 2 Normalized: Calls atomic commit_attendance_batch stored procedure with system_settings fallback.
 */
export async function saveAttendanceToCloud(classKey, studentsList) {
  // Broadcast real-time event to all connected devices immediately
  await broadcastCloudEvent('STUDENTS_UPDATE', { classKey, students: studentsList });

  if (!supabase || !isSupabaseConfigured || !classKey) return;

  const parts = classKey.split('_');
  const programId = parts[0] || 'btech-cse';
  const sem = parts[1] || 'I';
  const subjectCode = parts[2] || 'CS-601';

  // 1. Primary Normalized Relational Atomic Commit
  try {
    const userRes = await supabase.auth.getUser();
    await supabase.rpc('commit_attendance_batch', {
      p_class_key: classKey,
      p_program_id: programId,
      p_semester: sem,
      p_subject_code: subjectCode,
      p_slot_id: 'P1',
      p_session_date: new Date().toISOString().split('T')[0],
      p_faculty_email: userRes?.data?.user?.email || null,
      p_records: studentsList
    });
  } catch {
    // Graceful fallback to system_settings if RPC migration has not yet been executed in console
  }

  // 2. Secondary Fast Hydration Cache (Maintains 100% Backward Compatibility)
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
    // 1. Primary: Load from relational leave_applications table
    const { data: relLeaves, error: relErr } = await supabase
      .from('leave_applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (!relErr && relLeaves && relLeaves.length > 0) {
      return relLeaves.map(l => ({
        id: l.id,
        studentId: l.student_id,
        studentName: l.student_name,
        rollNo: l.roll_no,
        category: l.category,
        subject: l.subject_code,
        dates: `${l.start_date} to ${l.end_date}`,
        startDate: l.start_date,
        endDate: l.end_date,
        reason: l.reason,
        status: l.status,
        appliedAt: l.applied_at,
        reviewedBy: l.reviewed_by
      }));
    }

    // 2. Fallback: Load from system_settings
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

  // 1. Primary: Upsert into relational leave_applications
  try {
    if (Array.isArray(leavesList) && leavesList.length > 0) {
      const payload = leavesList.map(l => ({
        id: l.id?.includes('-') && l.id.length > 10 ? l.id : undefined,
        student_id: l.studentId || 'stu-unknown',
        student_name: l.studentName || 'Student',
        roll_no: l.rollNo || '',
        category: l.category || l.type || 'General',
        subject_code: l.subject || l.subjectCode || 'All',
        start_date: l.startDate || new Date().toISOString().split('T')[0],
        end_date: l.endDate || new Date().toISOString().split('T')[0],
        reason: l.reason || '',
        status: l.status || 'PENDING',
        reviewed_by: l.reviewedBy || null
      })).filter(item => item.id !== undefined);

      if (payload.length > 0) {
        await supabase.from('leave_applications').upsert(payload, { onConflict: 'id' });
      }
    }
  } catch {}

  // 2. Secondary: Save to system_settings for instant backward-compatible fallback
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
    // 1. Primary: Load from relational attendance_disputes table
    const { data: relDisp, error: dispErr } = await supabase
      .from('attendance_disputes')
      .select('*')
      .order('applied_at', { ascending: false });

    if (!dispErr && relDisp && relDisp.length > 0) {
      return relDisp.map(d => ({
        id: d.id,
        studentId: d.student_id,
        studentName: d.student_name,
        rollNo: d.roll_no,
        subjectCode: d.subject_code,
        subjectName: d.subject_name,
        classDate: d.class_date,
        reason: d.reason,
        status: d.status,
        appliedAt: d.applied_at,
        reviewedBy: d.reviewed_by,
        resolutionNote: d.resolution_note
      }));
    }

    // 2. Fallback: Load from system_settings
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

  // 1. Primary: Upsert into relational attendance_disputes
  try {
    if (Array.isArray(disputesList) && disputesList.length > 0) {
      const payload = disputesList.map(d => ({
        id: d.id?.includes('-') && d.id.length > 10 ? d.id : undefined,
        student_id: d.studentId || 'stu-unknown',
        student_name: d.studentName || 'Student',
        roll_no: d.rollNo || '',
        subject_code: d.subjectCode || 'CS-601',
        subject_name: d.subjectName || '',
        class_date: d.classDate || new Date().toISOString().split('T')[0],
        reason: d.reason || '',
        status: d.status || 'PENDING',
        reviewed_by: d.reviewedBy || null,
        resolution_note: d.resolutionNote || null
      })).filter(item => item.id !== undefined);

      if (payload.length > 0) {
        await supabase.from('attendance_disputes').upsert(payload, { onConflict: 'id' });
      }
    }
  } catch {}

  // 2. Secondary: Save to system_settings for instant backward-compatible fallback
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

/**
 * Fetches student admissions forms from Supabase Cloud.
 */
export async function fetchCloudAdmissionsForms() {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'college_student_admissions_forms')
      .maybeSingle();

    if (!error && data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
  } catch (err) {
    console.warn('Fetch cloud admissions forms notice:', err);
  }
  return null;
}

/**
 * Saves student admissions forms to Supabase Cloud and broadcasts to all connected tabs/browsers.
 */
export async function saveAdmissionsFormsToCloud(formsList) {
  await broadcastCloudEvent('ADMISSIONS_FORMS_UPDATE', formsList);

  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase
      .from('system_settings')
      .upsert({
        key: 'college_student_admissions_forms',
        value: formsList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
  } catch (err) {
    console.warn('Save admissions forms to cloud error:', err);
  }
}


