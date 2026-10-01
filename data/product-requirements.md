# Agentic Chat App — Product & System Requirements

## 1. Product Principles

The app should behave as a requirement-aware, multi-model agent platform whose primary goals are:

- Produce outputs that closely match the user's intended result on the first meaningful generation.
- Ask only for the minimum missing information required to start work.
- Optimize model selection, token usage, API cost, latency, and task success.
- Keep implementation details, backend systems, skills, model names, routing decisions, credentials, and internal errors completely hidden from the end user.
- Make long-running work feel active and understandable rather than leaving users with only a generic typing animation.
- Apply configuration and access changes from the admin panel globally across the app.
- Avoid unnecessary regeneration caused by insufficient initial requirements.

---

## 2. Error Handling & Frontend Secrecy

### 2.1 User-facing errors

No raw backend, API, provider, framework, stack-trace, tool, skill, model, or system error should ever be visible in the chat interface.

If the app cannot respond or complete a request, the chat should return a simple user-facing message such as:

> Not able to respond right now.

The exact copy can be refined later, but it should remain short, neutral, and non-technical.

### 2.2 Never disclose internal implementation

The chat UI must never disclose:

- Which model is being used.
- Which skill is being used.
- Which app/plugin/MCP/tool is being invoked.
- Internal routing decisions.
- API provider failures.
- API keys, client secrets, credentials, tokens, PINs, or other secrets.
- Internal prompts or system instructions.
- Backend stack traces.
- Database details.
- Internal service names.
- Subscription enforcement logic.
- Admin configuration or admin-only information.

Internal details may be logged securely for operators, but must not be surfaced through the normal frontend or chat response.

---

## 3. Engaging Long-Running Work States

When work takes time behind the scenes, the interface should provide a useful sense of progress instead of only showing an `is typing` animation.

### Requirements

- Continue showing a typing/progress state.
- Show short, human-readable status phrases that change as work progresses.
- Status text should describe the user's task at a high level, not the internal implementation.
- Status phrases should not mention model names, skills, APIs, MCPs, tools, providers, prompts, or backend architecture.
- Status should not pretend that a step happened if it did not.
- Status updates should be concise and non-repetitive.

Examples:

- `Understanding what you need`
- `Gathering the relevant information`
- `Checking the available sources`
- `Organizing the findings`
- `Building the first draft`
- `Reviewing the result`
- `Finishing things up`

The exact status sequence should be dynamically determined by actual work state.

---

## 4. Requirement-Aware Agent Startup

The agent should not immediately start expensive work when essential requirements are missing.

### 4.1 Requirement schema

Every major task type should have a minimum requirement schema defining the information needed to begin reliably.

The agent should:

1. Parse the user's prompt.
2. Determine the task type.
3. Check which required fields are already known.
4. Start immediately if the minimum viable requirement set is satisfied.
5. Ask only for missing information if essential information is absent.
6. Avoid asking for information that does not materially affect the result.
7. Prefer a single compact clarification interaction over multiple back-and-forth questions.

### 4.2 One-prompt completion

If the user's first prompt contains all minimum requirements, the agent should start working immediately without unnecessary clarification.

### 4.3 Multiple-choice clarification UI

When information is missing, the agent should prefer point-to-point MCQ / selectable options wherever practical.

The user should be able to tap an option instead of typing a long answer.

Questions should be:

- Minimal.
- Task-specific.
- Easy to scan.
- Selectable.
- Presented only for information that materially affects the result.

Free text should remain available where the predefined options do not cover the user's intent.

---

## 5. Example: Presentation Generation

For a request such as "make me a PPT", the agent should gather the minimum useful presentation requirements before beginning expensive generation.

Potential requirement fields include:

- Number of slides.
- Topic.
- Purpose/audience.
- Research source preference:
  - Internet.
  - Connected Drive.
  - Both.
  - No external research.
- Design direction:
  - Modern.
  - Professional.
  - Minimal.
  - Corporate.
  - Academic.
  - Creative.
  - Other.
- Content density:
  - Text-light.
  - Balanced.
  - Text-heavy.
- Whether the user has source material.
- Output language, where relevant.
- Any required branding/style constraints.

The agent should not necessarily ask every field. It should ask only what is essential or materially useful for the requested presentation.

The same requirement-schema pattern should be reusable for other task types such as documents, spreadsheets, research, websites, data analysis, image generation, etc.

---

## 6. Input Bar

The input bar should support multiple input modalities without turning audio into ordinary voice typing.

### 6.1 Audio recording

The microphone is positioned at the extreme right of the input bar.

Interaction:

1. First tap: recording starts.
2. Second tap: recording stops.
3. After recording stops, the user can:
   - Play the recording.
   - Delete the recording.
   - Send the recording.

The audio is treated as an audio attachment/file, not merely as voice-to-text input.

