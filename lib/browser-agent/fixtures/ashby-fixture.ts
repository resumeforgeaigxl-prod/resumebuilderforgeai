/**
 * Ashby ATS Mock HTML Fixture
 * Matches typical Ashby application page structure
 */

export const ASHBY_MOCK_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Vercel - Senior Software Engineer (Ashby)</title>
</head>
<body>
  <div id="ashby-application-container">
    <header>
      <h1>Senior Software Engineer</h1>
      <p>Vercel · Remote</p>
    </header>

    <form data-ashby-application-form="true" id="ashby-form" action="https://jobs.ashbyhq.com/vercel/55412/application" method="POST" enctype="multipart/form-data">
      <div class="ashby-field" data-field-id="name">
        <label for="name-input">Full Name <span class="required-mark">*</span></label>
        <input type="text" id="name-input" name="_system_field_name" required="required" autocomplete="name" />
      </div>

      <div class="ashby-field" data-field-id="email">
        <label for="email-input">Email Address <span class="required-mark">*</span></label>
        <input type="email" id="email-input" name="_system_field_email" required="required" autocomplete="email" />
      </div>

      <div class="ashby-field" data-field-id="phone">
        <label for="phone-input">Phone Number <span class="required-mark">*</span></label>
        <input type="tel" id="phone-input" name="_system_field_phoneNumber" required="required" autocomplete="tel" />
      </div>

      <div class="ashby-field" data-field-id="resume">
        <label for="resume-input">Resume <span class="required-mark">*</span></label>
        <input type="file" id="resume-input" name="_system_field_resume" required="required" accept=".pdf,.doc,.docx" />
      </div>

      <div class="ashby-field" data-field-id="linkedin">
        <label for="linkedin-input">LinkedIn</label>
        <input type="url" id="linkedin-input" name="field_social_linkedin" placeholder="https://linkedin.com/in/..." />
      </div>

      <div class="ashby-field" data-field-id="github">
        <label for="github-input">GitHub</label>
        <input type="url" id="github-input" name="field_social_github" placeholder="https://github.com/..." />
      </div>

      <div class="ashby-field" data-field-id="sponsorship">
        <label>Will you require employment visa sponsorship now or in the future? <span class="required-mark">*</span></label>
        <div class="radio-group">
          <label><input type="radio" name="custom_question_sponsorship" value="Yes" required="required" /> Yes</label>
          <label><input type="radio" name="custom_question_sponsorship" value="No" required="required" /> No</label>
        </div>
      </div>

      <div class="ashby-field" data-field-id="notice">
        <label for="notice-input">Expected Notice Period (weeks) <span class="required-mark">*</span></label>
        <input type="text" id="notice-input" name="custom_question_notice" required="required" />
      </div>

      <div class="form-footer">
        <button type="submit" data-qa="submit-application-button" id="ashby-submit" class="submit-btn">Submit Application</button>
      </div>
    </form>
  </div>
</body>
</html>
`;

export const ASHBY_SUBMISSION_SUCCESS_HTML = `
<!DOCTYPE html>
<html lang="en">
<head><title>We've received your application</title></head>
<body>
  <div data-qa="application-submitted-container">
    <h2>We've received your application!</h2>
    <p>Thank you for applying to Vercel. Our talent team will review your qualifications shortly.</p>
  </div>
</body>
</html>
`;
