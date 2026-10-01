import { Type, FunctionDeclaration } from '@google/genai';
import * as googleServices from './google-services';
import { ActionResult, DraftInfo } from './types';

export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'search_internet',
    description: 'Searches the internet for real-time information, news, current events, and web research.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'The search query to look up on the web' },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_documents',
    description: 'Lists Google Docs.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
      },
    },
  },
  {
    name: 'create_document',
    description: 'Creates a new Google Doc.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'read_document',
    description: 'Reads the content of a Google Doc.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        documentId: { type: Type.STRING },
      },
      required: ['documentId'],
    },
  },
  {
    name: 'update_document',
    description: 'Updates a Google Doc (replaces existing content).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        documentId: { type: Type.STRING },
        content: { type: Type.STRING },
      },
      required: ['documentId', 'content'],
    },
  },
  {
    name: 'delete_file',
    description: 'Deletes a Google Drive file.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        fileId: { type: Type.STRING },
        fileType: { type: Type.STRING, description: 'document, spreadsheet, or presentation' },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'create_spreadsheet',
    description: 'Creates a new Google Sheet.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      },
      required: ['title', 'headers'],
    },
  },
  {
    name: 'read_spreadsheet',
    description: 'Reads a range from a Google Sheet.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        spreadsheetId: { type: Type.STRING },
        range: { type: Type.STRING, description: 'e.g. Sheet1!A1:D10' },
      },
      required: ['spreadsheetId', 'range'],
    },
  },
  {
    name: 'update_spreadsheet',
    description: 'Updates a range in a Google Sheet.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        spreadsheetId: { type: Type.STRING },
        range: { type: Type.STRING },
        values: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      },
      required: ['spreadsheetId', 'range', 'values'],
    },
  },
  {
    name: 'create_presentation',
    description: 'Creates a new Google Slides presentation.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
      },
      required: ['title'],
    },
  },
  {
    name: 'add_slide',
    description: 'Adds a slide to a presentation.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        presentationId: { type: Type.STRING },
        title: { type: Type.STRING },
        body: { type: Type.STRING },
      },
      required: ['presentationId', 'title', 'body'],
    },
  },
  {
    name: 'list_task_lists',
    description: 'Lists all Google Task lists.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'list_tasks',
    description: 'Lists tasks in a task list.',
    parameters: {
      type: Type.OBJECT,
      properties: { taskListId: { type: Type.STRING } },
      required: ['taskListId'],
    },
  },
  {
    name: 'create_task',
    description: 'Creates a new task.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskListId: { type: Type.STRING },
        title: { type: Type.STRING },
        notes: { type: Type.STRING },
        due: { type: Type.STRING, description: 'RFC 3339 date' },
      },
      required: ['taskListId', 'title'],
    },
  },
  {
    name: 'update_task',
    description: 'Updates an existing task.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskListId: { type: Type.STRING },
        taskId: { type: Type.STRING },
        title: { type: Type.STRING },
        notes: { type: Type.STRING },
        status: { type: Type.STRING, description: '"needsAction" or "completed"' },
      },
      required: ['taskListId', 'taskId'],
    },
  },
  {
    name: 'delete_task',
    description: 'Deletes a task.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskListId: { type: Type.STRING },
        taskId: { type: Type.STRING },
      },
      required: ['taskListId', 'taskId'],
    },
  },
  {
    name: 'list_calendar_events',
    description: 'Lists Google Calendar events.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        timeMin: { type: Type.STRING, description: 'ISO datetime' },
        timeMax: { type: Type.STRING },
        query: { type: Type.STRING },
      },
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Creates a Google Calendar event.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        description: { type: Type.STRING },
        startDateTime: { type: Type.STRING, description: 'ISO datetime' },
        endDateTime: { type: Type.STRING, description: 'ISO datetime' },
        attendees: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['summary', 'startDateTime', 'endDateTime'],
    },
  },
  {
    name: 'update_calendar_event',
    description: 'Updates a Google Calendar event.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: { type: Type.STRING },
        summary: { type: Type.STRING },
        description: { type: Type.STRING },
        startDateTime: { type: Type.STRING },
        endDateTime: { type: Type.STRING },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'delete_calendar_event',
    description: 'Deletes a Google Calendar event.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: { type: Type.STRING },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'list_emails',
    description: 'Lists Gmail emails.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Gmail search query' },
        maxResults: { type: Type.NUMBER },
      },
    },
  },
  {
    name: 'read_email',
    description: 'Reads the full content of a Gmail email.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        messageId: { type: Type.STRING },
      },
      required: ['messageId'],
    },
  },
  {
    name: 'draft_reply',
    description: 'Creates a draft reply to an email. The draft must be approved by the user before sending.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        messageId: { type: Type.STRING },
        body: { type: Type.STRING },
      },
      required: ['messageId', 'body'],
    },
  },
  {
    name: 'create_note',
    description: 'Creates a note using Google Tasks (creates a task in the Notes list with the content in the notes field)',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING },
      },
      required: ['title', 'content'],
    },
  },
];