### 6.2 Typed input

When the user types content:

- The microphone control should automatically change to a send button.
- The send button sends the typed message.

### 6.3 Camera

The input bar should include a camera button for capturing/attaching images.

### 6.4 Attachments

The input bar should include an attachment button.

The user should be able to attach up to **10 files at a time**.

Supported attachment concepts include:

- Images.
- Audio files.
- Markdown files.
- Text files.
- Other supported documents/files.
- Google Drive resources.
- Google Drive links.
- Specific Google Docs/Sheets/etc. links where supported.

### 6.5 Pasted text

Text pasted directly into chat should be treated internally as a Markdown (`.md`) content object/file for downstream processing where appropriate.

This allows pasted material to participate in the same content-processing pipeline as uploaded Markdown content.

---

## 7. Google Drive / Google Account Connection

The top-right navigation should use a **Settings** link rather than a Logout button.

### 7.1 Settings dropdown

Clicking Settings opens a dropdown containing:

- Connect Google.
- Disconnect Google.
- Login.
- Logout.
- Admin Panel.

Only actions applicable to the current authentication state should be enabled/visible as appropriate.

### 7.2 Google connection flow

Selecting Connect Google should open a dedicated page containing:

- Name field.
- Connect Google Account button.

The Google connection flow should use the appropriate secure OAuth flow.

After successful connection:

- Required Google APIs/scopes are connected.
- Authorized user data can be fetched according to granted scopes.
- The user is redirected back to the chat.

The app must request only the scopes required for the enabled functionality.

Google tokens/secrets must be handled server-side or through secure OAuth mechanisms and must never be exposed in the frontend.

---

## 8. Agent / Model Routing

The platform is intended to support multiple model providers, including:

- OpenAI.
- Anthropic.
- Google Gemini.

The routing system should optimize both quality and cost.

### 8.1 Core objective

For every task, select the cheapest model/provider combination that can successfully satisfy the user's requirements at the required quality level.

"Cheapest" should account for:

- Input-token cost.
- Output-token cost.
- Expected task complexity.
- Expected number of calls.
- Latency.
- Required capabilities.
- Reliability/success probability.
- Tool/API compatibility.
- Context-window requirements.
- Multimodal requirements where relevant.

### 8.2 Task decomposition

A single user prompt may contain multiple distinct tasks.

The router should be able to assign different tasks to different models/providers.

Example:

> Research this topic on the internet, create a Google Sheet, and populate it.

Possible routing:

- One model/service handles research.
- Another handles structured transformation or reasoning.
- Another handles Google Sheets/API interaction.

The actual routing should be determined dynamically based on capability, expected cost, latency, and reliability.

### 8.3 Model selection should be invisible

Users should see the result and useful progress states, but should not see which model/provider was selected.

### 8.4 Token optimization

The system should minimize unnecessary tokens by:

- Using the smallest capable model.
- Avoiding repeated full-context transmission where possible.
- Reusing structured intermediate results.
- Avoiding unnecessary reasoning/generation calls.
- Separating deterministic API operations from language-model work.
- Caching reusable information where safe and appropriate.
- Stopping work as soon as the required result is achieved.
- Avoiding multiple generations caused by incomplete requirements.

---

## 9. Task Orchestration Architecture

The platform should conceptually separate:

1. User intent understanding.
2. Requirement validation.
3. Task decomposition.
4. Model/provider routing.
5. Tool/API execution.
6. Intermediate data transformation.
7. Output generation.
8. Validation.
9. User-facing response.

Not every task requires every stage.

The orchestration layer should select the minimum necessary stages.

### Example

For:

> Research the internet and make a Google Sheet.

The system may:

1. Determine research requirements.
2. Identify sources.
3. Gather structured facts.
4. Normalize the data.
5. Create/update the sheet.
6. Validate the sheet.
7. Return a concise completion message.

The user should not be told which model or internal service performed each stage.

---

## 10. Settings & Authentication UX

The top-right control should be **Settings**, not Logout.

Settings should provide access to account and connection controls without cluttering the chat.

Expected options include:

- Login/logout.
- Google connection/disconnection.
- Admin Panel.

The admin panel must be protected independently from ordinary user functionality.

---

# 11. Admin Panel

## 11.1 Access

The Admin Panel is opened from Settings.

It should open a dedicated admin authentication page/dialog.

Authentication requires:

- Gmail ID.
- PIN.

There must be:

- No demo Gmail placeholder.
- No demo PIN placeholder.
- No administrator credentials displayed in frontend code or UI.
- No administrator credentials embedded in client-side JavaScript.
- No administrator credentials returned by normal API responses.

The sole initial super-admin credentials are to be provisioned securely as backend secrets/configuration and must never appear in the frontend or generated client bundle.

### Security requirements

