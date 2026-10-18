/**
 * Greenhouse ATS Mock HTML Fixture
 * Matches typical Greenhouse board DOM structure
 */

export const GREENHOUSE_MOCK_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Razorpay - Backend Engineer Application</title>
</head>
<body>
  <div id="embedded_job_post">
    <h1>Backend Engineer</h1>
    <h2>Razorpay · Bengaluru, India</h2>

    <form id="application_form" action="https://boards.greenhouse.io/razorpay/jobs/123/apply" method="POST" enctype="multipart/form-data">
      <div class="field">
        <label for="first_name">First Name <span class="asterisk">*</span></label>
        <input type="text" id="first_name" name="first_name" required="required" autocomplete="given-name" />
      </div>

      <div class="field">
        <label for="last_name">Last Name <span class="asterisk">*</span></label>
        <input type="text" id="last_name" name="last_name" required="required" autocomplete="family-name" />
      </div>

      <div class="field">
        <label for="email">Email <span class="asterisk">*</span></label>
        <input type="email" id="email" name="email" required="required" autocomplete="email" />
      </div>

      <div class="field">
        <label for="phone">Phone <span class="asterisk">*</span></label>
        <input type="tel" id="phone" name="phone" required="required" autocomplete="tel" />
      </div>

      <div class="field">
        <label for="resume">Resume/CV <span class="asterisk">*</span></label>
        <input type="file" id="resume" name="job_application[resume]" required="required" accept=".pdf,.doc,.docx" />
      </div>

      <div class="field">
        <label for="job_application_answers_attributes_0_text_value">LinkedIn Profile</label>
        <input type="url" id="job_application_answers_attributes_0_text_value" name="job_application[answers_attributes][0][text_value]" placeholder="https://linkedin.com/in/..." />
      </div>

      <div class="field">
        <label for="job_application_answers_attributes_1_text_value">GitHub Profile / Portfolio URL</label>
        <input type="url" id="job_application_answers_attributes_1_text_value" name="job_application[answers_attributes][1][text_value]" placeholder="https://github.com/..." />
      </div>

      <div class="field">
        <label>Will you now or in the future require sponsorship for employment visa status? <span class="asterisk">*</span></label>
        <div class="options">
          <label><input type="radio" name="job_application[answers_attributes][2][boolean_value]" value="true" required="required" /> Yes</label>
          <label><input type="radio" name="job_application[answers_attributes][2][boolean_value]" value="false" required="required" /> No</label>
        </div>
      </div>

      <div class="field">
        <label for="notice_period">What is your notice period (in days)? <span class="asterisk">*</span></label>
        <input type="text" id="notice_period" name="job_application[answers_attributes][3][text_value]" required="required" />
      </div>

      <div class="field">
        <label for="gender">Gender Identity (Voluntary Self-Identification)</label>
        <select id="gender" name="job_application[demographics][gender]">
          <option value="">Select...</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non_binary">Non-binary</option>
          <option value="decline">Decline to self-identify</option>
        </select>
      </div>

      <div class="actions">
        <input type="submit" id="submit_app" value="Submit Application" class="button" />
      </div>
    </form>
  </div>
</body>
</html>
`;

export const GREENHOUSE_SUBMISSION_SUCCESS_HTML = `
<!DOCTYPE html>
<html lang="en">
<head><title>Thank you for applying</title></head>
<body>
  <div id="application_confirmation">
    <h1>Thank you for applying to Razorpay!</h1>
    <p>We've received your application for the Backend Engineer position.</p>
    <p>Application ID: <strong>GH-98234-IN</strong></p>
  </div>
</body>
</html>
`;