export async function executeFunction(
  name: string,
  args: Record<string, any>,
  accessToken: string
): Promise<{ action: ActionResult; draft?: DraftInfo; data: any }> {
  let resultData: any;
  let action: ActionResult = { tool: name, summary: `Executed ${name}`, success: true };
  let draft: DraftInfo | undefined;

  try {
    switch (name) {
      case 'search_internet':
        resultData = await googleServices.searchInternet(args.query);
        action.summary = `Searched the web for: ${args.query}`;
        break;
      case 'list_documents':
        resultData = await googleServices.listDocuments(accessToken, args.query);
        action.summary = Array.isArray(resultData) ? `Found ${resultData.length} documents` : 'Failed to list documents';
        break;
      case 'create_document':
        resultData = await googleServices.createDocument(accessToken, args.title, args.content);
        action.summary = `Created document: ${args.title}`;
        if (resultData.url) action.link = resultData.url;
        break;
      case 'read_document':
        resultData = await googleServices.readDocument(accessToken, args.documentId);
        action.summary = resultData.title ? `Read document: ${resultData.title}` : 'Read document';
        break;
      case 'update_document':
        resultData = await googleServices.updateDocument(accessToken, args.documentId, args.content);
        action.summary = `Updated document: ${resultData.title || args.documentId}`;
        if (resultData.url) action.link = resultData.url;
        break;
      case 'delete_file':
        resultData = await googleServices.deleteFile(accessToken, args.fileId);
        action.summary = `Deleted file: ${args.fileId}`;
        break;
      case 'create_spreadsheet':
        resultData = await googleServices.createSpreadsheet(accessToken, args.title, args.headers, args.rows || []);
        action.summary = `Created spreadsheet: ${args.title}`;
        if (resultData.url) action.link = resultData.url;
        break;
      case 'read_spreadsheet':
        resultData = await googleServices.readSpreadsheet(accessToken, args.spreadsheetId, args.range);
        action.summary = `Read spreadsheet range: ${args.range}`;
        break;
      case 'update_spreadsheet':
        resultData = await googleServices.updateSpreadsheet(accessToken, args.spreadsheetId, args.range, args.values);
        action.summary = `Updated spreadsheet range: ${args.range}`;
        break;
      case 'create_presentation':
        resultData = await googleServices.createPresentation(accessToken, args.title);
        action.summary = `Created presentation: ${args.title}`;
        if (resultData.url) action.link = resultData.url;
        break;
      case 'add_slide':
        resultData = await googleServices.addSlide(accessToken, args.presentationId, args.title, args.body);
        action.summary = `Added slide to presentation: ${args.presentationId}`;
        if (resultData.url) action.link = resultData.url;
        break;
      case 'list_task_lists':
        resultData = await googleServices.listTaskLists(accessToken);
        action.summary = Array.isArray(resultData) ? `Found ${resultData.length} task lists` : 'Failed to list task lists';
        break;
      case 'list_tasks':
        resultData = await googleServices.listTasks(accessToken, args.taskListId);
        action.summary = Array.isArray(resultData) ? `Found ${resultData.length} tasks` : 'Failed to list tasks';
        break;
      case 'create_task':
        resultData = await googleServices.createTask(accessToken, args.taskListId, args.title, args.notes, args.due);
        action.summary = `Created task: ${args.title}`;
        break;
      case 'update_task':
        resultData = await googleServices.updateTask(accessToken, args.taskListId, args.taskId, args);
        action.summary = `Updated task: ${args.taskId}`;
        break;
      case 'delete_task':
        resultData = await googleServices.deleteTask(accessToken, args.taskListId, args.taskId);
        action.summary = `Deleted task: ${args.taskId}`;
        break;
      case 'list_calendar_events':
        resultData = await googleServices.listEvents(accessToken, args.timeMin, args.timeMax, args.query);
        action.summary = Array.isArray(resultData) ? `Found ${resultData.length} events` : 'Failed to list events';
        break;
      case 'create_calendar_event':
        resultData = await googleServices.createEvent(accessToken, args.summary, args.description || '', args.startDateTime, args.endDateTime, args.attendees);
        action.summary = `Created event: ${args.summary}`;
        if (resultData.htmlLink) action.link = resultData.htmlLink;
        break;
      case 'update_calendar_event':
        resultData = await googleServices.updateEvent(accessToken, args.eventId, args);
        action.summary = `Updated event: ${args.eventId}`;
        break;
      case 'delete_calendar_event':
        resultData = await googleServices.deleteEvent(accessToken, args.eventId);
        action.summary = `Deleted event: ${args.eventId}`;
        break;
      case 'list_emails':
        resultData = await googleServices.listEmails(accessToken, args.query, args.maxResults);
        action.summary = Array.isArray(resultData) ? `Found ${resultData.length} emails` : 'Failed to list emails';
        break;
      case 'read_email':
        resultData = await googleServices.readEmail(accessToken, args.messageId);
        action.summary = resultData.subject ? `Read email: ${resultData.subject}` : 'Read email';
        break;
      case 'draft_reply': {
        const emailData = await googleServices.readEmail(accessToken, args.messageId);
        if (emailData.error) {
          resultData = emailData;
          break;
        }
        let replySubject = emailData.subject || '';
        if (!replySubject.toLowerCase().startsWith('re:')) {
          replySubject = `Re: ${replySubject}`;
        }
        const draftRes = await googleServices.createDraft(
          accessToken,
          emailData.from || '',
          replySubject,
          args.body,
          emailData.threadId || undefined,
          args.messageId
        );
        resultData = draftRes;
        if (!draftRes.error) {
          draft = {
            draftId: draftRes.draftId!,
            to: draftRes.to!,
            subject: draftRes.subject!,
            body: draftRes.body!,
          };
          action.summary = `Drafted reply to ${emailData.subject}`;
        }
        break;
      }
      case 'create_note': {
        const taskLists = await googleServices.listTaskLists(accessToken);
        let notesList = (Array.isArray(taskLists) ? taskLists : []).find((l: any) => l.title === 'Notes');
        
        let listId = (notesList && typeof notesList.id === 'string') ? notesList.id : '@default';
        
        resultData = await googleServices.createTask(accessToken, listId, args.title, args.content);
        action.summary = `Created note: ${args.title}`;
        break;
      }
      default:
        resultData = { error: `Function ${name} not found` };
        action.success = false;
        action.summary = `Failed to execute ${name}`;
    }
  } catch (error: any) {
    resultData = { error: error.message };
    action.success = false;
    action.summary = `Error executing ${name}`;
  }

  if (resultData && resultData.error) {
    action.success = false;
  }

  return { action, draft, data: resultData };
}