Administrator authentication should use secure backend verification. PINs should be stored using a strong one-way password/PIN hashing mechanism rather than plaintext storage where possible.

Admin sessions should use secure, expiring authentication/session mechanisms.

Every admin API operation must perform server-side authorization; hiding UI controls is not sufficient.

---

## 11.2 Admin Panel Navigation

The admin panel should contain multiple sections/tabs, including:

- Dashboard.
- Users.
- Skills.
- Apps.
- Admins.
- Credentials.

The exact navigation can be implemented as tabs/sidebar/footer navigation depending on the final UI design.

---

# 12. Dashboard

The dashboard should provide an operational overview.

Potential information:

- Total users.
- Users by subscription tier.
- Active/disabled skills.
- Enabled/disabled apps.
- Provider/API configuration status.
- Usage/cost summaries.
- System health.
- Recent configuration changes.
- Relevant audit information.

Sensitive credentials themselves must never be displayed in the dashboard.

---

# 13. Users

The super admin can:

- Add users.
- Remove users.
- Edit users.
- Identify users by Gmail ID.
- Assign subscription tiers.

Initial subscription tiers:

- Beginner.
- Intermediate.
- Advanced.
- Admin.

The architecture should permit additional tiers later.

User access must be enforced server-side based on the current subscription tier.

---

# 14. Skills

Skills should be organized into categories/departments.

Examples of possible departments:

- Research.
- Writing.
- Presentations.
- Spreadsheets.
- Coding.
- Data Analysis.
- Media.
- Productivity.

These are examples; the final categories should be configurable.

### Skill controls

For every skill:

- Enable.
- Disable.
- Assign to subscription tiers.
- Edit configuration/metadata as permitted.

### Department controls

For an entire category/department:

- Enable for all.
- Disable for all.
- Lock for a specific subscription tier.
- Enable/disable access by tier.

A disabled skill must not be usable through direct API manipulation merely because its frontend control is hidden.

---

# 15. Apps & MCPs

The Apps section should manage integrations and external applications.

### Controls

Apps should support:

- Enable.
- Disable.
- Subscription-tier access.
- Configuration/status visibility for administrators.

### Third-party MCPs

The admin should be able to add/configure third-party app MCPs where supported.

### Unused configured APIs

If an app/API integration has been added to the project but is not currently used by the app, it should still appear in the Apps section with an appropriate disabled/inactive state.

This creates a centralized inventory of available integrations.

---

# 16. Credentials

The Credentials section should centrally manage provider/integration configuration.

Potential credentials/configuration include:

- Gemini API key.
- Anthropic API key.
- OpenAI API key.
- Google OAuth client ID.
- Google OAuth client secret.
- Other provider/integration credentials as the system expands.

### Security requirements

Credentials must:

- Never be rendered in the normal frontend.
- Never be included in chat responses.
- Never be placed in client-side JavaScript.
- Never be exposed in public logs.
- Be encrypted/secured at rest where appropriate.
- Be accessible only to authorized backend services/admin workflows.
- Support rotation.
- Avoid appearing in URLs.
- Be redacted from logs and error messages.

The admin UI may provide secure credential management without exposing existing secret values unnecessarily. Prefer masked values and explicit rotation/replacement workflows.

---

# 17. App MCP Endpoint

The platform should expose an MCP interface so that the app can be used from other MCP-capable environments, such as compatible AI assistants.

The admin Credentials/Integrations area should contain the app's MCP endpoint/link.

Requirements:

- The MCP endpoint must be generated/configured by the deployment environment.
- Do not hardcode or invent a production URL in this specification.
- Authentication and authorization must be enforced.
- Subscription and skill permissions must apply through MCP as well.
- MCP access must not bypass admin/user permissions.
- Sensitive credentials must remain server-side.
- The endpoint should expose only explicitly approved capabilities.

---

# 18. Global Configuration Behavior

Any change made by the super admin must propagate globally across the application.

Examples:

- Disabling a skill disables it wherever that skill is exposed.
- Changing a user's subscription changes their access.
- Disabling an app prevents its use across applicable workflows.
- Changing tier-to-skill mappings affects future authorization checks globally.
- Department-level locks apply globally.

Configuration should have a single authoritative backend source of truth.

Avoid duplicating access-control configuration independently across frontend screens.

---

# 19. Frontend Information Boundary

The frontend/chat interface must never leak:

- Admin credentials.
- Admin PINs.
- API keys.
- OAuth client secrets.
- Internal prompts.
- System instructions.
- Model selection.
- Skill selection.
- Tool names.
- MCP internals.
- Provider-specific error messages.
- Backend stack traces.
- Subscription enforcement implementation.
- Internal routing decisions.
- Internal cost calculations unless explicitly exposed as a future user-facing product feature.

