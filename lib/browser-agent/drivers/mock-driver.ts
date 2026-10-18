/**
 * Mock Browser Driver for Deterministic Testing & Safe Local Simulation
 * Implements BrowserDriver interface without spawning external binaries
 */

import type {
  BrowserDriver,
  BrowserSession,
  BrowserSessionOptions,
  PageState,
  DetectedField,
  DetectedButton,
  FormInspectionResult,
  UploadFilePayload,
  AtsProvider,
} from '../types';
import {
  GREENHOUSE_MOCK_HTML,
  GREENHOUSE_SUBMISSION_SUCCESS_HTML,
  LEVER_MOCK_HTML,
  LEVER_SUBMISSION_SUCCESS_HTML,
  ASHBY_MOCK_HTML,
  ASHBY_SUBMISSION_SUCCESS_HTML,
  GENERIC_FORM_MOCK_HTML,
  GENERIC_SUBMISSION_SUCCESS_HTML,
} from '../fixtures';

interface MockSessionState {
  session: BrowserSession;
  url: string;
  html: string;
  provider: AtsProvider;
  filledFields: Record<string, any>;
  uploadedFiles: Record<string, UploadFilePayload>;
  isSubmitted: boolean;
  submitButtonText?: string;
}

export class MockBrowserDriver implements BrowserDriver {
  private sessions = new Map<string, MockSessionState>();

  async createSession(options?: BrowserSessionOptions): Promise<BrowserSession> {
    const sessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const session: BrowserSession = {
      sessionId,
      userId: options?.userId,
      createdAt: Date.now(),
      active: true,
      driverMetadata: { driver: 'MockBrowserDriver' },
    };

    this.sessions.set(sessionId, {
      session,
      url: 'about:blank',
      html: '',
      provider: 'GENERIC_FORM',
      filledFields: {},
      uploadedFiles: {},
      isSubmitted: false,
    });

    return session;
  }

  async open(session: BrowserSession, url: string): Promise<PageState> {
    const state = this.sessions.get(session.sessionId);
    if (!state) throw new Error(`Session ${session.sessionId} not found`);

    state.url = url;
    session.currentUrl = url;

    // Detect ATS fixture to load based on URL or keywords
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('captcha')) {
      state.html = `
        <html><body>
          <h1>Security Verification Required</h1>
          <form id="apply">
            <input type="text" name="name" required />
            <div class="g-recaptcha" data-sitekey="mock-key">Please verify you are human</div>
            <button type="submit">Submit</button>
          </form>
        </body></html>
      `;
      state.provider = 'GENERIC_FORM';
    } else if (lowerUrl.includes('login') || lowerUrl.includes('auth') || lowerUrl.includes('mfa')) {
      state.html = `
        <html><body>
          <h1>Sign In to Apply</h1>
          <p>Please enter your credentials or authenticate via SSO to access this employer portal.</p>
          <form id="login-form"><input type="email" name="user" /><button type="submit">Sign In</button></form>
        </body></html>
      `;
      state.provider = 'UNSUPPORTED';
    } else if (lowerUrl.includes('greenhouse') || lowerUrl.includes('grnh.se')) {
      state.html = GREENHOUSE_MOCK_HTML;
      state.provider = 'GREENHOUSE';
    } else if (lowerUrl.includes('lever.co') || lowerUrl.includes('lever')) {
      state.html = LEVER_MOCK_HTML;
      state.provider = 'LEVER';
    } else if (lowerUrl.includes('ashbyhq.com') || lowerUrl.includes('ashby')) {
      state.html = ASHBY_MOCK_HTML;
      state.provider = 'ASHBY';
    } else {
      state.html = GENERIC_FORM_MOCK_HTML;
      state.provider = 'GENERIC_FORM';
    }

