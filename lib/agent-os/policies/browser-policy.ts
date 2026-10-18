/**
 * ResumeForge — Browser Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Defines the future security, ethics, and boundary rules for browser-assisted application execution.
 * (Note: Browser execution implementation is scheduled for Level 13; this policy defines its constraints now).
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext, HandoffRequest } from './types';

export const BROWSER_POLICY_VERSION = '1.3.0';

export const BrowserPolicy: DomainPolicy = {
  id: 'browser-policy',
  name: 'Browser Automation Safety & Compliance Policy',
  version: BROWSER_POLICY_VERSION,
  description: 'Defines strict boundaries for browser automation: Approval Mode required, no CAPTCHA/MFA defeat, no bot bypass, no unauthorized purchases.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { action, browserAction, package: appPackage } = ctx;

    // 1. Guard against autonomous submit without explicit approval
    if (action === 'SUBMIT_WITHOUT_APPROVAL' || (browserAction?.isFinalSubmit && !browserAction?.userApproved)) {
      return {
        allowed: false,
        policyId: 'browser-policy',
        reasonCode: 'POLICY_BLOCKED',
        humanMessage: 'Final employer application submission requires explicit user approval. Autonomous submission without approval is strictly prohibited in Level 13 Approval Mode.',
      };
    }

    // 2. Guard against Autopilot in Level 13
    if (action === 'EXECUTE_AUTOPILOT' || action === 'RUN_AUTONOMOUS_SUBMISSION') {
      return {
        allowed: false,
        policyId: 'browser-policy',
        reasonCode: 'AUTOPILOT_NOT_SUPPORTED_IN_V1',
        humanMessage: 'Background autopilot is out of scope for Level 13. All browser runs operate under explicit candidate Approval Mode.',
      };
    }

    // 3. Guard against CAPTCHA / bot bypass attempts
    if (action === 'BYPASS_CAPTCHA' || action === 'CIRCUMVENT_BOT_PROTECTION') {
      return {
        allowed: false,
        policyId: 'browser-policy',
        reasonCode: 'CAPTCHA_BYPASS_PROHIBITED',
        humanMessage: 'Circumventing CAPTCHA, bot detection, or security challenges is strictly prohibited. Hand off to candidate.',
      };
    }

    if (browserAction) {
      // 1. CAPTCHA / MFA encountered
      if (browserAction.requiresCaptcha || browserAction.requiresMfa) {
        const handoff: HandoffRequest = {
          reason: 'Employer site requires security challenge (CAPTCHA or MFA) completion.',
          question: 'Please complete the verification challenge in the browser window.',
          requiredAction: 'HUMAN_SECURITY_CHALLENGE',
          resumableState: { currentUrl: browserAction.url, formState: browserAction.formState },
        };

        return {
          allowed: false,
          policyId: 'browser-policy',
          reasonCode: 'SECURITY_CHALLENGE_HANDOFF',
          humanMessage: 'Automated CAPTCHA or MFA bypass is strictly prohibited. Handing off to candidate.',
          requiredHandoff: handoff,
        };
      }

      // 2. Unresolved mandatory fields
      if (browserAction.hasUnresolvedMandatoryFields) {
        return {
          allowed: false,
          policyId: 'browser-policy',
          reasonCode: 'UNRESOLVED_FIELDS_SUBMIT_BLOCKED',
          humanMessage: 'Cannot click submit: Mandatory application form fields remain empty or unconfirmed.',
        };
      }

      // 3. Purchase or credit card entry detected on employer site
      if (browserAction.isPurchaseRequest) {
        return {
          allowed: false,
          policyId: 'browser-policy',
          reasonCode: 'FINANCIAL_TRANSACTION_BLOCKED',
          humanMessage: 'Employer form requested payment or purchase. Autonomous agents must never enter payment credentials.',
        };
      }
    }

    return {
      allowed: true,
      policyId: 'browser-policy',
      reasonCode: 'BROWSER_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: BROWSER_POLICY v${BROWSER_POLICY_VERSION}]
- SCOPE OF AUTOMATION: Browser automation may ONLY navigate to approved job apply URLs, read form fields, fill verified answers, upload approved documents, and capture audit evidence.
- NEVER BYPASS PROTECTIONS: Strictly forbidden from bypassing CAPTCHA, defeating MFA, evading bot protection, or hacking access controls.
- HUMAN HANDOFF FOR CHALLENGES: If CAPTCHA, MFA, login approvals, or unrecognized legal terms are encountered, STOP and trigger an immediate human handoff.
- ZERO COMMERCIAL/PURCHASE ACTIONS: Never submit payment info, credit cards, or agree to unexpected financial terms on third-party sites.`;
  },
};