The frontend should receive only the minimum information necessary to render the user experience.

---

# 20. Observability & Internal Logging

Although internal errors are hidden from users, the backend should retain enough diagnostic information for administrators/developers to investigate failures.

Logs should support:

- Request correlation IDs.
- Task lifecycle.
- Provider/API failures.
- Latency.
- Model/provider selection.
- Token usage.
- Estimated cost.
- Tool/API calls.
- Authorization failures.
- Configuration changes.
- Admin actions.

Sensitive information must be redacted.

Do not log:

- Raw API keys.
- OAuth secrets.
- PINs/passwords.
- Access tokens.
- Unnecessary personal data.

---

# 21. Audit Logging

Admin configuration changes should be auditable.

Audit events should record, where appropriate:

- Who made the change.
- What changed.
- Previous non-secret configuration value.
- New non-secret configuration value.
- Timestamp.
- Relevant object/user/skill/app.
- Success/failure.

Secrets should not be copied into audit logs.

---

# 22. Admin Roles

There should be:

- One Super Admin.
- Three subordinate admin hierarchy roles.

The exact names/permissions of the three subordinate roles should be configurable or finalized during implementation.

The super admin can:

- Add an admin by Gmail ID.
- Select the admin role from a dropdown.
- Save the new admin.
- Generate/copy an onboarding PIN.

The PIN delivery mechanism should be handled securely. The PIN must not be displayed to unauthorized users or exposed in normal frontend APIs.

The super admin can:

- Add admins.
- Remove admins.
- Edit admins.
- Change their roles.
- Manage their access.

All subordinate-admin capabilities must be permission-scoped.

---

# 23. Subscription-Based Authorization

Access should be determined centrally by:

`User -> Subscription Tier -> Department/Skill/App permissions`

The system should support:

- Beginner.
- Intermediate.
- Advanced.
- Admin.

Authorization must be enforced server-side for:

- Chat capabilities.
- Skills.
- Apps.
- MCP endpoints.
- API actions.
- File operations.
- Connected-account operations.
- Admin functions.

Frontend controls are presentation only and must not be considered a security boundary.

---

# 24. Cost & Token Optimization Strategy

The orchestration system should optimize for total task cost rather than blindly selecting one provider.

A routing decision should consider:

`Expected total cost = input tokens + output tokens + tool/API calls + retries + expected failure/rework cost`

The cheapest nominal model is not always the cheapest successful route if it causes:

- Failed generations.
- Repeated calls.
- Incorrect outputs.
- Additional validation passes.
- Excessive context.
- Manual/user rework.

Therefore, routing should optimize for **successful completion cost**, subject to quality and capability requirements.

---

# 25. Requirement Collection vs. Token Efficiency

Requirement collection is itself a cost.

The agent should therefore avoid asking unnecessary questions.

Decision rule:

- If the task can be completed reliably with known information → start.
- If one or more critical inputs are missing → ask for only those inputs.
- If several missing inputs can be gathered together → ask in one compact MCQ interaction.
- If a missing detail has a safe/defaultable value → use a sensible default instead of asking.
- If the user's wording establishes a preference → do not ask them again.
- If ambiguity could materially change the final output → ask before expensive work.

---

# 26. User Experience Goal

The user should experience the system as:

1. They describe what they want.
2. The app understands whether it has enough information.
3. If enough information exists, work begins immediately.
4. If something important is missing, the app asks concise selectable questions.
5. The app visibly communicates useful high-level progress while working.
6. The user receives the finished result without being exposed to backend complexity.
7. If the system cannot respond, the user sees a simple human-readable message rather than technical errors.

---

# 27. Acceptance Criteria

## Error handling

- [ ] No raw technical errors appear in chat.
- [ ] Provider/API failures are converted into simple user-facing messages.
- [ ] Stack traces are never sent to the frontend.

## Progress

- [ ] Long-running work has useful changing status text.
- [ ] Status text never reveals models, skills, APIs, MCPs, or internal architecture.
- [ ] Status accurately reflects actual high-level progress.

## Requirement gathering

- [ ] Each major task type has a minimum requirement schema.
- [ ] Complete prompts start immediately.
- [ ] Incomplete prompts produce concise targeted clarification.
- [ ] MCQ/selectable options are used where practical.
- [ ] Unnecessary questions are avoided.

## Input

- [ ] Microphone starts/stops recording with taps.
- [ ] Recorded audio can be played, deleted, or sent.
- [ ] Audio is treated as an attachment rather than ordinary voice typing.
- [ ] Typed input converts microphone control to send.
- [ ] Camera is available.
- [ ] Up to 10 files can be attached at once.
- [ ] Drive links/resources are supported where authorized.
- [ ] Pasted text can be represented internally as Markdown content.

## Routing

