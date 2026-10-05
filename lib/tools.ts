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
  {
    name: 'share_file',
    description: 'Shares a Google Doc, Sheet, or Slide with anyone via link or with a specific user email.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        fileId: { type: Type.STRING, description: 'ID of the document, spreadsheet, or presentation' },
        role: { type: Type.STRING, description: 'Permission role: reader, commenter, or writer' },
        type: { type: Type.STRING, description: 'Permission type: anyone (public link) or user' },
        emailAddress: { type: Type.STRING, description: 'Email address if sharing with a specific user' },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'create_form',
    description: 'Creates a Google Form with custom questions (Multiple Choice, Checkbox, Text). Returns the responder link and edit link.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Title of the Google Form' },
        description: { type: Type.STRING, description: 'Description or instructions for respondents' },
        questions: {
          type: Type.ARRAY,
          description: 'Array of questions to include in the form',
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'The question text' },
              type: { type: Type.STRING, description: 'Question type: TEXT, MULTIPLE_CHOICE, or CHECKBOX' },
              options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Choices for multiple choice or checkbox' },
            },
            required: ['title'],
          },
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'create_gemini_notebook',
    description: 'Creates a comprehensive, structured Gemini Research Notebook in Google Docs with executive synthesis, citations, and key takeaways.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Notebook title' },
        topic: { type: Type.STRING, description: 'Core research subject' },
        sections: {
          type: Type.ARRAY,
          description: 'Array of research chapters or sections',
          items: {
            type: Type.OBJECT,
            properties: {
              heading: { type: Type.STRING },
              content: { type: Type.STRING },
              keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
              sources: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['heading', 'content'],
          },
        },
      },
      required: ['title', 'topic', 'sections'],
    },
  },
  {
    name: 'create_youtube_playlist',
    description: 'Creates a curated YouTube Music playlist with direct search links and tracklist.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Playlist title' },
        description: { type: Type.STRING, description: 'Playlist theme or description' },
        tracks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Track title' },
              artist: { type: Type.STRING, description: 'Artist or band name' },
            },
            required: ['title'],
          },
        },
      },
      required: ['title', 'tracks'],
    },
  },
  {
    name: 'create_maps_places_list',
    description: 'Generates a categorized curated guide of places in Google Maps (eateries, stays, tourist spots, hidden gems) with direct Google Maps search and navigation links.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: { type: Type.STRING, description: 'City, region, or area' },
        category: { type: Type.STRING, description: 'Category (e.g. Eateries, Hidden Gems, Stays, Tourist Spots)' },
        places: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Name of the place' },
              category: { type: Type.STRING, description: 'Sub-category: Eatery, Stay, Landmark, Hidden Gem' },
              description: { type: Type.STRING, description: 'Why this place is recommended' },
              address: { type: Type.STRING, description: 'Address or neighbourhood' },
              rating: { type: Type.STRING, description: 'Estimated rating or accolade' },
            },
            required: ['name', 'category', 'description'],
          },
        },
      },
      required: ['location', 'category', 'places'],
    },
  },
  {
    name: 'scan_inbox_and_extract_tasks',
    description: 'Proactively scans recent Gmail threads, extracts commitments and deliverables, categorizes into tasks Suchi can execute immediately vs tasks for the user, and auto-syncs them into Google Tasks.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Gmail query filter (e.g. newer_than:7d, is:unread)' },
        maxThreads: { type: Type.NUMBER, description: 'Number of recent threads to scan (default 6, max 10)' },
        autoCreateTasks: { type: Type.BOOLEAN, description: 'Whether to automatically insert extracted action items into Google Tasks (default true)' },
      },
    },
  },
  {
    name: 'create_keep_checklist',
    description: 'Creates a structured Keep Note / Checklist with bracketed checkboxes (- [ ] Item) for groceries, packing lists, sprint tasks, or rapid capture.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Title of the checklist / keep note' },
        items: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Array of checklist items' },
      },
      required: ['title', 'items'],
    },
  },
  {
    name: 'organize_drive_files',
    description: 'Systematically searches and indexes user files across Google Drive, categorizing by Docs, Sheets, Slides, PDFs, and providing clickable links.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'File name keyword or search query' },
      },
    },
  },
  {
    name: 'generate_image',
    description: 'Generates high-definition images using an improved artistic prompt and pre-determined aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: 'Detailed visual prompt describing the scene, lighting, style, and subject' },
        aspectRatio: { type: Type.STRING, description: 'Aspect ratio: 1:1, 16:9, 9:16, 4:3, or 3:4' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'generate_whatsapp_link',
    description: 'Generates a 1-tap WhatsApp message launch link (https://wa.me/<phone>?text=...) with URL-encoded message for client follow-up, payment reminder, vendor outreach, or quick catch-up.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        phone: { type: Type.STRING, description: 'Recipient phone number with country code, e.g. 919876543210' },
        message: { type: Type.STRING, description: 'Message text to send on WhatsApp' },
        contactName: { type: Type.STRING, description: 'Optional name of the contact' },
      },
      required: ['phone', 'message'],
    },
  },
  {
    name: 'create_call_briefing',
    description: 'Creates an executive pre-call briefing (talking points, objectives, leverage points, landmines to avoid) paired with 1-tap direct dialer (tel:<phone>) phone link.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        phone: { type: Type.STRING, description: 'Phone number to call (with country code or direct digits)' },
        contactName: { type: Type.STRING, description: 'Name of the contact or organization' },
        objective: { type: Type.STRING, description: 'Primary objective of the phone call' },
        talkingPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 concise strategic talking points for the call',
        },
        landminesToAvoid: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Potential traps, sensitive topics, or concessions to avoid during the call',
        },
        expectedOutcome: { type: Type.STRING, description: 'Target concrete next step or decision' },
      },
      required: ['phone', 'contactName', 'objective', 'talkingPoints'],
    },
  },
  {
    name: 'search_and_compare_vendors',
    description: 'Discovers, compares, and evaluates vendors, contractors, or suppliers. Generates a side-by-side cost and deliverable comparison matrix in Google Sheets.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, description: 'Vendor service category (e.g. Legal Incorporation, Cloud Infra, UI/UX Agency, Logistics Partner)' },
        requirements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key deliverables, SLA requirements, or scope items',
        },
        targetBudget: { type: Type.STRING, description: 'Target budget or price ceiling' },
        sheetTitle: { type: Type.STRING, description: 'Optional custom title for the Google Sheet' },
      },
      required: ['category', 'requirements'],
    },
  },
  {
    name: 'create_customer_outreach_pipeline',
    description: 'Creates a multi-touch B2B customer connect outreach pipeline with status tracking in Google Sheets and ready-to-send messages for Gmail and WhatsApp.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        campaignName: { type: Type.STRING, description: 'Campaign title or niche' },
        targetAudience: { type: Type.STRING, description: 'Ideal customer profile (ICP) or industry persona' },
        channels: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Outreach channels: Email, WhatsApp, Call',
        },
        pitchMessage: { type: Type.STRING, description: 'High-converting email pitch copy' },
        whatsappMessage: { type: Type.STRING, description: 'Crisp WhatsApp follow-up copy' },
      },
      required: ['campaignName', 'targetAudience', 'channels', 'pitchMessage'],
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
        action.summary = args.title ? `Added slide: "${args.title}"` : 'Added slide';
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
      case 'share_file': {
        resultData = await googleServices.shareFile(
          accessToken,
          args.fileId,
          args.role || 'reader',
          args.type || 'anyone',
          args.emailAddress
        );
        action.summary = resultData.shareLink
          ? `Shared file: ${resultData.name || args.fileId}`
          : `Share file: ${args.fileId}`;
        if (resultData.shareLink) action.link = resultData.shareLink;
        break;
      }
      case 'create_form': {
        resultData = await googleServices.createGoogleForm(accessToken, args.title, args.description, args.questions || []);
        action.summary = `Created Google Form: ${args.title}`;
        if (resultData.url) action.link = resultData.url;
        break;
      }
      case 'create_gemini_notebook': {
        resultData = await googleServices.createGeminiNotebook(accessToken, args.title, args.topic, args.sections || []);
        action.summary = `Created Gemini Research Notebook: ${args.title}`;
        if (resultData.url) action.link = resultData.url;
        break;
      }
      case 'create_youtube_playlist': {
        resultData = await googleServices.createYouTubeMusicPlaylist(accessToken, args.title, args.description, args.tracks || []);
        action.summary = `Created YouTube Music Playlist: ${args.title} (${args.tracks?.length || 0} tracks)`;
        if (resultData.url) action.link = resultData.url;
        break;
      }
      case 'create_maps_places_list': {
        resultData = await googleServices.createGoogleMapsPlacesList(args.location, args.category, args.places || []);
        action.summary = `Created Google Maps Guide: ${args.category} in ${args.location} (${args.places?.length || 0} spots)`;
        if (resultData.url) action.link = resultData.url;
        break;
      }
      case 'scan_inbox_and_extract_tasks': {
        resultData = await googleServices.scanInboxAndExtractTasks(
          accessToken,
          args.query || 'newer_than:7d',
          args.maxThreads || 6,
          args.autoCreateTasks ?? true
        );
        action.summary = resultData.summary || `Scanned inbox and extracted action items`;
        break;
      }
      case 'create_keep_checklist': {
        resultData = await googleServices.createKeepChecklist(accessToken, args.title, args.items || []);
        action.summary = `Created Keep checklist: "${args.title}" (${args.items?.length || 0} items)`;
        if (resultData.url) action.link = resultData.url;
        break;
      }
      case 'organize_drive_files': {
        resultData = await googleServices.organizeDriveFiles(accessToken, args.query);
        action.summary = resultData.summary || `Organized and indexed Google Drive files`;
        break;
      }
      case 'generate_image': {
        resultData = await googleServices.generateSuchiImage(args.prompt, args.aspectRatio || '1:1');
        action.summary = `Generated high-resolution image (${args.aspectRatio || '1:1'})`;
        if (resultData.imageUrl) {
          action.imageUrl = resultData.imageUrl;
          action.link = resultData.imageUrl;
        }
        break;
      }
      case 'generate_whatsapp_link': {
        resultData = googleServices.generateWhatsAppLink(args.phone, args.message, args.contactName);
        action.summary = `Generated 1-tap WhatsApp message to ${args.contactName || args.phone}`;
        if (resultData.waUrl) action.link = resultData.waUrl;
        action.data = resultData;
        break;
      }
      case 'create_call_briefing': {
        resultData = googleServices.createCallBriefing(
          args.phone,
          args.contactName,
          args.objective,
          args.talkingPoints || [],
          args.landminesToAvoid || [],
          args.expectedOutcome
        );
        action.summary = `Created direct call briefing for ${args.contactName} (${args.phone})`;
        if (resultData.telUrl) action.link = resultData.telUrl;
        action.data = resultData;
        break;
      }
      case 'search_and_compare_vendors': {
        resultData = await googleServices.searchAndCompareVendors(
          accessToken,
          args.category,
          args.requirements || [],
          args.targetBudget,
          args.sheetTitle
        );
        action.summary = `Built vendor comparison matrix for ${args.category} in Google Sheets`;
        if (resultData.url) action.link = resultData.url;
        action.data = resultData;
        break;
      }
      case 'create_customer_outreach_pipeline': {
        resultData = await googleServices.createCustomerOutreachPipeline(
          accessToken,
          args.campaignName,
          args.targetAudience,
          args.channels || [],
          args.pitchMessage,
          args.whatsappMessage
        );
        action.summary = `Initialized customer connect outreach pipeline: "${args.campaignName}"`;
        if (resultData.url) action.link = resultData.url;
        action.data = resultData;
        break;
      }
      default:
        resultData = { error: `Function ${name} not found` };
        action.success = false;
        action.summary = `Failed to execute ${name}`;
    }
  } catch (error: any) {
    resultData = { error: error?.message || String(error) };
    action.success = false;
    action.summary = `${name} error: ${error?.message || String(error)}`;
  }

  if (resultData && resultData.error) {
    action.success = false;
    action.summary = `${name} failed: ${resultData.error}`;
  }

  return { action, draft, data: resultData };
}
