import { google } from 'googleapis';

function getAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
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
    
    const res = await docs.documents.get({ documentId });
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
    
    return { documentId, title: res.data.title, content };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateDocument(accessToken: string, documentId: string, content: string) {
  try {
    const auth = getAuth(accessToken);
    const docs = google.docs({ version: 'v1', auth });
    
    const docRes = await docs.documents.get({ documentId });
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
    
    await drive.files.delete({ fileId });
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
    
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    return { spreadsheetId, range, values: res.data.values || [] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateSpreadsheet(accessToken: string, spreadsheetId: string, range: string, values: string[][]) {
  try {
    const auth = getAuth(accessToken);
    const sheets = google.sheets({ version: 'v4', auth });
    
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    
    return { updatedRange: res.data.updatedRange, updatedRows: res.data.updatedRows };
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
    
    const slideId = 'slide_' + Date.now();
    
    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [
          {
            createSlide: {
              objectId: slideId,
              insertionIndex: 1,
              slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
            },
          },
        ],
      },
    });
    
    return {
      presentationId,
      url: `https://docs.google.com/presentation/d/${presentationId}/edit#slide=id.${slideId}`,
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