- [ ] Multiple model providers can be configured.
- [ ] Routing can select different models for different subtasks.
- [ ] Cheapest successful route is preferred subject to capability requirements.
- [ ] Token and API costs are tracked internally.
- [ ] Model selection is never exposed to ordinary users.

## Settings / Google

- [ ] Settings replaces the top-right Logout control.
- [ ] Settings exposes account and Google connection controls.
- [ ] Google OAuth uses secure server-side handling.
- [ ] Successful connection returns the user to chat.
- [ ] Only necessary Google scopes are requested.

## Admin

- [ ] Admin access is separate from normal chat access.
- [ ] No demo/admin credentials appear in frontend UI or source.
- [ ] Admin authentication is server-side.
- [ ] Admin roles are enforced server-side.
- [ ] Users can be managed by Gmail ID.
- [ ] Subscription tiers are configurable.
- [ ] Skills can be enabled/disabled.
- [ ] Skill departments can be controlled.
- [ ] Apps can be enabled/disabled by tier.
- [ ] Third-party MCPs can be configured.
- [ ] Unused configured integrations appear in the app inventory.
- [ ] Provider credentials can be securely managed.
- [ ] Admin configuration changes propagate globally.
- [ ] Audit logging exists for administrative changes.
- [ ] Secrets are never exposed through chat or normal frontend responses.

## MCP

- [ ] The application has an MCP endpoint.
- [ ] The endpoint is securely authenticated.
- [ ] MCP respects user/subscription/skill permissions.
- [ ] The endpoint is shown in the appropriate admin integration area.
- [ ] No invented production URL is hardcoded into the product specification.

---

# 28. Implementation Note

The exact technologies, model names, APIs, database schema, frontend framework, deployment architecture, and MCP URL should be decided during technical design.

This specification intentionally defines **behavior and security boundaries**, not implementation-specific details.

The system should be designed so that internal implementation can evolve without changing the user's mental model: the user asks for work, supplies only the information that matters, sees useful progress, and receives the result without backend complexity leaking into the experience.


# 29. Chat Lifecycle, Archive & Reuse

## 29.1 Chats are persistent records, not reusable prompts

Chats should be saved persistently, but once a chat reaches a meaningful outcome and is closed/locked, the old chat must not remain directly promptable.

A locked/closed chat:

- Can be opened and read.
- Can be scrolled through.
- Can have its attached documents opened.
- Can have its voice notes played.
- Can be downloaded as an `.md` file.
- Has its input bar locked.
- Cannot receive another user prompt directly.
- Can be used as context for a new chat through a dedicated `Use context in new chat` action.

This separation keeps historical conversations useful as records/context without allowing old conversations to grow indefinitely into increasingly difficult context windows.

---

## 29.2 Chat lifecycle

A chat should move through explicit states, conceptually:

`New → Active → Outcome Proposed → Outcome Confirmed → Locked/Archived`

A chat may also be closed automatically when the system determines that a meaningful outcome has been reached, but the user should have control over confirmation where appropriate.

### Meaningful outcome

At the beginning of a new chat, after seeing the user's first prompt, the agent should determine whether it can reasonably infer a meaningful outcome.

It has three possible paths:

1. **Outcome can be safely inferred**
   - Propose/use that outcome.
   - Continue working toward it.

2. **Outcome is ambiguous but useful options can be suggested**
   - Present a few concise suggested outcomes.
   - Let the user select one.

3. **Outcome cannot reasonably be inferred**
   - Ask the user what a meaningful outcome for the chat should be.

The objective is not to force the user into a rigid workflow. The objective is to prevent conversations from becoming indefinite, oversized, and difficult to comprehend.

---

## 29.3 Outcome pinned at the top

Once the meaningful outcome is decided by the user, it should be pinned at the top-center of the chat in a clearly readable form.

The outcome area should include:

- The meaningful outcome text.
- A **tick/check action**.
- A **continue action**.

The check and continue controls should preferably be icon-only to keep the interface compact.

### Behavior

When the agent believes the meaningful outcome has been achieved:

- The pinned outcome should become visually highlighted.
- It should briefly animate/blink to attract attention.
- The user can tap the check action to confirm completion.
- The user can tap continue to keep the chat active and continue working.

The agent must not lock the chat solely because it believes the outcome was reached when explicit user confirmation is required.

---

## 29.4 Locking a completed chat

When the user confirms the outcome:

- The chat becomes locked.
- The input bar becomes disabled/locked.
- The chat becomes a historical record.
- The final chat state is persisted.
- An `.md` representation of the chat is created.
- The chat receives actions for:
  - Download Markdown.
  - Use context in new chat.
  - Open/view attached documents.
  - Play attached voice notes.

The locked chat remains readable indefinitely unless the user deletes it or retention rules explicitly apply.

---

# 30. Chat Archive

## 30.1 Location

