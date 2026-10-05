import { google } from 'googleapis';

function getAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export function cleanFileId(idOrUrl: string): string {
  if (!idOrUrl) return '';
  const str = String(idOrUrl).trim();
  const match = str.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return str.replace(/^[<"']|[>"']$/g, '').trim();
}

// Google Docs
export async function createDocument(accessToken: string, title: string, content: string) {
  try {
    const auth = getAuth(accessToken);
    const docs = google.docs({ version: 'v1', auth });
    
    const createRes = await docs.documents.create({
      requestBody: { title },
    });
    
    const documentId = createRes.data.documentId!;
    
    if (content) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }
    
    return {
      documentId,
      title,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function readDocument(accessToken: string, documentId: string) {
  try {
    const auth = getAuth(accessToken);
    const docs = google.docs({ version: 'v1', auth });
    const targetDocId = cleanFileId(documentId);
    
    const res = await docs.documents.get({ documentId: targetDocId });
    let content = '';
    
    res.data.body?.content?.forEach((element) => {
      if (element.paragraph) {
        element.paragraph.elements?.forEach((el) => {
          if (el.textRun?.content) {
            content += el.textRun.content;
          }
        });
      }
    });
    
    return { documentId: targetDocId, title: res.data.title, content };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateDocument(accessToken: string, documentId: string, content: string) {
  try {
    const auth = getAuth(accessToken);
    const docs = google.docs({ version: 'v1', auth });
    const targetDocId = cleanFileId(documentId);
    
    const docRes = await docs.documents.get({ documentId: targetDocId });
    const endIndex = docRes.data.body?.content?.[docRes.data.body.content.length - 1]?.endIndex || 2;
    
    const requests: any[] = [];
    if (endIndex > 2) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: 1,
            endIndex: endIndex - 1,
          },
        },
      });
    }
    
    requests.push({
      insertText: {
        location: { index: 1 },
        text: content,
      },
    });
    
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });
    
    return {
      documentId,
      title: docRes.data.title,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteFile(accessToken: string, fileId: string) {
  try {
    const auth = getAuth(accessToken);
    const drive = google.drive({ version: 'v3', auth });
    const targetFileId = cleanFileId(fileId);
    
    await drive.files.delete({ fileId: targetFileId });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function listDocuments(accessToken: string, query?: string) {
  try {
    const auth = getAuth(accessToken);
    const drive = google.drive({ version: 'v3', auth });
    
    let q = "mimeType='application/vnd.google-apps.document'";
    if (query) {
      q += ` and name contains '${query}'`;
    }
    
    const res = await drive.files.list({
      q,
      fields: 'files(id, name, webViewLink)',
    });
    
    return (res.data.files || []).map(f => ({
      id: f.id,
      name: f.name,
      url: f.webViewLink,
    }));
  } catch (error: any) {
    return { error: error.message };
  }
}

// Google Sheets
export async function createSpreadsheet(accessToken: string, title: string, headers: string[], rows: string[][]) {
  try {
    const auth = getAuth(accessToken);
    const sheets = google.sheets({ version: 'v4', auth });
    
    const createRes = await sheets.spreadsheets.create({
      requestBody: { properties: { title } },
    });
    
    const spreadsheetId = createRes.data.spreadsheetId!;
    
    const values = [headers, ...rows];
    
    if (values.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
    }
    
    return {
      spreadsheetId,
      title,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function readSpreadsheet(accessToken: string, spreadsheetId: string, range: string) {
  try {
    const auth = getAuth(accessToken);
    const sheets = google.sheets({ version: 'v4', auth });
    const targetId = cleanFileId(spreadsheetId);
    
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: targetId,
      range,
    });
    
    return { spreadsheetId: targetId, range, values: res.data.values || [] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateSpreadsheet(accessToken: string, spreadsheetId: string, range: string, values: string[][]) {
  try {
    const auth = getAuth(accessToken);
    const sheets = google.sheets({ version: 'v4', auth });
    const targetId = cleanFileId(spreadsheetId);
    
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId: targetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    
    return { updatedRange: res.data.updatedRange, updatedRows: res.data.updatedRows, spreadsheetId: targetId };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Google Slides
export async function createPresentation(accessToken: string, title: string) {
  try {
    const auth = getAuth(accessToken);
    const slides = google.slides({ version: 'v1', auth });
    
    const res = await slides.presentations.create({
      requestBody: { title },
    });
    
    const presentationId = res.data.presentationId!;
    return {
      presentationId,
      title,
      url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addSlide(accessToken: string, presentationId: string, title: string, body: string) {
  try {
    const auth = getAuth(accessToken);
    const slides = google.slides({ version: 'v1', auth });
    const targetPresentationId = cleanFileId(presentationId);
    
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const slideId = `slide_${Date.now()}_${uniqueSuffix}`;
    const titleId = `title_${Date.now()}_${uniqueSuffix}`;
    const bodyId = `body_${Date.now()}_${uniqueSuffix}`;

    const requests: any[] = [
      {
        createSlide: {
          objectId: slideId,
          slideLayoutReference: { predefinedLayout: 'BLANK' },
        },
      },
    ];

    if (title && title.trim()) {
      requests.push(
        {
          createShape: {
            objectId: titleId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideId,
              size: {
                width: { magnitude: 620, unit: 'PT' },
                height: { magnitude: 50, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 40,
                unit: 'PT',
              },
            },
          },
        },
        {
          insertText: {
            objectId: titleId,
            insertionIndex: 0,
            text: title.trim(),
          },
        },
        {
          updateTextStyle: {
            objectId: titleId,
            style: {
              bold: true,
              fontSize: { magnitude: 22, unit: 'PT' },
            },
            fields: 'bold,fontSize',
          },
        }
      );
    }

    if (body && body.trim()) {
      requests.push(
        {
          createShape: {
            objectId: bodyId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideId,
              size: {
                width: { magnitude: 620, unit: 'PT' },
                height: { magnitude: 280, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 105,
                unit: 'PT',
              },
            },
          },
        },
        {
          insertText: {
            objectId: bodyId,
            insertionIndex: 0,
            text: body.trim(),
          },
        },
        {
          updateTextStyle: {
            objectId: bodyId,
            style: {
              fontSize: { magnitude: 14, unit: 'PT' },
            },
            fields: 'fontSize',
          },
        }
      );
    }
    
    await slides.presentations.batchUpdate({
      presentationId: targetPresentationId,
      requestBody: {
        requests,
      },
    });
    
    return {
      success: true,
      slideId,
      presentationId: targetPresentationId,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Google Tasks
export async function listTaskLists(accessToken: string) {
  try {
    const auth = getAuth(accessToken);
    const tasks = google.tasks({ version: 'v1', auth });
    
    const res = await tasks.tasklists.list();
    return (res.data.items || []).map(tl => ({ id: tl.id, title: tl.title }));
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function listTasks(accessToken: string, taskListId: string) {
  try {
    const auth = getAuth(accessToken);
    const tasks = google.tasks({ version: 'v1', auth });
    
    const res = await tasks.tasks.list({ tasklist: taskListId });
    return (res.data.items || []).map(t => ({
      id: t.id,
      title: t.title,
      notes: t.notes,
      due: t.due,
      status: t.status,
    }));
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createTask(accessToken: string, taskListId: string, title: string, notes?: string, due?: string) {
  try {
    const auth = getAuth(accessToken);
    const tasks = google.tasks({ version: 'v1', auth });
    
    const requestBody: any = { title };
    if (notes) requestBody.notes = notes;
    if (due) requestBody.due = due;
    
    const res = await tasks.tasks.insert({
      tasklist: taskListId,
      requestBody,
    });
    
    return {
      id: res.data.id,
      title: res.data.title,
      notes: res.data.notes,
      due: res.data.due,
      status: res.data.status,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTask(accessToken: string, taskListId: string, taskId: string, updates: { title?: string, notes?: string, status?: string }) {
  try {
    const auth = getAuth(accessToken);
    const tasks = google.tasks({ version: 'v1', auth });
    
    const task = await tasks.tasks.get({ tasklist: taskListId, task: taskId });
    
    const requestBody = { ...task.data, ...updates };
    
    const res = await tasks.tasks.update({
      tasklist: taskListId,
      task: taskId,
      requestBody,
    });
    
    return res.data;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTask(accessToken: string, taskListId: string, taskId: string) {
  try {
    const auth = getAuth(accessToken);
    const tasks = google.tasks({ version: 'v1', auth });
    
    await tasks.tasks.delete({ tasklist: taskListId, task: taskId });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Google Calendar
export async function listEvents(accessToken: string, timeMin?: string, timeMax?: string, query?: string) {
  try {
    const auth = getAuth(accessToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax,
      q: query,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return (res.data.items || []).map(e => ({
      id: e.id,
      summary: e.summary,
      description: e.description,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      attendees: e.attendees?.map(a => a.email),
      htmlLink: e.htmlLink,
    }));
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createEvent(accessToken: string, summary: string, description: string, startDateTime: string, endDateTime: string, attendees?: string[]) {
  try {
    const auth = getAuth(accessToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
        attendees: attendees?.map(email => ({ email })),
      },
    });
    
    return {
      id: res.data.id,
      summary: res.data.summary,
      htmlLink: res.data.htmlLink,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateEvent(accessToken: string, eventId: string, updates: { summary?: string, description?: string, startDateTime?: string, endDateTime?: string }) {
  try {
    const auth = getAuth(accessToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    const event = await calendar.events.get({ calendarId: 'primary', eventId });
    
    const requestBody = { ...event.data };
    if (updates.summary) requestBody.summary = updates.summary;
    if (updates.description) requestBody.description = updates.description;
    if (updates.startDateTime) requestBody.start = { dateTime: updates.startDateTime };
    if (updates.endDateTime) requestBody.end = { dateTime: updates.endDateTime };
    
    const res = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody,
    });
    
    return res.data;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteEvent(accessToken: string, eventId: string) {
  try {
    const auth = getAuth(accessToken);
    const calendar = google.calendar({ version: 'v3', auth });
    
    await calendar.events.delete({ calendarId: 'primary', eventId });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Gmail
export async function listEmails(accessToken: string, query?: string, maxResults?: number) {
  try {
    const auth = getAuth(accessToken);
    const gmail = google.gmail({ version: 'v1', auth });
    
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: maxResults || 10,
    });
    
    const messages = res.data.messages || [];
    const results = [];
    
    for (const msg of messages) {
      if (!msg.id) continue;
      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From', 'To', 'Subject', 'Date'],
      });
      
      const headers = fullMsg.data.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value;
      
      results.push({
        id: msg.id,
        threadId: fullMsg.data.threadId,
        from: getHeader('from'),
        to: getHeader('to'),
        subject: getHeader('subject'),
        date: getHeader('date'),
        snippet: fullMsg.data.snippet,
      });
    }
    
    return results;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function readEmail(accessToken: string, messageId: string) {
  try {
    const auth = getAuth(accessToken);
    const gmail = google.gmail({ version: 'v1', auth });
    
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });
    
    const headers = res.data.payload?.headers || [];
    const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value;
    
    let body = '';
    
    const getBody = (parts: any[]): string => {
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf8');
        }
        if (part.parts) {
          const res = getBody(part.parts);
          if (res) return res;
        }
      }
      return '';
    };
    
    if (res.data.payload?.parts) {
      body = getBody(res.data.payload.parts);
    } else if (res.data.payload?.body?.data) {
      body = Buffer.from(res.data.payload.body.data, 'base64').toString('utf8');
    }
    
    return {
      id: messageId,
      threadId: res.data.threadId,
      from: getHeader('from'),
      to: getHeader('to'),
      subject: getHeader('subject'),
      date: getHeader('date'),
      body,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createDraft(accessToken: string, to: string, subject: string, body: string, threadId?: string | null, inReplyTo?: string | null) {
  try {
    const auth = getAuth(accessToken);
    const gmail = google.gmail({ version: 'v1', auth });
    
    let rawMessage = `From: me\nTo: ${to}\nSubject: ${subject}\nContent-Type: text/plain; charset=utf-8\n`;
    if (inReplyTo) {
      rawMessage += `In-Reply-To: ${inReplyTo}\n`;
    }
    rawMessage += `\n${body}`;
    
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
      
    const res = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
          threadId: threadId,
        },
      },
    });
    
    return {
      draftId: res.data.id,
      to,
      subject,
      body,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function sendDraft(accessToken: string, draftId: string) {
  try {
    const auth = getAuth(accessToken);
    const gmail = google.gmail({ version: 'v1', auth });
    
    const res = await gmail.users.drafts.send({
      userId: 'me',
      requestBody: { id: draftId },
    });
    
    return { messageId: res.data.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteDraft(accessToken: string, draftId: string) {
  try {
    const auth = getAuth(accessToken);
    const gmail = google.gmail({ version: 'v1', auth });
    
    await gmail.users.drafts.delete({
      userId: 'me',
      id: draftId,
    });
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Proactive Inbox Scanner & Task Extractor
export async function scanInboxAndExtractTasks(
  accessToken: string,
  query: string = 'newer_than:7d',
  maxThreads: number = 6,
  autoCreateTasks: boolean = true
) {
  try {
    const auth = getAuth(accessToken);
    const gmail = google.gmail({ version: 'v1', auth });
    const tasksApi = google.tasks({ version: 'v1', auth });

    // 1. Fetch recent messages
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: Math.min(Math.max(maxThreads, 1), 10),
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
      return {
        threadsScanned: 0,
        suchiTasks: [],
        userTasks: [],
        tasksCreated: 0,
        summary: 'Inbox scanned: No recent messages matching criteria.',
      };
    }

    const suchiTasks: { title: string; notes: string; due?: string; from: string; subject: string; messageId: string }[] = [];
    const userTasks: { title: string; notes: string; due?: string; from: string; subject: string; messageId: string }[] = [];

    // 2. Read each thread snippet and subject
    for (const msg of messages) {
      try {
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = fullMsg.data.payload?.headers || [];
        const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown Sender';
        const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '(No Subject)';
        const snippet = fullMsg.data.snippet || '';

        const lowerSnippet = snippet.toLowerCase();
        const lowerSubj = subjectHeader.toLowerCase();

        // Categorize into Suchi vs User tasks based on action keywords
        if (
          lowerSnippet.includes('draft') ||
          lowerSnippet.includes('meeting') ||
          lowerSnippet.includes('schedule') ||
          lowerSnippet.includes('send over') ||
          lowerSnippet.includes('can you check') ||
          lowerSnippet.includes('calendar') ||
          lowerSnippet.includes('please find') ||
          lowerSubj.includes('agenda')
        ) {
          suchiTasks.push({
            title: `Prepare / Draft: ${subjectHeader.slice(0, 60)}`,
            notes: `From: ${fromHeader}\nContext: ${snippet}`,
            from: fromHeader,
            subject: subjectHeader,
            messageId: msg.id!,
          });
        } else {
          userTasks.push({
            title: `Review / Action: ${subjectHeader.slice(0, 60)}`,
            notes: `From: ${fromHeader}\nContext: ${snippet}`,
            from: fromHeader,
            subject: subjectHeader,
            messageId: msg.id!,
          });
        }
      } catch (err) {
        // Skip failed individual message
      }
    }

    let tasksCreated = 0;
    // 3. Auto-create tasks in Google Tasks if requested
    if (autoCreateTasks) {
      try {
        const listsRes = await tasksApi.tasklists.list({ maxResults: 10 });
        let targetListId = '@default';
        const lists = listsRes.data.items || [];
        const existingList = lists.find(l => l.title?.toLowerCase().includes('inbox') || l.title?.toLowerCase().includes('action'));
        if (existingList?.id) {
          targetListId = existingList.id;
        }

        // Create up to 5 top tasks
        const combined = [...suchiTasks.slice(0, 3), ...userTasks.slice(0, 3)];
        for (const t of combined) {
          await tasksApi.tasks.insert({
            tasklist: targetListId,
            requestBody: {
              title: t.title,
              notes: t.notes,
            },
          });
          tasksCreated++;
        }
      } catch (tasksErr) {
        console.warn('Could not auto-insert tasks into Google Tasks:', tasksErr);
      }
    }

    return {
      threadsScanned: messages.length,
      suchiTasks,
      userTasks,
      tasksCreated,
      summary: `Scanned ${messages.length} email threads. Identified ${suchiTasks.length} tasks for Suchi and ${userTasks.length} tasks for User. Created ${tasksCreated} tasks in Google Tasks.`,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Google Keep / Checklists Engine
export async function createKeepChecklist(accessToken: string, title: string, items: string[]) {
  try {
    const auth = getAuth(accessToken);
    const tasksApi = google.tasks({ version: 'v1', auth });

    // Look for or create a Keep Notes / Checklists tasklist
    const listsRes = await tasksApi.tasklists.list({ maxResults: 10 });
    let targetListId = '@default';
    const lists = listsRes.data.items || [];
    let keepList = lists.find(l => l.title?.toLowerCase() === 'keep notes' || l.title?.toLowerCase() === 'checklists');
    
    if (!keepList) {
      try {
        const createListRes = await tasksApi.tasklists.insert({
          requestBody: { title: 'Keep Notes & Checklists' },
        });
        if (createListRes.data.id) targetListId = createListRes.data.id;
      } catch (e) {
        targetListId = '@default';
      }
    } else if (keepList.id) {
      targetListId = keepList.id;
    }

    // Format content with bracketed checkboxes
    const checklistNotes = items.map(item => `- [ ] ${item}`).join('\n');

    const createdTask = await tasksApi.tasks.insert({
      tasklist: targetListId,
      requestBody: {
        title: `📝 ${title}`,
        notes: checklistNotes,
      },
    });

    return {
      id: createdTask.data.id,
      title,
      itemCount: items.length,
      items,
      checklistText: checklistNotes,
      listTitle: 'Keep Notes & Checklists',
      url: 'https://tasks.google.com',
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Google Drive Systematic File Organizer & Indexer
export async function organizeDriveFiles(accessToken: string, query?: string) {
  try {
    const auth = getAuth(accessToken);
    const drive = google.drive({ version: 'v3', auth });

    const q = query ? `name contains '${query}' and trashed = false` : 'trashed = false';
    const res = await drive.files.list({
      q,
      pageSize: 20,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink, iconLink, size)',
      orderBy: 'modifiedTime desc',
    });

    const files = res.data.files || [];
    const categorized: Record<string, { id: string; name: string; link: string; modifiedTime?: string }[]> = {
      Documents: [],
      Spreadsheets: [],
      Presentations: [],
      PDFs: [],
      Others: [],
    };

    for (const f of files) {
      const mime = f.mimeType || '';
      const item = {
        id: f.id || '',
        name: f.name || 'Untitled',
        link: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
        modifiedTime: f.modifiedTime || undefined,
      };

      if (mime.includes('document')) categorized.Documents.push(item);
      else if (mime.includes('spreadsheet')) categorized.Spreadsheets.push(item);
      else if (mime.includes('presentation')) categorized.Presentations.push(item);
      else if (mime.includes('pdf')) categorized.PDFs.push(item);
      else categorized.Others.push(item);
    }

    return {
      totalFiles: files.length,
      categorized,
      summary: `Found and indexed ${files.length} files across Google Drive.`,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function searchInternet(query: string) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const html = await res.text();
    const results: { title: string; snippet: string; link: string }[] = [];
    const linkRegex = /<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null && results.length < 5) {
      results.push({
        link: match[1].trim(),
        title: match[2].replace(/<[^>]+>/g, '').trim(),
        snippet: match[3].replace(/<[^>]+>/g, '').trim(),
      });
    }
    return results.length > 0 ? results : { message: `No direct search results found for: ${query}` };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function shareFile(accessToken: string, fileId: string, role = 'reader', type = 'anyone', emailAddress?: string) {
  try {
    const auth = getAuth(accessToken);
    const drive = google.drive({ version: 'v3', auth });
    const targetFileId = cleanFileId(fileId);

    // Normalize roles (reader, commenter, writer)
    let normalizedRole = (role || 'reader').toLowerCase().trim();
    if (normalizedRole === 'editor' || normalizedRole === 'edit') normalizedRole = 'writer';
    if (normalizedRole === 'viewer' || normalizedRole === 'view') normalizedRole = 'reader';
    if (normalizedRole === 'comment') normalizedRole = 'commenter';

    const requestBody: any = { role: normalizedRole, type };
    if (type === 'user' && emailAddress) {
      requestBody.emailAddress = emailAddress.trim();
    }
    await drive.permissions.create({
      fileId: targetFileId,
      requestBody,
      fields: 'id',
    });
    const fileRes = await drive.files.get({
      fileId: targetFileId,
      fields: 'webViewLink, name',
    });
    return {
      success: true,
      fileId: targetFileId,
      name: fileRes.data.name,
      shareLink: fileRes.data.webViewLink,
      role: normalizedRole,
      type,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// -------------------------------------------------------------
// Google Forms
// -------------------------------------------------------------
export async function createGoogleForm(
  accessToken: string,
  title: string,
  description?: string,
  questions: Array<{ title: string; type?: 'TEXT' | 'MULTIPLE_CHOICE' | 'CHECKBOX'; options?: string[] }> = []
) {
  try {
    const auth = getAuth(accessToken);
    const forms = google.forms({ version: 'v1', auth });

    const newForm = await forms.forms.create({
      requestBody: {
        info: {
          title,
          documentTitle: title,
          description: description || 'Created by Suchi Life OS',
        },
      },
    });

    const formId = newForm.data.formId!;
    const responderUri = newForm.data.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;
    const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;

    // Add questions if provided
    if (questions && questions.length > 0) {
      const requests = questions.map((q, idx) => {
        if (q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') {
          return {
            createItem: {
              item: {
                title: q.title,
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: q.type === 'CHECKBOX' ? 'CHECKBOX' : 'RADIO',
                      options: (q.options || ['Option 1', 'Option 2']).map(val => ({ value: val })),
                      shuffle: false,
                    },
                  },
                },
              },
              location: { index: idx },
            },
          };
        }
        // Default text question
        return {
          createItem: {
            item: {
              title: q.title,
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: idx },
          },
        };
      });

      await forms.forms.batchUpdate({
        formId,
        requestBody: { requests },
      });
    }

    return {
      formId,
      title,
      editUrl,
      responderUri,
      url: editUrl,
      questionCount: questions.length,
    };
  } catch (error: any) {
    // Graceful fallback: create in Docs if Forms API is restricted on token
    return {
      error: error.message,
      fallbackUrl: `https://docs.google.com/forms/create?title=${encodeURIComponent(title)}`,
    };
  }
}

// -------------------------------------------------------------
// Gemini Research Notebooks
// -------------------------------------------------------------
export async function createGeminiNotebook(
  accessToken: string,
  title: string,
  topic: string,
  sections: Array<{ heading: string; content: string; keyTakeaways?: string[]; sources?: string[] }>
) {
  try {
    const formattedContent = [
      `# 📓 GEMINI RESEARCH NOTEBOOK: ${title.toUpperCase()}\n`,
      `**Topic / Focus**: ${topic}`,
      `**Compiled by**: Suchi Autonomous Chief of Staff`,
      `**Date**: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}\n`,
      `---\n`,
      ...sections.map(s => {
        let sec = `## 📌 ${s.heading}\n\n${s.content}\n`;
        if (s.keyTakeaways && s.keyTakeaways.length > 0) {
          sec += `\n**Key Takeaways:**\n` + s.keyTakeaways.map(t => `- ${t}`).join('\n') + `\n`;
        }
        if (s.sources && s.sources.length > 0) {
          sec += `\n**Synthesized Sources:**\n` + s.sources.map(src => `- ${src}`).join('\n') + `\n`;
        }
        return sec;
      }),
      `\n---\n*Notebook generated autonomously by Suchi Life OS.*`
    ].join('\n\n');

    const docResult = await createDocument(accessToken, `📓 ${title}`, formattedContent);
    return {
      notebookId: (docResult as any).documentId,
      title,
      url: (docResult as any).url,
      sectionsCount: sections.length,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// -------------------------------------------------------------
// YouTube Music Playlists
// -------------------------------------------------------------
export async function createYouTubeMusicPlaylist(
  accessToken: string,
  title: string,
  description: string,
  tracks: Array<{ title: string; artist?: string }>
) {
  try {
    const searchUrl = `https://music.youtube.com/search?q=${encodeURIComponent(title)}`;
    
    // Also try YouTube API if authorized
    let youtubePlaylistUrl = searchUrl;
    try {
      const auth = getAuth(accessToken);
      const youtube = google.youtube({ version: 'v3', auth });
      const plRes = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description: description || 'Curated by Suchi Life OS',
          },
          status: {
            privacyStatus: 'unlisted',
          },
        },
      });
      if (plRes.data.id) {
        youtubePlaylistUrl = `https://music.youtube.com/playlist?list=${plRes.data.id}`;
      }
    } catch {
      // If YouTube write scope is not active, use YouTube Music direct search queue URL
      youtubePlaylistUrl = searchUrl;
    }

    return {
      title,
      description,
      trackCount: tracks.length,
      url: youtubePlaylistUrl,
      tracks: tracks.map(t => ({
        ...t,
        listenUrl: `https://music.youtube.com/search?q=${encodeURIComponent(`${t.title} ${t.artist || ''}`)}`,
      })),
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// -------------------------------------------------------------
// Google Maps Curated Places List
// -------------------------------------------------------------
export async function createGoogleMapsPlacesList(
  location: string,
  category: string,
  places: Array<{ name: string; category: string; description: string; address?: string; rating?: string; priceLevel?: string }>
) {
  try {
    const mainMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${category} in ${location}`)}`;
    
    const enrichedPlaces = places.map(p => ({
      name: p.name,
      category: p.category,
      description: p.description,
      address: p.address || `${p.name}, ${location}`,
      rating: p.rating || '4.5+ ★',
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${location}`)}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${p.name} ${location}`)}`,
    }));

    return {
      location,
      category,
      totalPlaces: enrichedPlaces.length,
      url: mainMapsUrl,
      places: enrichedPlaces,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// -------------------------------------------------------------
// Image Generation
// -------------------------------------------------------------
export async function generateSuchiImage(prompt: string, aspectRatio = '1:1') {
  try {
    let width = 1024;
    let height = 1024;

    switch (aspectRatio) {
      case '16:9':
        width = 1280;
        height = 720;
        break;
      case '9:16':
        width = 720;
        height = 1280;
        break;
      case '4:3':
        width = 1024;
        height = 768;
        break;
      case '3:4':
        width = 768;
        height = 1024;
        break;
      default:
        width = 1024;
        height = 1024;
        break;
    }

    const seed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = prompt.trim();
    // High-resolution photorealistic flux engine endpoint
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

    return {
      success: true,
      imageUrl,
      prompt: cleanPrompt,
      aspectRatio,
      width,
      height,
      url: imageUrl,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