    return {
      url,
      title: this.extractTitle(state.html),
      html: state.html,
      hasForm: state.html.includes('<form'),
      readyState: 'complete',
    };
  }

  async getPageState(session: BrowserSession): Promise<PageState> {
    const state = this.sessions.get(session.sessionId);
    if (!state) throw new Error(`Session ${session.sessionId} not found`);

    return {
      url: state.url,
      title: this.extractTitle(state.html),
      html: state.html,
      hasForm: state.html.includes('<form'),
      readyState: 'complete',
    };
  }

  async inspectForm(session: BrowserSession): Promise<FormInspectionResult> {
    const state = this.sessions.get(session.sessionId);
    if (!state) throw new Error(`Session ${session.sessionId} not found`);

    const html = state.html;

    // 1. CAPTCHA detection
    const captchaDetected =
      html.includes('g-recaptcha') ||
      html.includes('h-captcha') ||
      html.includes('cf-turnstile') ||
      html.includes('data-sitekey') ||
      html.toLowerCase().includes('security check');

    // 2. Auth / MFA / Login detection
    const mfaOrAuthRequired =
      html.toLowerCase().includes('sign in to apply') ||
      html.toLowerCase().includes('login to your account') ||
      html.toLowerCase().includes('enter two-factor code') ||
      html.toLowerCase().includes('workday.com') ||
      html.toLowerCase().includes('sso authentication');

    // 3. Account creation required
    const hasAccountCreation =
      html.toLowerCase().includes('create an account to apply') ||
      html.toLowerCase().includes('password must contain');

    // 4. Form fields extraction
    const fields = this.parseFieldsFromHtml(html);

    // 5. Buttons extraction
    const buttons = this.parseButtonsFromHtml(html);

    return {
      formFound: fields.length > 0 || html.includes('<form'),
      formSelector: 'form',
      fields,
      buttons,
      captchaDetected,
      mfaOrAuthRequired,
      hasAccountCreation,
      providerHint: state.provider,
    };
  }

  async fillField(session: BrowserSession, selector: string, value: any): Promise<boolean> {
    const state = this.sessions.get(session.sessionId);
    if (!state) return false;

    state.filledFields[selector] = value;
    return true;
  }

  async selectOption(session: BrowserSession, selector: string, value: string): Promise<boolean> {
    const state = this.sessions.get(session.sessionId);
    if (!state) return false;

    state.filledFields[selector] = value;
    return true;
  }

  async uploadFile(session: BrowserSession, selector: string, file: UploadFilePayload): Promise<boolean> {
    const state = this.sessions.get(session.sessionId);
    if (!state) return false;

    state.uploadedFiles[selector] = file;
    state.filledFields[selector] = file.filename;
    return true;
  }

  async click(session: BrowserSession, selector: string): Promise<boolean> {
    const state = this.sessions.get(session.sessionId);
    if (!state) return false;

    const lowerSel = selector.toLowerCase();
    const isSubmit =
      lowerSel.includes('submit') ||
      lowerSel.includes('apply') ||
      lowerSel.includes('button[type="submit"]');

    if (isSubmit) {
      state.isSubmitted = true;
      // Transition HTML to corresponding confirmation fixture
      if (state.provider === 'GREENHOUSE') {
        state.html = GREENHOUSE_SUBMISSION_SUCCESS_HTML;
        state.url = `${state.url}/confirmation`;
      } else if (state.provider === 'LEVER') {
        state.html = LEVER_SUBMISSION_SUCCESS_HTML;
        state.url = `${state.url}/thanks`;
      } else if (state.provider === 'ASHBY') {
        state.html = ASHBY_SUBMISSION_SUCCESS_HTML;
        state.url = `${state.url}/submitted`;
      } else {
        state.html = GENERIC_SUBMISSION_SUCCESS_HTML;
        state.url = `${state.url}/success`;
      }
    }

    return true;
  }

  async captureScreenshot(_session: BrowserSession): Promise<string | null> {
    // Return minimal 1x1 transparent PNG data URI for lightweight audit evidence
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }

  async getCurrentUrl(session: BrowserSession): Promise<string> {
    const state = this.sessions.get(session.sessionId);
    return state ? state.url : 'about:blank';
  }

  async closeSession(session: BrowserSession): Promise<void> {
    session.active = false;
    this.sessions.delete(session.sessionId);
  }

  /**
   * Helper to set custom HTML fixture for testing.
   */
  setHtmlForSession(sessionId: string, html: string, provider: AtsProvider = 'GENERIC_FORM') {
    const state = this.sessions.get(sessionId);
    if (state) {
      state.html = html;
      state.provider = provider;
    }
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title>([^<]*)<\/title>/i);
    return match ? match[1].trim() : 'Application';
  }

  private parseFieldsFromHtml(html: string): DetectedField[] {
    const fields: DetectedField[] = [];
    const inputRegex = /<input\s+([^>]*?)>/gi;
    let match: RegExpExecArray | null;

    while ((match = inputRegex.exec(html)) !== null) {
      const attrs = match[1];
      const typeMatch = attrs.match(/type=["']([^"']*)["']/i);
      const nameMatch = attrs.match(/name=["']([^"']*)["']/i);
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      const required = attrs.includes('required');

      const rawType = typeMatch ? typeMatch[1].toLowerCase() : 'text';
      if (rawType === 'hidden' || rawType === 'submit') continue;
      const type = (['number', 'email', 'phone', 'url', 'date', 'select', 'radio', 'checkbox', 'textarea', 'file'].includes(rawType)
        ? rawType
        : 'text') as DetectedField['type'];

      const name = nameMatch ? nameMatch[1] : '';
      const id = idMatch ? idMatch[1] : '';
      const selector = id ? `#${id}` : name ? `input[name="${name}"]` : 'input';

      // Find nearby label
      const label = this.findLabelFor(html, id, name);

      if (type === 'radio' && name) {
        const existingRadio = fields.find((f) => f.name === name && f.type === 'radio');
        if (existingRadio) {
          const valMatch = attrs.match(/value=["']([^"']*)["']/i);
          if (valMatch && existingRadio.options) {
            existingRadio.options.push(valMatch[1]);
          }
          continue;
        }
      }

      fields.push({
        id,
        name,
        label: label || name || id || 'Input field',
        selector,
        type: ['email', 'tel', 'url', 'number', 'file', 'radio', 'checkbox'].includes(type) ? type : 'text',
        required,
        options: type === 'radio' ? [attrs.match(/value=["']([^"']*)["']/i)?.[1] || ''] : undefined,
        sensitive: this.isSensitiveField(name, label),
      });
    }

    // Textareas
    const textareaRegex = /<textarea\s+([^>]*?)>/gi;
    while ((match = textareaRegex.exec(html)) !== null) {
      const attrs = match[1];
      const nameMatch = attrs.match(/name=["']([^"']*)["']/i);
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      const required = attrs.includes('required');
      const name = nameMatch ? nameMatch[1] : '';
      const id = idMatch ? idMatch[1] : '';
      const selector = id ? `#${id}` : name ? `textarea[name="${name}"]` : 'textarea';
      const label = this.findLabelFor(html, id, name);

      fields.push({
        id,
        name,
        label: label || name || id || 'Text Area',
        selector,
        type: 'textarea',
        required,
        sensitive: false,
      });
    }

    // Selects
    const selectRegex = /<select\s+([^>]*?)>([\s\S]*?)<\/select>/gi;
    while ((match = selectRegex.exec(html)) !== null) {
      const attrs = match[1];
      const optionsHtml = match[2];
      const nameMatch = attrs.match(/name=["']([^"']*)["']/i);
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      const required = attrs.includes('required');
      const name = nameMatch ? nameMatch[1] : '';
      const id = idMatch ? idMatch[1] : '';
      const selector = id ? `#${id}` : name ? `select[name="${name}"]` : 'select';
      const label = this.findLabelFor(html, id, name);

      const options: string[] = [];
      const optRegex = /<option[^>]*>([^<]*)<\/option>/gi;
      let optMatch: RegExpExecArray | null;
      while ((optMatch = optRegex.exec(optionsHtml)) !== null) {
        const text = optMatch[1].trim();
        if (text && text !== 'Select...') options.push(text);
      }

      fields.push({
        id,
        name,
        label: label || name || id || 'Dropdown Select',
        selector,
        type: 'select',
        required,
        options,
        sensitive: this.isSensitiveField(name, label),
      });
    }

    return fields;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private findLabelFor(html: string, id: string, name: string): string {
    if (id) {
      const safeId = this.escapeRegex(id);
      const labelMatch = new RegExp(`<label[^>]*for=["']${safeId}["'][^>]*>([\\s\\S]*?)<\\/label>`, 'i').exec(html);
      if (labelMatch) {
        return this.cleanHtml(labelMatch[1]);
      }
    }
    if (name) {
      const nameIndex = html.indexOf(`name="${name}"`);
      if (nameIndex !== -1) {
        const beforeHtml = html.substring(Math.max(0, nameIndex - 400), nameIndex);
        const allLabels: RegExpExecArray[] = [];
        const labelRegex = /<label[^>]*>([\s\S]*?)<\/label>/gi;
        let lMatch: RegExpExecArray | null;
        while ((lMatch = labelRegex.exec(beforeHtml)) !== null) {
          allLabels.push(lMatch);
        }

        if (allLabels.length > 0) {
          let chosen = allLabels[allLabels.length - 1][1];
          const cleanedChosen = this.cleanHtml(chosen).toLowerCase();
          if ((cleanedChosen === 'yes' || cleanedChosen === 'no') && allLabels.length > 1) {
            chosen = allLabels[allLabels.length - 2][1];
          }
          return this.cleanHtml(chosen);
        }
      }
    }
    return '';
  }

  private cleanHtml(text: string): string {
    return text.replace(/<[^>]*>/g, '').replace(/\*/g, '').trim();
  }

  private isSensitiveField(name: string, label: string): boolean {
    const combined = `${name} ${label}`.toLowerCase();
    return (
      combined.includes('sponsor') ||
      combined.includes('visa') ||
      combined.includes('citizen') ||
      combined.includes('authorized to work') ||
      combined.includes('gender') ||
      combined.includes('race') ||
      combined.includes('ethnicity') ||
      combined.includes('veteran') ||
      combined.includes('disability') ||
      combined.includes('criminal') ||
      combined.includes('background check')
    );
  }

  private parseButtonsFromHtml(html: string): DetectedButton[] {
    const buttons: DetectedButton[] = [];
    const buttonRegex = /<(?:button|input)[^>]*?(?:type=["'](submit|button)["'])?[^>]*?>/gi;
    let match: RegExpExecArray | null;

    while ((match = buttonRegex.exec(html)) !== null) {
      const tag = match[0];
      const isSubmit = tag.includes('type="submit"') || tag.toLowerCase().includes('submit') || tag.toLowerCase().includes('apply');
      const textMatch = tag.match(/value=["']([^"']*)["']/i) || tag.match(/>([^<]*)</);
      const text = textMatch ? textMatch[1].trim() : isSubmit ? 'Submit' : 'Button';

      buttons.push({
        text,
        selector: tag.includes('id="') ? `#${tag.match(/id=["']([^"']*)["']/i)![1]}` : 'button[type="submit"]',
        type: isSubmit ? 'SUBMIT' : 'NAVIGATION',
        isFinalSubmit: isSubmit,
      });
    }

    return buttons;
  }
}