The **Chats Archive** action should live inside the Settings dropdown.

Settings should therefore include, as applicable:

- Account/login controls.
- Google connection controls.
- Chats Archive.
- Delete Chat.
- Incognito Mode.
- Admin Panel.

The exact visibility of account/admin actions should depend on authorization state.

---

## 30.2 Archive page

Tapping Chats Archive opens a full-page chat archive.

Chats should be displayed vertically in a familiar messaging-app style, similar in information density to WhatsApp-style conversation tiles.

Each tile should provide enough information to identify the chat without opening it.

Suggested tile information:

- Chat title / generated short title.
- Meaningful outcome.
- Last activity date/time.
- Duration.
- Message count.
- Attachment indicator.
- Voice-note indicator.
- Locked/completed status.
- Optional source/context indicator.

The archive should be vertically scrollable.

---

## 30.3 Archive filters

Use compact pill-style filters.

Recommended filters:

- All.
- Active.
- Completed.
- Locked.
- With files.
- With voice notes.
- Today.
- This week.
- This month.
- Older.
- Short.
- Long.

Also provide search.

Search should be able to search:

- Chat title.
- Meaningful outcome.
- Chat content.
- Relevant attachment metadata.

Additional filtering can include:

- Date range.
- Chat duration.
- Attachment type.
- Outcome status.

Avoid creating so many filters that the archive becomes harder to use than the chats themselves. Frequently used filters should be immediately visible; advanced filters can live behind a filter control.

---

# 31. Chat Markdown Representation

Every completed/locked chat should have an associated Markdown representation.

The Markdown should preserve enough information to make the chat useful as portable context.

Suggested structure:

```md
# Chat Title

## Meaningful Outcome
...

## Summary
...

## Conversation
### User
...

### Agent
...

## Attachments
- ...

## Voice Notes
- ...

## Final Status
Completed
```

The exact format can evolve, but it should be deterministic and machine-readable.

The Markdown should contain useful conversation/context information without exposing internal prompts, hidden system instructions, model names, tool names, credentials, or other internal implementation details.

---

# 32. "Use Context in New Chat"

A completed/locked chat should have a prominent **Use context in new chat** action.

When selected:

1. Create a new chat.
2. Attach the selected old chat's Markdown representation as context.
3. Keep the old chat unchanged and locked.
4. Let the new chat accept fresh user input.
5. The new agent can use the previous chat context without reopening the old chat for direct prompting.

The user should understand that this creates a **new working conversation**, not a reopening of the old one.

---

# 33. Managing Many Chats and Markdown Files

The system should not make the user manually manage a growing pile of Markdown files.

The recommended rule is:

### Chat is the primary object.

The `.md` file is a generated representation/export/context artifact, not a separate user-facing conversation that needs independent organization.

Therefore:

- The archive remains the primary place to find chats.
- Markdown files should normally be generated/maintained automatically.
- Users should not need to manually create or rename an `.md` file for every chat.
- Downloading Markdown creates a user-owned copy.
- Internal chat Markdown can be regenerated if the chat format evolves.
- The archive should show one chat tile, not separate tiles for the chat and its Markdown file.

### Context reuse

When the user selects `Use context in new chat`, the system should automatically use the relevant internal Markdown/context representation.

The user should not have to find the file manually.

### Search and organization

As the number of chats grows, archive search/filtering should remain the primary discovery mechanism.

---

# 34. Automatic Chat Size / Comprehension Boundary

A chat should not be allowed to grow indefinitely.

The system should monitor whether the conversation is becoming too large or difficult to reliably:

- Read.
- Understand.
- Reference.
- Skim.
- Load.
- Maintain as coherent context.

The system should proactively identify when a chat is approaching a meaningful comprehension/context boundary.

### Preferred behavior

When a chat is approaching that boundary:

1. The agent should work toward a meaningful outcome rather than continuing indefinitely.
2. If a meaningful outcome has already been achieved, suggest/offer completion.
3. If work remains, propose creating a new chat using the current chat's Markdown/context.
4. Preserve the old chat as a historical record.
5. Carry only the useful structured context forward rather than blindly copying an enormous transcript where possible.

The exact technical threshold should be based on context-window size, task complexity, retrieval quality, latency, and cost rather than a fixed message count alone.

---

# 35. Agent Suggests

The input bar should contain an **Agent Suggests** control at the extreme left.

This provides lightweight contextual assistance during active chats.

### 35.1 Suggestion behavior

When appropriate, very small text popups should appear with useful suggestions about what the user could do next.

Suggestions can include:

- Better ways to phrase a request.
- Missing information that would materially improve the result.
- A faster way to complete the current task.
- A recommended next action.
- A warning that the current workflow is causing unnecessary work.
- A specific correction based on a mistake the user is repeatedly making.
- A suggestion to attach a relevant source/document.
- A suggestion to define the desired outcome.
- A suggestion to use an existing chat context rather than restarting from scratch.

### 35.2 Personalization to the current task

Suggestions should be contextual.

They should be based on:

- The current task.
- The current chat state.
- What information is missing.
- Observable workflow mistakes.
- Repeated inefficient actions.
- The selected meaningful outcome.

They should not be generic productivity spam.

### 35.3 Frequency limit

Maximum:

**2 Agent Suggests tips per hour.**

Additional requirements:

- No repeated suggestions.
- No duplicate wording that conveys the same suggestion.
- Suggestions should be meaningfully new and unique.
- If there is no useful new suggestion, show nothing.
- The user can close/dismiss a suggestion.
- Dismissed suggestions should not immediately reappear.

### 35.4 User control

Suggestions should be non-blocking.

They should never:

- Interrupt active work.
- Force a user action.
- Lock the chat.
- Replace the user's prompt.
- Reveal internal system logic.

---

# 36. Chat Continuity Across Sessions

Chat state must persist independently of whether the application is currently open.

If the user:

- Closes the app.
- Shuts down the device.
- Logs out.
- Disconnects Google.
- Returns later.

the saved chat should retain its last persisted state.

When the user returns and opens the relevant chat, the app should restore the conversation to the state it was in when last persisted.

### Important distinction

Google connection state controls whether the user's account-backed chat state is currently accessible.

When the user disconnects Google:

- The user's accessible chat state must be wiped from the active/local application state.
- The user must no longer be able to access those chats while disconnected.
- Cached chat content, derived chat context, searchable chat indexes, and other locally accessible representations must be removed according to the security/data-retention design.
- Disconnecting must not silently create a different or empty replacement account state that later overwrites the user's existing account history.

When the user connects the same Google account again:

- The application should restore the exact same account-backed chat state that existed before disconnection.
- Previously completed/locked chats should reappear in the same state.
- Their associated Markdown/context representations, documents, voice notes, outcomes, archive metadata, and other persisted chat state should be restored as applicable.
- The user's prior chat history should not be duplicated during reconnection.

The system therefore needs a clear separation between:

1. **Account-backed persistent state** — retained securely for restoration after the same account reconnects.
2. **Currently accessible application state/cache** — wiped when Google is disconnected.

The user should experience this as: **disconnect = chats disappear from the app; reconnect the same account = the exact previous chat state returns.**

No chat content should remain accessible through the disconnected session.

---

# 37. Incognito Mode

Incognito Mode is a fundamentally different privacy state from normal chat.

It should be treated as a **temporary, encrypted, session-scoped private workspace**.

## 37.1 Encryption & privacy

Incognito conversation content must be encrypted using an architecture that prevents unauthorized people from reading what was discussed.

Requirements:

- Incognito chat content must be encrypted.
- Incognito content must not be exposed through normal chat history/archive/search.
- Incognito content must not appear in ordinary chat-context reuse.
- Incognito content must not be surfaced through normal analytics, logging, debugging, or admin interfaces.
- Secrets, sensitive conversation content, and private context must be excluded from ordinary operational logs.
- The system should minimize persistence of decrypted/plaintext content.
- Administrative access must not provide a mechanism for reading the user's Incognito conversation content.

The exact cryptographic architecture should be defined during technical design, including key management, encryption boundaries, memory handling, and recovery behavior.

## 37.2 Agent behavior in Incognito Mode

The agent should actively avoid engaging with sensitive topics in Incognito Mode.

If a user moves into a sensitive area, the agent should not provide a detailed response on that sensitive subject.

Instead it should respond with a short, natural diversion such as:

- A brief boundary/dodging line.
- A nearby but safer framing.
- A related question that moves the conversation toward a safer topic.
- A practical suggestion for discussing the broader subject without entering the sensitive details.

The response should remain conversational and useful rather than exposing internal safety rules.

The agent must not tell the user which internal policy, classifier, skill, model, or safety system caused the diversion.

## 37.3 Incognito activation

Incognito Mode can be enabled from Settings.

When Incognito Mode is active:

- The UI should clearly indicate that the user is in Incognito Mode.
- The user can continue reading the current Incognito conversation.
- The current Incognito conversation remains readable while the user remains within the Incognito Mode page/session.
- Locking the device screen does **not** automatically end Incognito Mode.
- If the device is unlocked again while the user remains in the Incognito Mode page/session, the Incognito state remains active.

## 37.4 Automatic exit conditions

Incognito Mode must return to normal mode when either of these occurs:

### A. Another tab/page is opened

If the user opens any other tab/page outside the Incognito Mode page, Incognito Mode ends immediately and the application returns to normal mode.

### B. The application is closed

If the app is closed, Incognito Mode ends.

When the app is opened again, it starts in normal mode.

Therefore:

`Incognito opened → stays active while remaining on Incognito page → screen lock/unlock preserves it → opening another page exits it → closing app exits it → reopening app starts normal`

## 37.5 Incognito chat lifecycle

Incognito chats are not ordinary persistent chats.

The exact temporary-session storage mechanism should be designed so that:

- The user can read the Incognito conversation while the Incognito session remains active.
- It does not enter the normal Chats Archive.
- It is not available as ordinary `Use context in new chat` material.
- It is not recoverable through ordinary chat history after the Incognito session has ended.
- Closing the app ends the Incognito state.
- The normal application opens without Incognito mode active.

The implementation must define secure disposal of Incognito session material after the session ends.

## 37.6 No false privacy promises

The UI should clearly communicate what Incognito Mode actually protects.

The product should not claim absolute privacy beyond what the implemented encryption, storage, operating-system, and infrastructure architecture can genuinely guarantee.

---

# 38. Delete Chat

Settings should provide a **Delete Chat** action.

Deletion should be clearly separated from archiving/locking.

Recommended behavior:

- Require an appropriate confirmation for destructive deletion.
- Delete the chat and its associated internal chat-context artifacts according to the product's retention policy.
- Handle associated uploaded/derived artifacts consistently.
- Ensure deleted content is no longer retrievable through normal archive/search/context flows.
- Do not treat deleting a chat as merely hiding it from the UI.

---

# 39. Recommended Chat Information Architecture

To keep the experience manageable when users have many chats, use this hierarchy:

**Settings**
→ **Chats Archive**
→ Chat tiles
→ Open chat
→ Read / inspect attachments / play voice notes
→ Download Markdown
→ Use context in new chat

A completed chat should not create a separate visible Markdown item in the archive.

The Markdown is an underlying context/export artifact associated with that chat.

---

# 40. Recommended Active Chat Layout

An active chat can contain:

### Top

- Chat title.
- Meaningful outcome pinned in the center/top.
- Outcome check icon.
- Outcome continue icon.

### Main body

- Conversation.
- Attachments.
- Voice notes.
- Progress/status states.

### Bottom input bar

**Left:** Agent Suggests

**Center:** Text input

**Right-side controls:**
- Camera.
- Attach.
- Microphone / Send, depending on input state.

The exact ordering can be adjusted during UI design while preserving the user's requested extreme-left Agent Suggests placement and input controls.

---

# 41. Chat State Acceptance Criteria

- [ ] Chats persist across app shutdown/restart.
- [ ] Chat state survives logout.
- [ ] Chat state survives Google disconnection.
- [ ] Old completed chats are readable but not directly promptable.
- [ ] Locked chats have a disabled input bar.
- [ ] Locked chats remain scrollable.
- [ ] Documents attached to old chats can be opened.
- [ ] Voice notes from old chats can be played.
- [ ] Completed chats have Markdown representations.
- [ ] Markdown can be downloaded.
- [ ] A completed chat can be used as context for a new chat.
- [ ] New context chats do not unlock or modify the old chat.
- [ ] Chats Archive is available through Settings.
- [ ] Archive uses vertical messaging-style tiles.
- [ ] Archive is searchable.
- [ ] Archive has useful pill filters.
- [ ] Meaningful outcomes can be selected/suggested.
- [ ] Meaningful outcome is pinned at the top-center.
- [ ] Outcome achievement is visually highlighted.
- [ ] User can confirm completion.
- [ ] User can continue instead of closing the chat.
- [ ] Chat growth is monitored for comprehension/context boundaries.
- [ ] The system can recommend starting a new context-based chat before a conversation becomes unwieldy.
- [ ] Agent Suggests exists at the extreme left of the input bar.
- [ ] Agent Suggests provides contextual tips.
- [ ] Maximum two tips are shown per hour.
- [ ] Tips are not repeated.
- [ ] Suggestions are dismissible.
- [ ] Incognito Mode is accessible from Settings.
- [ ] Incognito conversations are encrypted.
- [ ] Incognito conversations are excluded from normal archive/search/context flows.
- [ ] Incognito mode remains active through screen lock/unlock while the user remains on the Incognito page.
- [ ] Opening another tab/page exits Incognito Mode.
- [ ] Closing the app exits Incognito Mode.
- [ ] Reopening the app starts in normal mode.
- [ ] Incognito content is not exposed through normal admin/logging interfaces.
- [ ] Sensitive Incognito topics receive short diversion/dodging responses rather than detailed engagement.
- [ ] Delete Chat is accessible from Settings.
- [ ] Disconnecting Google wipes the currently accessible chat state.
- [ ] Reconnecting the same Google account restores the exact previous account-backed chat state.
- [ ] Reconnection does not duplicate or overwrite the user's previous chat state.
